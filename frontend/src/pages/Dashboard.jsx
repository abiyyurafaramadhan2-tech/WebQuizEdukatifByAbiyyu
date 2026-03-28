import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const XP_PER_LEVEL = lvl => lvl * lvl * 100;
const BADGE_INFO = {
  first_quiz:  { emoji:'🎮', label:'Quiz Pertama' },
  perfect:     { emoji:'💯', label:'Sempurna'     },
  streak_5:    { emoji:'🔥', label:'Streak 5'     },
  streak_10:   { emoji:'⚡', label:'Streak 10'    },
  veteran_10:  { emoji:'🏆', label:'Veteran'      },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/user/profile').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const data     = profile || user;
  const level    = data?.level || 1;
  const xp       = data?.xp || 0;
  const xpNeeded = XP_PER_LEVEL(level);
  const xpPct    = Math.min((xp / xpNeeded) * 100, 100);

  const startQuiz = () => navigate('/category');

  return (
    <div className="min-h-screen pb-8"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 font-black"
            style={{ background:`${data?.avatarColor || '#6366f1'}25`, borderColor:data?.avatarColor || '#6366f1' }}>
            {data?.avatarEmoji || '🧠'}
          </div>
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Selamat datang,</p>
            <h1 className="text-white font-black text-lg leading-none">{data?.name}</h1>
          </div>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded-xl bg-white/10 text-white/60 text-sm font-bold hover:bg-white/20 transition-colors">
          Keluar
        </button>
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-4">

        {/* Level & XP card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Level</p>
              <p className="text-white font-black text-3xl leading-none">{level}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="text-indigo-400 font-black text-xl">{xp.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1, delay:0.3 }}
              className="h-full rounded-full"
              style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6)' }}/>
          </div>
          <p className="text-white/40 text-xs mt-1.5 font-semibold text-right">
            {xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji:'⭐', label:'Total Skor',  value:(data?.totalScore||0).toLocaleString(), color:'#f59e0b' },
            { emoji:'🎮', label:'Total Sesi',  value:(data?.totalSessions||0),               color:'#22c55e' },
            { emoji:'🔥', label:'Best Streak', value:`×${data?.bestStreak||0}`,              color:'#ef4444' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              className="glass rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="font-black text-lg" style={{ color:s.color }}>{s.value}</div>
              <div className="text-white/40 text-[10px] font-bold uppercase">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {data?.badges?.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass rounded-3xl p-4">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">🏅 Badges Kamu</p>
            <div className="flex flex-wrap gap-2">
              {data.badges.map(b => {
                const info = BADGE_INFO[b];
                return info ? (
                  <div key={b} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-base">{info.emoji}</span>
                    <span className="text-white text-xs font-bold">{info.label}</span>
                  </div>
                ) : null;
              })}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.button
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          whileTap={{ scale:0.97 }}
          onClick={startQuiz}
          className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3">
          <span className="text-2xl">🚀</span>
          Mulai Quiz!
        </motion.button>

        <div className="flex gap-3">
          <button onClick={() => navigate('/leaderboard')}
            className="flex-1 glass rounded-2xl py-3.5 text-center font-black text-white hover:bg-white/15 transition-colors">
            🏆 Leaderboard
          </button>
          <button onClick={() => navigate('/category')}
            className="flex-1 glass rounded-2xl py-3.5 text-center font-black text-white hover:bg-white/15 transition-colors">
            📚 Pilih Kategori
          </button>
        </div>

        <p className="text-center text-white/20 text-xs pt-2">© Abiyyu Rafa Ramadhan</p>
      </div>
    </div>
  );
    }
