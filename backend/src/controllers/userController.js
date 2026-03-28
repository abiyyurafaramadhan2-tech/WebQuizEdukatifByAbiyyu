const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id:true, name:true, email:true,
        avatarEmoji:true, avatarColor:true,
        xp:true, level:true, totalScore:true,
        totalSessions:true, bestStreak:true, badges:true,
        createdAt:true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const recentSessions = await prisma.quizSession.findMany({
      where:   { userId: req.userId, status: 'done' },
      orderBy: { finishedAt: 'desc' },
      take:    5,
      select:  {
        id:true, category:true, subject:true,
        subCategory:true, score:true,
        correct:true, finishedAt:true,
      },
    });

    const myRank = await prisma.leaderboard.count({
      where: { score: { gt: user.totalScore } },
    }) + 1;

    res.json({ ...user, recentSessions, myRank });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
