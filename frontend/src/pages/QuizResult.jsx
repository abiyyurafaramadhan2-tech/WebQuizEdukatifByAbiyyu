import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion }      from 'framer-motion';

const BADGE_INFO = {
  first_quiz: { emoji:'🎮', label:'Quiz Pertama!' },
  perfect:    { emoji:'💯', label:'Nilai Sempurna!' },
  streak_5:   { emoji:'🔥', label:'Streak Master!' },
  streak_10:  { emoji:'⚡', label:'Unstoppable!' },
  veteran_10: { emoji:'🏆', label:'Veteran!' },
};

const CAT_LABEL = {
  school: '📘 Sekolah',
  utbk:   '🎓 UTBK',
  tpa:    '🧠 TPA',
  skd:    '🏛️ SKD CPNS',
};

export default function QuizResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('qg_result');
    if (!saved) { navigate('/dashboard'); return; }
    setResult(JSON.parse(saved));
  }, []);

  if (!result) return null;

  const accuracy = result.accuracy ?? (result.total > 0 ? parseFloat(((result.correct / result.total) * 100).toFixed(1)) : 0);

  const [gradeLabel, gradeColor, gradeMsg] =
    accuracy >= 90 ? ['A', '#22c55e', 'Luar Biasa! 🏆'] :
    accuracy >= 80 ? ['B', '#3b82f6', 'Bagus Sekali! 👏'] :
    accuracy >= 70 ? ['C', '#f59e0b', 'Cukup Baik! 💪'] :
    accuracy >= 60 ? ['D', '#f97316', 'Perlu Latihan! 📚'] :
    ['E', '#ef4444', 'Jangan Menyerah! 🔥'];

  const isPerfect = accuracy === 100;

  return (
    <div className="min-h-screen pb-10"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>
      <div className="max-w-sm mx-auto px-4 pt-10">

        {/* Trophy / emoji besar */}
        <motion.div
          initial={{ scale:0, rotate:-180 }}
          animate={{ scale:1, rotate:0 }}
          transition={{ type:'spring', stiffness:200, damping:15, delay:0.1 }}
          className="text-center mb-2">
          <span className="text-8xl">{isPerfect ? '🏆' : accuracy >= 70 ? '🎉' : '📚'}</span>
        </motion.div>

        {/* Nilai */}
        <motion.div
          initial={{ opacity:0, scale:0.5 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.3, type:'spring' }}
          className="text-center mb-1">
          <span className="text-9xl font-black leading-none"
            style={{ color:gradeColor, textShadow:`0 0 40px ${gradeColor}66` }}>
            {gradeLabel}
          </span>
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="text-white font-black text-2xl text-center mb-6">
          {gradeMsg}
        </motion.p>

        {/* Badge baru */}
        {result.newBadges?.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            className="mb-5 rounded-2xl p-4 text-center"
            style={{ background:'rgba(251,191,36,0.15)', border:'2px solid rgba(251,191,36,0.4)' }}>
            <p className="text-yellow-400 font-black text-sm mb-2">🎖️ Badge Baru!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.newBadges.map(b => {
                const info = BADGE_INFO[b];
                return info ? (
                  <div key={b} className="flex items-center gap-1.5 bg-yellow-400/20 rounded-full px-3 py-1">
                    <span className="text-lg">{info.emoji}</span>
                    <span className="text-yellow-300 text-xs font-black">{info.label}</span>
                  </div>
                ) : null;
              })}
            </div>
          </motion.div>
        )}

        {/* Stats card */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="glass rounded-3xl p-5 mb-5">

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { emoji:'⭐', label:'Skor',      value:(result.score||0).toLocaleString(),  color:'#fbbf24' },
              { emoji:'🎯', label:'Akurasi',   value:`${accuracy}%`,                     color:gradeColor },
              { emoji:'✅', label:'Benar',     value:`${result.correct}/${result.total}`,color:'#22c55e'  },
              { emoji:'🔥', label:'Streak',    value:`×${result.maxStreak||0}`,           color:'#f59e0b'  },
            ].map(s => (
              <div key={s.label} className="text-center py-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.05)' }}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="font-black text-xl" style={{ color:s.color }}>{s.value}</div>
                <div className="text-white/40 text-xs font-bold uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP earned */}
          {result.xpEarned > 0 && (
            <div className="flex items-center justify-between bg-indigo-500/20 border border-indigo-500/30 rounded-2xl px-4 py-3 mb-3">
              <span className="text-white font-bold text-sm">✨ XP Didapat</span>
              <span className="text-indigo-300 font-black text-lg">+{result.xpEarned.toLocaleString()} XP</span>
            </div>
          )}

          {result.newLevel > 1 && (
            <div className="flex items-center justify-between bg-yellow-500/15 border border-yellow-500/30 rounded-2xl px-4 py-3 mb-3">
              <span className="text-white font-bold text-sm">🆙 Level Naik!</span>
              <span className="text-yellow-300 font-black text-lg">Level {result.newLevel}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-white/40 font-semibold pt-1">
            <span>{CAT_LABEL[result.category] || result.category}</span>
            <span>{result.mode === 'practice' ? '📖 Latihan' : '📝 Ujian'}</span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
          className="space-y-3">
          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => navigate('/category')}
            className="btn-primary w-full py-4 text-xl flex items-center justify-center gap-2">
            <span className="text-2xl">🚀</span> Main Lagi!
          </motion.button>

          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => navigate('/leaderboard')}
            className="w-full py-3.5 rounded-2xl font-black text-sm border-2 border-yellow-500/30 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors">
            🏆 Lihat Leaderboard
          </motion.button>

          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white/50 hover:text-white transition-colors">
            ← Kembali ke Dashboard
          </motion.button>
        </motion.div>
      </div>

      <p className="text-center text-white/20 text-xs mt-8">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
}
