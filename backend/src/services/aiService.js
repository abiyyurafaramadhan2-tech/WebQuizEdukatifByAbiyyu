const fetch = require('node-fetch');

const CATEGORY_META = {
  school: { subjects: { math:'Matematika', science:'IPA', social:'IPS', indonesian:'Bahasa Indonesia', english:'Bahasa Inggris', history:'Sejarah', civics:'PKN', biology:'Biologi', chemistry:'Kimia', physics:'Fisika', economics:'Ekonomi', geography:'Geografi' } },
  utbk: { subCategories: { TPS:'TPS UTBK', Literasi:'Literasi UTBK', Penalaran:'Penalaran Matematika UTBK' } },
  tpa: { subCategories: { Verbal:'TPA Verbal', Numerik:'TPA Numerik', Logika:'TPA Logika', Spasial:'TPA Spasial' } },
  skd: { subCategories: { TWK:'TWK CPNS', TIU:'TIU CPNS', TKP:'TKP CPNS' } },
};

async function callOpenRouter(prompt) {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  const model = (process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free').replace(/['"]+/g, '').trim();

  console.log(`[DEBUG] Memanggil OpenRouter dengan model: ${model}`);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://webquizbybiyu.up.railway.app',
      'X-Title': 'QuizGenius'
    },
    body: JSON.stringify({ 
      model: model, 
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7 
    }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("[DEBUG] OpenRouter Error Response:", JSON.stringify(data));
    throw new Error(data?.error?.message || `HTTP_${res.status}`);
  }

  return data?.choices?.[0]?.message?.content || '';
}

async function generateQuestions(params) {
  try {
    console.log(`[DEBUG] Params yang diterima:`, JSON.stringify(params));
    
    let context = (params.category === 'school') ? (CATEGORY_META.school.subjects[params.subject] || params.subject || 'Umum') + ` kelas ${params.classLevel || 'SMA'}` : (params.subCategory || params.category || 'Umum');
    const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
    
    const prompt = `Buat ${params.count || 10} soal pilihan ganda (A,B,C,D) Bahasa Indonesia: ${context}. Tingkat: ${diffMap[params.difficulty] || 'sedang'}. Balas HANYA JSON murni: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","topic":"..."}]}`;

    const raw = await callOpenRouter(prompt);
    console.log("[DEBUG] Hasil Mentah AI:", raw.substring(0, 100) + "..."); // Cek 100 karakter pertama

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[DEBUG] AI tidak kirim JSON. Isi asli:", raw);
      throw new Error("Jawaban AI bukan format JSON");
    }

    const data = JSON.parse(match[0]);
    return data.questions.map((q, i) => ({ ...q, id: i + 1, answered: null, isCorrect: null }));

  } catch (error) {
    console.error(`[CRITICAL ERROR] ${error.message}`);
    throw error;
  }
}

module.exports = { generateQuestions, CATEGORY_META };
