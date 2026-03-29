// QuizGenius AI Service — © Abiyyu Rafa Ramadhan
const fetch = require('node-fetch');

const CATEGORY_META = {
  school: { 
    subjects: { 
      math:'Matematika', science:'IPA', social:'IPS', 
      indonesian:'Bahasa Indonesia', english:'Bahasa Inggris', 
      history:'Sejarah', civics:'PKN', biology:'Biologi', 
      chemistry:'Kimia', physics:'Fisika', economics:'Ekonomi', 
      geography:'Geografi' 
    } 
  },
  utbk: { subCategories: { TPS:'TPS UTBK', Literasi:'Literasi UTBK', Penalaran:'Penalaran Matematika UTBK' } },
  tpa: { subCategories: { Verbal:'TPA Verbal', Numerik:'TPA Numerik', Logika:'TPA Logika', Spasial:'TPA Spasial' } },
  skd: { subCategories: { TWK:'TWK CPNS', TIU:'TIU CPNS', TKP:'TKP CPNS' } },
};

async function callOpenRouter(prompt) {
  // Ambil API Key & bersihkan dari tanda petik sisa Railway
  const apiKey = (process.env.OPENROUTER_API_KEY || '').replace(/['"]+/g, '').trim();
  
  // PAKSA MODEL DISINI (HARDCODE) agar tidak ada error "Invalid Model ID" lagi
  const model = "google/gemini-2.0-flash-lite-preview-02-05:free";

  console.log(`[DEBUG] Mengirim request ke OpenRouter...`);
  console.log(`[DEBUG] Model: ${model}`);

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
    console.error("[DEBUG] OpenRouter Error:", JSON.stringify(data));
    throw new Error(data?.error?.message || `HTTP_${res.status}`);
  }

  return data?.choices?.[0]?.message?.content || '';
}

async function generateQuestions(params) {
  try {
    console.log(`[DEBUG] Memulai generate soal untuk: ${params.category}`);
    
    let context = (params.category === 'school') 
      ? (CATEGORY_META.school.subjects[params.subject] || params.subject || 'Umum') + ` kelas ${params.classLevel || 'SMA'}` 
      : (params.subCategory || params.category || 'Umum');
    
    const diffMap = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
    
    const prompt = `Buat ${params.count || 10} soal pilihan ganda (A,B,C,D) Bahasa Indonesia tentang: ${context}. Tingkat kesulitan: ${diffMap[params.difficulty] || 'sedang'}. Balas HANYA dengan format JSON murni: {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","topic":"..."}]}`;

    const raw = await callOpenRouter(prompt);
    
    // Pembersihan teks (menghilangkan markdown ```json ... ```)
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Mencari bagian JSON (antara { dan })
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[DEBUG] AI tidak mengirim JSON yang valid. Raw:", raw);
      throw new Error("Jawaban AI bukan format JSON");
    }

    const data = JSON.parse(match[0]);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Struktur JSON salah: 'questions' tidak ditemukan");
    }

    // Mapping ulang ID dan status jawaban
    return data.questions.map((q, i) => ({ 
      ...q, 
      id: i + 1, 
      answered: null, 
      isCorrect: null 
    }));

  } catch (error) {
    console.error(`[CRITICAL ERROR] ${error.message}`);
    throw error;
  }
}

module.exports = { generateQuestions, CATEGORY_META };
