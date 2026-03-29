// QuizGenius AI Service — © Abiyyu Rafa Ramadhan
const CATEGORY_META = {
  school: {
    subjects: {
      math:'Matematika', science:'IPA', social:'IPS',
      indonesian:'Bahasa Indonesia', english:'Bahasa Inggris',
      history:'Sejarah', civics:'PKN', biology:'Biologi',
      chemistry:'Kimia', physics:'Fisika',
      economics:'Ekonomi', geography:'Geografi',
    },
  },
  utbk: {
    subCategories: {
      TPS:'Tes Potensi Skolastik UTBK',
      Literasi:'Literasi UTBK',
      Penalaran:'Penalaran Matematika UTBK',
    },
  },
  tpa: {
    subCategories: {
      Verbal:'TPA Verbal',
      Numerik:'TPA Numerik',
      Logika:'TPA Logika',
      Spasial:'TPA Spasial',
    },
  },
  skd: {
    subCategories: {
      TWK:'TWK CPNS',
      TIU:'TIU CPNS',
      TKP:'TKP CPNS',
    },
  },
};

function buildPrompt({ category, classLevel, subject, subCategory, difficulty, count }) {
  let context = '';
  if (category === 'school') {
    const name = CATEGORY_META.school.subjects[subject] || subject;
    context = `${name} kelas ${classLevel} (Kurikulum Merdeka Indonesia)`;
  } else if (category === 'utbk') {
    context = CATEGORY_META.utbk.subCategories[subCategory] || subCategory;
  } else if (category === 'tpa') {
    context = CATEGORY_META.tpa.subCategories[subCategory] || subCategory;
  } else if (category === 'skd') {
    context = CATEGORY_META.skd.subCategories[subCategory] || subCategory;
  }

  const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };

  return `Buat ${count} soal pilihan ganda untuk: ${context}. Tingkat: ${diffMap[difficulty] || diffMap[1]}.
Balas HANYA JSON: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"B","explanation":"...","topic":"..."}]}
Aturan: Bahasa Indonesia, JSON valid saja.`;
}

async function callOpenRouter(prompt) {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  const model = (process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free').replace(/['"]+/g, '').trim();

  if (!apiKey) throw new Error('API Key OpenRouter kosong. Cek Railway Variables!');

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  if (!content) throw new Error('OpenRouter tidak mengembalikan teks soal.');
  return content;
}

async function callGemini(prompt) {
  const apiKey = (process.env.GEMINI_API_KEY || '').replace(/['"]+/g, '').trim();
  const model  = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').replace(/['"]+/g, '').trim();
  
  if (!apiKey) throw new Error('API Key Gemini kosong.');
  
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseQuestions(raw, count) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI tidak memberikan format JSON yang benar.');
    data = JSON.parse(match[0]);
  }
  return data.questions.slice(0, count).map((q, i) => ({
    ...q, 
    id: i + 1, 
    answered: null, 
    isCorrect: null,
    options: q.options || { A: '?', B: '?', C: '?', D: '?' }
  }));
}

async function generateQuestions(params) {
  try {
    const count = params.count || parseInt(process.env.QUIZ_QUESTIONS_COUNT) || 20;
    const prompt = buildPrompt({ ...params, count });
    
    // Cuci bersih petik dari Railway
    const provider = (process.env.AI_PROVIDER || 'gemini').replace(/['"]+/g, '').trim();

    console.log(`[AI] Memulai generate dengan provider: ${provider}`);

    let raw;
    if (provider === 'openrouter') {
      raw = await callOpenRouter(prompt);
    } else {
      raw = await callGemini(prompt);
    }

    return parseQuestions(raw, count);
  } catch (err) {
    console.error('[AI FATAL ERROR]:', err.message);
    throw err;
  }
}

async function explainWrong({ question, correct, wrong }) {
  const prompt = `Jelaskan singkat kenapa salah. Soal: ${question}, Benar: ${correct}, Jawaban siswa: ${wrong}. Max 2 kalimat.`;
  const provider = (process.env.AI_PROVIDER || 'gemini').replace(/['"]+/g, '').trim();
  try {
    const raw = provider === 'openrouter' ? await callOpenRouter(prompt) : await callGemini(prompt);
    return raw.trim();
  } catch {
    return `Jawaban benarnya: ${correct}. Semangat! 💪`;
  }
}

module.exports = { generateQuestions, explainWrong, CATEGORY_META };
