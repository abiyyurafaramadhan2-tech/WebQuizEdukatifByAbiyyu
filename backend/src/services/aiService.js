// QuizGenius AI Service — © Abiyyu Rafa Ramadhan
const CATEGORY_META = {
  school: { subjects: { math:'Matematika', science:'IPA', social:'IPS', indonesian:'Bahasa Indonesia', english:'Bahasa Inggris', history:'Sejarah', civics:'PKN', biology:'Biologi', chemistry:'Kimia', physics:'Fisika', economics:'Ekonomi', geography:'Geografi' } },
  utbk: { subCategories: { TPS:'TPS UTBK', Literasi:'Literasi UTBK', Penalaran:'Penalaran Matematika UTBK' } },
  tpa: { subCategories: { Verbal:'TPA Verbal', Numerik:'TPA Numerik', Logika:'TPA Logika', Spasial:'TPA Spasial' } },
  skd: { subCategories: { TWK:'TWK CPNS', TIU:'TIU CPNS', TKP:'TKP CPNS' } },
};

function buildPrompt({ category, classLevel, subject, subCategory, difficulty, count }) {
  let context = '';
  if (category === 'school') {
    const name = CATEGORY_META.school.subjects[subject] || subject || 'Umum';
    context = `${name} kelas ${classLevel || '1'}`;
  } else {
    context = subCategory || category || 'Umum';
  }
  const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
  return `Buat ${count || 20} soal pilihan ganda: ${context}. Tingkat: ${diffMap[difficulty] || 'mudah'}. 
  Balas HANYA JSON murni: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"B","explanation":"...","topic":"..."}]}`;
}

async function callOpenRouter(prompt) {
  // PAKSA BERSIHKAN SEMUA DARI PETIK RAILWAY
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  const model = (process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free').replace(/['"]+/g, '').trim();

  if (!apiKey || apiKey === '') throw new Error('API_KEY_KOSONG');

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

  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt) {
  const apiKey = (process.env.GEMINI_API_KEY || '').replace(/['"]+/g, '').trim();
  if (!apiKey) throw new Error('GEMINI_KEY_KOSONG');
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON_NOT_FOUND');
  const data = JSON.parse(match[0]);
  return data.questions.map((q, i) => ({
    ...q, id: i + 1, answered: null, isCorrect: null
  }));
}

async function generateQuestions(params) {
  const provider = (process.env.AI_PROVIDER || 'openrouter').replace(/['"]+/g, '').trim();
  console.log(`[QUIZ] Start - Provider: ${provider}`);

  let raw;
  try {
    // JALUR UTAMA
    if (provider === 'openrouter') {
      raw = await callOpenRouter(buildPrompt(params));
    } else {
      raw = await callGemini(buildPrompt(params));
    }
  } catch (err) {
    console.error(`[QUIZ] Error ${provider}: ${err.message}`);
    // FALLBACK OTOMATIS: Kalau OpenRouter gagal, coba Gemini (atau sebaliknya)
    try {
      console.log(`[QUIZ] Mencoba Fallback...`);
      raw = (provider === 'openrouter') 
        ? await callGemini(buildPrompt(params)) 
        : await callOpenRouter(buildPrompt(params));
    } catch (fallbackErr) {
      throw new Error(`Semua provider gagal: ${fallbackErr.message}`);
    }
  }

  return parseQuestions(raw, params.count || 20);
}

module.exports = { generateQuestions, CATEGORY_META };
