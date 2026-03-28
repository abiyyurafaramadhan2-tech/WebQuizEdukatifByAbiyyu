const { PrismaClient } = require('@prisma/client');
const { generateQuestions, explainWrong } = require('../services/aiService');
const cfg = require('../config/config');

const prisma = new PrismaClient();

// ── Hitung XP earned ──────────────────────────────────
function calcXP(correct, total, maxStreak, timeSaved) {
  const base     = correct * 20;
  const streakXP = maxStreak * 10;
  const timeXP   = Math.max(0, Math.floor(timeSaved * 0.5));
  const accuracy = total > 0 ? correct / total : 0;
  const bonus    = accuracy >= 1.0 ? 150 : accuracy >= 0.8 ? 75 : accuracy >= 0.6 ? 25 : 0;
  return base + streakXP + timeXP + bonus;
}

// ── Hitung level dari XP ──────────────────────────────
function calcLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// ── Cek badge baru ────────────────────────────────────
function checkBadges(user, session) {
  const newBadges = [];
  const existing  = user.badges || [];

  if (!existing.includes('first_quiz'))
    newBadges.push('first_quiz');
  if (session.correct === session.total && !existing.includes('perfect'))
    newBadges.push('perfect');
  if (session.maxStreak >= 5 && !existing.includes('streak_5'))
    newBadges.push('streak_5');
  if (session.maxStreak >= 10 && !existing.includes('streak_10'))
    newBadges.push('streak_10');
  if (user.totalSessions + 1 >= 10 && !existing.includes('veteran_10'))
    newBadges.push('veteran_10');

  return newBadges;
}

