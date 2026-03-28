// QuizGenius AI Service — © Abiyyu Rafa Ramadhan
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
const cfg   = require('../config/config');

// ── Kategori metadata ───────────────────────────────
const CATEGORY_META = {
  school: {
    subjects: {
      math:       { id: 'Matematika',       en: 'Mathematics'      },
      science:    { id: 'IPA',              en: 'Natural Science'   },
      social:     { id: 'IPS',              en: 'Social Studies'    },
      indonesian: { id: 'Bahasa Indonesia', en: 'Indonesian'        },
      english:    { id: 'Bahasa Inggris',   en: 'English'           },
      history:    { id: 'Sejarah',          en: 'History'           },
      civics:     { id: 'PKN',              en: 'Civic Education'   },
      biology:    { id: 'Biologi',          en: 'Biology'           },
      chemistry:  { id: 'Kimia',            en: 'Chemistry'         },
      physics:    { id: 'Fisika',           en: 'Physics'           },
      economics:  { id: 'Ekonomi',          en: 'Economics'         },
      geography:  { id: 'Geografi',         en: 'Geography'         },
    },
  },
  utbk: {
    subCategories: {
      TPS:      'Tes Potensi Skolastik UTBK',
      Literasi: 'Literasi UTBK (Bahasa Indonesia & Inggris)',
      Penalaran:'Penalaran Matematika UTBK',
    },
  },
  tpa: {
    subCategories: {
      Verbal:  'TPA Verbal (sinonim, antonim, analogi)',
      Numerik: 'TPA Numerik (deret, aritmatika, perbandingan)',
      Logika:  'TPA Logika (silogisme, analitik, deduksi)',
      Spasial: 'TPA Spasial (gambar, pola, rotasi)',
    },
  },
  skd: {
    subCategories: {
      TWK: 'TWK CPNS (wawasan kebangsaan, Pancasila, UUD 1945)',
      TIU: 'TIU CPNS (verbal, numerik, figural)',
      TKP: 'TKP CPNS (pelayanan publik, integritas, etika)',
    },
  },
};

// ── Build prompt ────────────────────────────────────
function buildPrompt({ category, classLevel, subject, subCategory, difficulty, count }) {
  let context = '';

  if (category === 'school') {
    const subName = CATEGORY_META.school.subjects[subject]?.id || subject;
    context = `Mata pelajaran ${subName} untuk kelas ${classLevel} SD/SMP/SMA Indonesia (Kurikulum Merdeka).`;
  } else if (category === 'utbk') {
    context = `${CATEGORY_META.utbk.subCategories[subCategory] || subCategory} - persiapan SNBT/UTBK untuk masuk PTN.`;
  } else if (category === 'tpa') {
    context = `${CATEGORY_META.tpa.subCategories[subCategory] || subCategory} - soal TPA standar tes masuk perusahaan/kampus.`;
  } else if (category === 'skd') {
    context = `${CATEGORY_META.skd.subCategories[subCategory] || subCategory} - soal SKD CPNS standar BKN.`;
  }

  const diffMap = {
    1: 'mudah (konsep dasar, definisi, hafalan)',
    2: 'sedang (pemahaman, penerapan, analisis ringan)',
    3: 'sulit (analitis mendalam, multi-langkah, kritis)',
  };
  const diffText = diffMap[difficulty] || diffMap[1];

  return `Kamu adalah pembuat soal ahli. Buat ${count} soal pilihan ganda (MCQ) untuk:
Konteks: ${context}
Tingkat kesulitan: ${diffText}

WAJIB balas HANYA dengan JSON valid ini, tanpa teks lain, tanpa markdown:
{"questions":[{"id":1,"question":"Teks soal?","options":{"A":"opsi A","B":"opsi B","C":"opsi C","D":"opsi D"},"correct":"B","explanation":"Penjelasan singkat mengapa B benar.","topic":"topik soal"}]}

ATURAN PENTING:
- Buat tepat ${count} soal berbeda topiknya
- Semua pilihan harus masuk akal (tidak ada yang jelas salah)
- Kunci jawaban tersebar (tidak selalu A atau B)
- Bahasa Indonesia yang benar
- Penjelasan singkat dan jelas (1-2 kalimat)
- Untuk ${category === 'skd' ? 'TKP: soal berupa situasi kerja dengan jawaban terbaik' : 'soal berbasis materi standar'}
- JSON valid saja, TIDAK ADA teks di luar JSON`;
}

// ── Gemini call ─────────────────────────────────────
async function callGemini(prompt, maxTokens = 4096) {
  const genAI = new GoogleGenerativeAI(cfg.ai.geminiKey);
  const model = genAI.getGenerativeModel({
    model: cfg.ai.geminiModel,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── OpenAI call ─────────────────────────────────────
async function callOpenAI(prompt, maxTokens = 4096) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.ai.openaiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:      cfg.ai.openaiModel,
      messages:   [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  return data.choices[0].message.content;
}

// ── Parse JSON response ─────────────────────────────
function parseQuestions(raw, count) {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const data    = JSON.parse(cleaned);

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('AI tidak menghasilkan format yang benar');
  }

  return data.questions.slice(0, count).map((q, i) => ({
    id:          i + 1,
    question:    String(q.question || `Soal ${i + 1}`),
    options:     {
      A: String(q.options?.A || 'Pilihan A'),
      B: String(q.options?.B || 'Pilihan B'),
      C: String(q.options?.C || 'Pilihan C'),
      D: String(q.options?.D || 'Pilihan D'),
    },
    correct:     String(q.correct || 'A').toUpperCase(),
    explanation: String(q.explanation || ''),
    topic:       String(q.topic || ''),
    answered:    null,
    isCorrect:   null,
  }));
}

// ── Main export ─────────────────────────────────────
async function generateQuestions(params) {
  const count  = params.count || cfg.quiz.questionsCount;
  const prompt = buildPrompt({ ...params, count });

  let raw;
  if (cfg.ai.provider === 'openai') {
    raw = await callOpenAI(prompt);
  } else {
    raw = await callGemini(prompt);
  }

  return parseQuestions(raw, count);
}

async function explainWrong({ question, correct, wrong }) {
  const prompt = `Kamu adalah tutor AI yang lucu dan menyemangati.
Seorang siswa menjawab salah pada soal berikut:
Soal: ${question}
Jawaban benar: ${correct}
Jawaban siswa: ${wrong}

Tulis penjelasan 2-3 kalimat dalam Bahasa Indonesia yang kasual:
1. Hibur siswa dengan santai
2. Jelaskan kenapa "${correct}" benar dengan analogi mudah dipahami
3. Akhiri dengan kalimat semangat + 1 emoji lucu

Teks biasa saja, tanpa markdown.`;

  try {
    const raw = cfg.ai.provider === 'openai'
      ? await callOpenAI(prompt, 300)
      : await callGemini(prompt, 300);
    return raw.trim();
  } catch {
    return `Hampir! Jawaban yang benar adalah: "${correct}". Tetap semangat belajar ya! 💪`;
  }
}

module.exports = { generateQuestions, explainWrong, CATEGORY_META };
