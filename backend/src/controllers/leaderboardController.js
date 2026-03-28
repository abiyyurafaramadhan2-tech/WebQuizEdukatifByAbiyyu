const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getGlobal = async (req, res) => {
  try {
    const { period = 'all', category = '', limit = '20' } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 50);

    const where = {};
    if (category) where.category = category;

    if (period === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      where.createdAt = { gte: start };
    } else if (period === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      where.createdAt = { gte: start };
    } else if (period === 'month') {
      const start = new Date();
      start.setDate(1); start.setHours(0, 0, 0, 0);
      where.createdAt = { gte: start };
    }

    const entries = await prisma.leaderboard.findMany({
      where,
      orderBy: { score: 'desc' },
      take:    lim,
      include: {
        user: {
          select: { id:true, name:true, avatarEmoji:true, avatarColor:true, level:true },
        },
      },
    });

    const result = entries.map((e, i) => ({
      rank:        i + 1,
      userId:      e.userId,
      name:        e.user?.name        || 'Unknown',
      avatarEmoji: e.user?.avatarEmoji || '🧠',
      avatarColor: e.user?.avatarColor || '#6366f1',
      level:       e.user?.level       || 1,
      score:       e.score,
      accuracy:    e.accuracy,
      maxStreak:   e.maxStreak,
      correct:     e.correct,
      total:       e.total,
      category:    e.category,
      xpEarned:    e.xpEarned,
      date:        e.createdAt,
      isMe:        e.userId === req.userId,
    }));

    const myEntry = result.find(e => e.isMe);
    const myRank  = myEntry?.rank
      ?? await prisma.leaderboard.count({ where: { ...where, score: { gt: 0 } } }) + 1;

    res.json({ entries: result, myRank });
  } catch (err) {
    console.error('[leaderboard]', err);
    res.status(500).json({ error: 'Server error' });
  }
};