// ── START QUIZ ────────────────────────────────────────
exports.start = async (req, res) => {
  try {
    const { category, classLevel, subject, subCategory, mode } = req.body;

    if (!category || !mode) {
      return res.status(400).json({ error: 'category dan mode wajib diisi' });
    }
    if (category === 'school' && (!classLevel || !subject)) {
      return res.status(400).json({ error: 'classLevel dan subject wajib untuk kategori Sekolah' });
    }
    if (['utbk','tpa','skd'].includes(category) && !subCategory) {
      return res.status(400).json({ error: 'subCategory wajib untuk kategori ini' });
    }

    let questions;
    try {
      questions = await generateQuestions({
        category, classLevel, subject, subCategory,
        difficulty: 1,
        count:      cfg.quiz.questionsCount,
      });
    } catch (aiErr) {
      console.error('[AI Error]', aiErr.message);
      return res.status(502).json({
        error: 'Gagal generate soal dari AI. Pastikan API key sudah diisi dengan benar.',
        detail: aiErr.message,
      });
    }

    const session = await prisma.quizSession.create({
      data: {
        userId:      req.userId,
        category,
        classLevel:  classLevel  || null,
        subject:     subject     || null,
        subCategory: subCategory || null,
        mode,
        difficulty:  1,
        questions,
        log:         [],
      },
    });

    res.status(201).json({
      sessionId:      session.id,
      totalQuestions: questions.length,
      config: {
        time:   cfg.quiz.timeSeconds,
        streak: cfg.quiz.streakThreshold,
      },
      questions,
    });
  } catch (err) {
    console.error('[quiz.start]', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── ANSWER QUESTION ───────────────────────────────────
exports.answer = async (req, res) => {
  try {
    const { sessionId, qi, answer, timeTaken } = req.body;

    if (qi === undefined || !answer || !sessionId) {
      return res.status(400).json({ error: 'sessionId, qi, dan answer wajib diisi' });
    }

    const session = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: req.userId, status: 'active' },
    });
    if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

    const questions = session.questions;
    if (!questions[qi]) return res.status(400).json({ error: 'Soal tidak valid' });
    if (questions[qi].answered !== null) {
      return res.status(400).json({ error: 'Soal sudah dijawab' });
    }

    const q         = questions[qi];
    const correct   = answer.toUpperCase() === q.correct;
    const time      = Math.min(parseInt(timeTaken) || 0, cfg.quiz.timeSeconds);
    const timeBonus = correct ? Math.max(0, (cfg.quiz.timeSeconds - time) * 2) : 0;
    const newStreak = correct ? session.streak + 1 : 0;
    const maxStreak = Math.max(session.maxStreak, newStreak);
    const stkBonus  = (correct && session.streak >= 2) ? 50 : 0;
    const earned    = correct ? 100 + timeBonus + stkBonus : 0;

    // Upgrade difficulty jika streak tinggi
    let newDiff = session.difficulty;
    if (newStreak >= cfg.quiz.streakThreshold && session.difficulty < 3) {
      newDiff = Math.min(3, session.difficulty + 1);
    }

    // Update questions array
    questions[qi].answered  = answer.toUpperCase();
    questions[qi].isCorrect = correct;

    const log = Array.isArray(session.log) ? session.log : [];
    log.push({
      qi, answer: answer.toUpperCase(),
      correct: q.correct, ok: correct,
      earned, time,
    });

    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        questions,
        log,
        currentQ:   qi + 1,
        correct:    session.correct   + (correct ? 1 : 0),
        incorrect:  session.incorrect + (correct ? 0 : 1),
        streak:     newStreak,
        maxStreak,
        score:      session.score + earned,
        timeSpent:  session.timeSpent + time,
        difficulty: newDiff,
      },
    });

    // AI explanation untuk jawaban salah di mode latihan
    let explanation = q.explanation || '';
    if (!correct && session.mode === 'practice') {
      try {
        explanation = await explainWrong({
          question: q.question,
          correct:  q.options[q.correct],
          wrong:    q.options[answer.toUpperCase()],
        });
      } catch { /* pakai explanation default */ }
    }

    res.json({
      isCorrect:     correct,
      correctAnswer: q.correct,
      correctText:   q.options[q.correct],
      explanation,
      earned,
      timeBonus,
      stkBonus,
      newStreak,
      totalScore:    session.score + earned,
      diffUp:        newDiff > session.difficulty,
    });
  } catch (err) {
    console.error('[quiz.answer]', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── FINISH QUIZ ───────────────────────────────────────
exports.finish = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: req.userId, status: 'active' },
    });
    if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

    const total    = session.questions.length;
    const accuracy = total > 0 ? parseFloat(((session.correct / total) * 100).toFixed(1)) : 0;
    const xpEarned = calcXP(session.correct, total, session.maxStreak, 0);

    // Update session
    await prisma.quizSession.update({
      where: { id: sessionId },
      data:  { status: 'done', finishedAt: new Date(), xpEarned },
    });

    // Save to leaderboard
    await prisma.leaderboard.create({
      data: {
        userId:      session.userId,
        sessionId:   session.id,
        category:    session.category,
        subCategory: session.subCategory || session.subject || null,
        score:       session.score,
        correct:     session.correct,
        total,
        maxStreak:   session.maxStreak,
        accuracy,
        timeSpent:   session.timeSpent,
        xpEarned,
      },
    });

    // Update user stats
    const user      = await prisma.user.findUnique({ where: { id: req.userId } });
    const newXP     = (user.xp || 0) + xpEarned;
    const newLevel  = calcLevel(newXP);
    const newBadges = checkBadges(user, session);

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        xp:           newXP,
        level:        newLevel,
        totalScore:   (user.totalScore    || 0) + session.score,
        totalSessions:(user.totalSessions || 0) + 1,
        bestStreak:   Math.max(user.bestStreak || 0, session.maxStreak),
        badges:       [...(user.badges || []), ...newBadges],
      },
    });

    res.json({
      score:      session.score,
      correct:    session.correct,
      total,
      accuracy,
      maxStreak:  session.maxStreak,
      xpEarned,
      newBadges,
      newLevel,
      newXP,
    });
  } catch (err) {
    console.error('[quiz.finish]', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── QUIT QUIZ ─────────────────────────────────────────
exports.quit = async (req, res) => {
  try {
    const { sessionId } = req.body;
    await prisma.quizSession.updateMany({
      where:  { id: sessionId, userId: req.userId, status: 'active' },
      data:   { status: 'quit', finishedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
