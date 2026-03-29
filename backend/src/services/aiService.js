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

  const diffMap = {
    1: 'mudah, konsep dasar',
    2: 'sedang, perlu pemahaman',
    3: 'sulit, analitis',
  };

  return `Buat ${count} soal pilihan ganda untuk: ${context}
Tingkat: ${diffMap[difficulty] || diffMap[1]}

Balas HANYA JSON ini tanpa teks lain:
{"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"B","explanation":"...","topic":"..."}]}

Aturan:
- Tepat ${count} soal berbeda
- Bahasa Indonesia
- Semua pilihan masuk akal
- Kunci jawaban bervariasi (bukan selalu A)
- JSON valid saja`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model  = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) throw new Error('GEMINI_API_KEY belum diisi');

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

  if (!text) throw new Error('Gemini tidak mengembalikan teks');
  return text;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY belum diisi');

  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const res = await fetch(baseURL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

function parseQuestions(raw, count) {
  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Tidak ada JSON valid dalam respons AI');
    data = JSON.parse(match[0]);
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Format JSON tidak sesuai');
  }

  return data.questions.slice(0, count).map((q, i) => ({
    id: i + 1,
    question: String(q.question || `Soal ${i + 1}`),
    options: {
      A: String(q.options?.A || 'Pilihan A'),
      B: String(q.options?.B || 'Pilihan B'),
      C: String(q.options?.C || 'Pilihan C'),
      D: String(q.options?.D || 'Pilihan D'),
    },
    correct: String(q.correct || 'A').toUpperCase(),
    explanation: String(q.explanation || ''),
    topic: String(q.topic || ''),
    answered: null,
    isCorrect: null,
  }));
}

async function generateQuestions(params) {
  const count = params.count || parseInt(process.env.QUIZ_QUESTIONS_COUNT) || 20;
  const prompt = buildPrompt({ ...params, count });
  const provider = process.env.AI_PROVIDER || 'gemini';

  console.log(`[AI] Generate ${count} soal - provider: ${provider}`);

  let raw;
  try {
    raw = provider === 'openai'
      ? await callOpenAI(prompt)
      : await callGemini(prompt);
  } catch (err) {
    console.error('[AI] Error:', err.message);
    throw err;
  }

  const questions = parseQuestions(raw, count);
  console.log(`[AI] Berhasil generate ${questions.length} soal`);
  return questions;
}

async function explainWrong({ question, correct, wrong }) {
  const prompt = `Kamu tutor AI yang lucu. Siswa menjawab salah:
Soal: ${question}
Benar: ${correct}
Jawaban siswa: ${wrong}

Tulis 2 kalimat penjelasan Bahasa Indonesia kasual + emoji semangat.`;

  try {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const raw = provider === 'openai'
      ? await callOpenAI(prompt)
      : await callGemini(prompt);
    return raw.trim();
  } catch {
    return `Hampir! Jawaban benarnya: "${correct}". Tetap semangat! 💪`;
  }
}

module.exports = { generateQuestions, explainWrong, CATEGORY_META };
