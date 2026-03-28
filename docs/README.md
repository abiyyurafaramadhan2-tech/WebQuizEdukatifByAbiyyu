# 🧠 QuizGenius AI
> Web Quiz + AI Tutor | © Abiyyu Rafa Ramadhan

## 🗺️ Cara Pakai (User Flow)
1. Register / Login
2. Klik **Mulai Quiz**
3. Pilih Kategori: **Sekolah / UTBK / TPA / SKD**
4. Pilih detail (Kelas + Mapel atau Sub-tes)
5. Pilih Mode: **Latihan** (ada penjelasan AI) atau **Ujian**
6. Kerjakan 20 soal → Dapat XP + Badge + Masuk Leaderboard

## 🚀 Deploy ke Railway (Step by Step)

### Langkah 1 — Push ke GitHub
```bash
git add .
git commit -m "QuizGenius AI"
git push origin main
```

### Langkah 2 — Buat Project di Railway
1. Buka **railway.app** → Login dengan GitHub
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo `quizgenius-ai`

### Langkah 3 — Tambah PostgreSQL
1. Di halaman project, klik **+ New**
2. Pilih **Database** → **Add PostgreSQL**
3. Tunggu database siap

### Langkah 4 — Set Environment Variables
Klik service app → tab **Variables** → **RAW Editor**, paste:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=isi_random_string_32_karakter
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy_KEY_KAMU
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://nama-app.railway.app
QUIZ_QUESTIONS_COUNT=20
QUIZ_TIME_SECONDS=30
QUIZ_STREAK_THRESHOLD=3
```

> **Catatan:** `${{Postgres.DATABASE_URL}}` otomatis terhubung ke PostgreSQL Railway.

### Langkah 5 — Generate Domain
1. Klik tab **Settings** → **Networking**
2. Klik **Generate Domain**
3. Tunggu deploy selesai (~5 menit)
4. Klik domain → Aplikasi online! 🎉

## 🔑 Cara Dapat API Key Gemini (Gratis)
1. Buka: **aistudio.google.com**
2. Login Google → **Get API Key** → **Create API Key**
3. Copy key (mulai `AIzaSy...`)
4. Paste ke `GEMINI_API_KEY` di Railway Variables

## 🧠 Cara AI Generate Soal
AI menghasilkan soal berdasarkan:
- **Sekolah**: Mata pelajaran + Kelas 1-12 + Kurikulum Merdeka
- **UTBK**: Sub-tes TPS / Literasi / Penalaran SNBT
- **TPA**: Verbal / Numerik / Logika / Spasial
- **SKD**: TWK / TIU / TKP standar BKN

## 🏗️ Struktur Project
```
quizgenius/
├── backend/       → Node.js + Express + Prisma
├── frontend/      → React + Vite + Tailwind
└── docs/          → Dokumentasi ini
```
