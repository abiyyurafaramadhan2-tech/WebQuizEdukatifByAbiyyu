// QuizGenius AI Server — © Abiyyu Rafa Ramadhan
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const cfg      = require('./config/config');

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors({
  origin:      cfg.nodeEnv === 'production' ? cfg.frontendUrl : '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/quiz',        require('./routes/quiz'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/user',        require('./routes/user'));

// ── Health check ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Serve React build (production) ─────────────────
const frontendBuild = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// ── Start server ────────────────────────────────────
app.listen(cfg.port, '0.0.0.0', () => {
  console.log(`\n🧠 QuizGenius AI — Server jalan di port ${cfg.port}`);
  console.log(`🌍 Mode: ${cfg.nodeEnv}`);
  console.log(`🤖 AI Provider: ${cfg.ai.provider}`);
  console.log(`© Abiyyu Rafa Ramadhan\n`);
});
