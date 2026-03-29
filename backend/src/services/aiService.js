// QuizGenius AI Service — © Abiyyu Rafa Ramadhan
const fetch = require('node-fetch');

const CATEGORY_META = {
  school: { subjects: { math:'Matematika', science:'IPA', social:'IPS', indonesian:'Bahasa Indonesia', english:'Bahasa Inggris', history:'Sejarah', civics:'PKN', biology:'Biologi', chemistry:'Kimia', physics:'Fisika', economics:'Ekonomi', geography:'Geografi' } },
  utbk: { subCategories: { TPS:'TPS UTBK', Literasi:'Literasi UTBK', Penalaran:'Penalaran Matematika UTBK' } },
  tpa: { subCategories: { Verbal:'TPA Verbal', Numerik:'TPA Numerik', Logika:'TPA Logika', Spasial:'TPA Spasial' } },
  skd: { subCategories: { TWK:'TWK CPNS', TIU:'TIU CPNS', TKP:'TKP CPNS' } },
};

function buildPrompt({ category, classLevel, subject, subCategory, difficulty, count }) {
  let context = (category === 'school') ? (CATEGORY_META.school.subjects[subject] || subject || 'Umum') + ` kelas ${classLevel || 'SMA'}` : (subCategory || category || 'Umum');
  const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
  return `Buat ${count || 20} soal pilihan ganda (A,B,C,D) Bahasa Indonesia: ${context}. Tingkat: ${diffMap[difficulty] || 'sedang'}. Balas HANYA JSON Murni tanpa markdown: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","topic":"..."}]}`;
}

async function callOpenRouter(prompt) {
  // Membersihkan API Key & Model dari petik Railway
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  const model = (process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free').replace(/['"]+/g, '').trim();

  if (!apiKey) throw new Error('API_KEY_KOSONG');

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://webquizbybiyu.up.railway.app', // Wajib untuk OpenRouter
      'X-Title': 'QuizGenius'
    },
    body: JSON.stringify({ 
      model: model, 
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7 
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP_${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function generateQuestions(params) {
  try {
    const provider = (process.env.AI_PROVIDER || 'openrouter').replace(/['"]+/g, '').trim();
    console.log(`[QUIZ] Start - Provider: ${provider}`);
    
    const raw = await callOpenRouter(buildPrompt(params));
    
    // Keamanan: Cek apakah raw ada isinya
    if (!raw) throw new Error("AI memberikan jawaban kosong");

    // Keamanan: Regex untuk mengambil JSON (Menghindari error 'reading 0')
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    
    if (!match) {
      console.error("[AI Raw Data]:", raw);
      throw new Error("Format JSON tidak ditemukan dalam jawaban AI");
    }

    const data = JSON.parse(match[0]);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Struktur JSON salah (questions tidak ditemukan)");
    }

    return data.questions.map((q, i) => ({ 
      ...q, 
      id: i + 1, 
      answered: null, 
      isCorrect: null 
    }));

  } catch (error) {
    console.error(`[AI Error] ${error.message}`);
    throw error; // Lempar ke frontend agar muncul pesan error yang jelas
  }
}

module.exports = { generateQuestions, CATEGORY_META };
