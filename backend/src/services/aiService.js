const fetch = require('node-fetch'); // SAYA SUDAH TAMBAHKAN INI UNTUKMU

const CATEGORY_META = {
  school: { subjects: { math:'Matematika', science:'IPA', social:'IPS', indonesian:'Bahasa Indonesia', english:'Bahasa Inggris', history:'Sejarah', civics:'PKN', biology:'Biologi', chemistry:'Kimia', physics:'Fisika', economics:'Ekonomi', geography:'Geografi' } },
  utbk: { subCategories: { TPS:'TPS UTBK', Literasi:'Literasi UTBK', Penalaran:'Penalaran Matematika UTBK' } },
  tpa: { subCategories: { Verbal:'TPA Verbal', Numerik:'TPA Numerik', Logika:'TPA Logika', Spasial:'TPA Spasial' } },
  skd: { subCategories: { TWK:'TWK CPNS', TIU:'TIU CPNS', TKP:'TKP CPNS' } },
};

function buildPrompt({ category, classLevel, subject, subCategory, difficulty, count }) {
  let context = (category === 'school') ? (CATEGORY_META.school.subjects[subject] || subject || 'Umum') + ` kelas ${classLevel || 'SMA'}` : (subCategory || category || 'Umum');
  const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
  return `Buat ${count || 20} soal pilihan ganda (A,B,C,D) Bahasa Indonesia: ${context}. Tingkat: ${diffMap[difficulty] || 'sedang'}. Balas HANYA JSON: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","topic":"..."}]}`;
}

async function callOpenRouter(prompt) {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  const model = (process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free').replace(/['"]+/g, '').trim();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'https://webquizbybiyu.up.railway.app' },
    body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function generateQuestions(params) {
  const provider = (process.env.AI_PROVIDER || 'openrouter').replace(/['"]+/g, '').trim();
  const raw = await callOpenRouter(buildPrompt(params));
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const data = JSON.parse(cleaned.match(/\{[\s\S]*\}/)[0]);
  return data.questions.map((q, i) => ({ ...q, id: i + 1, answered: null, isCorrect: null }));
}

module.exports = { generateQuestions, CATEGORY_META };
