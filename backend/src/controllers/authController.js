const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { jwtSecret }    = require('../config/config');

const prisma = new PrismaClient();

const EMOJIS = ['🧠','🚀','⚡','🔥','💎','👑','🎯','🏆','🦁','🐉'];
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'];

function makeToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '30d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email sudah digunakan' });

    const hash  = await bcrypt.hash(password, 10);
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const user  = await prisma.user.create({
      data: { name, email, password: hash, avatarEmoji: emoji, avatarColor: color },
    });

    const token = makeToken(user.id);
    res.status(201).json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
        xp:          user.xp,
        level:       user.level,
        totalScore:  user.totalScore,
        bestStreak:  user.bestStreak,
        badges:      user.badges,
      },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)  return res.status(401).json({ error: 'Email atau password salah' });

    const token = makeToken(user.id);
    res.json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
        xp:          user.xp,
        level:       user.level,
        totalScore:  user.totalScore,
        bestStreak:  user.bestStreak,
        badges:      user.badges,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: {
        id:true, name:true, email:true, avatarEmoji:true, avatarColor:true,
        xp:true, level:true, totalScore:true, totalSessions:true,
        bestStreak:true, badges:true, createdAt:true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
