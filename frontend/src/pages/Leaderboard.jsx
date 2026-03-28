import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { motion }              from 'framer-motion';
import api                     from '../api';

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' };
const MEDAL_COLORS = { 1:'#fbbf24', 2:'#94a3b8', 3:'#d97706' };
const CAT_OPTIONS = [
  { id:'',      label:'Semua'  },
  { id:'school',label:'Sekolah'},
  { id:'utbk',  label:'UTBK'  },
  { id:'tpa',   label:'TPA'   },
  { id:'skd',   label:'SKD'   },
];

export default function Leaderboard() {
  const navigate  = useNavigate();
  const [entries, setEntries] = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [period,  setPeriod]  = useState('all');
  const [category,setCategory]= useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p, c) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period:p, limit:'30' });
      if (c) params.set('category', c);
      const res = await api.get(`/leaderboard?${params}`);
      setEntries(res.data.entries || []);
      setMyRank(res.data.myRank);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period, category); }, [period, category]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen pb-10"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white text-lg">
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-xl">🏆 Leaderboard</h1>
          {myRank && (
            <p className="text-white/50 text-xs font-semibold">
              Rank kamu: <span className="text-indigo-400 font-black">#{myRank}</span>
            </p>
          )}
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">

        {/* Period tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {[['all','Semua'],['today','Hari Ini'],['week','Minggu'],['month','Bulan']].map(([id,l]) => (
            <button key={id} onClick={() => setPeriod(id)}
              className="px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap border-2 transition-all flex-shrink-0"
              style={{
                background:  period===id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                borderColor: period===id ? '#6366f1' : 'rgba(255,255,255,0.1)',
                color:       period===id ? 'white' : '#94a3b8',
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {CAT_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setCategory(opt.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border-2 transition-all flex-shrink-0"
              style={{
                background:  category===opt.id ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)',
                borderColor: category===opt.id ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color:       category===opt.id ? '#f59e0b' : '#64748b',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div className="text-5xl"
              animate={{ rotate:360 }}
              transition={{ duration:1, repeat:Infinity, ease:'linear' }}>
              ⚙️
            </motion.div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length === 3 && (
              <div className="flex items-end justify-center gap-2 mb-8 h-48 px-2">
                {[top3[1], top3[0], top3[2]].map((e, pi) => {
                  const rank    = [2, 1, 3][pi];
                  const height  = [120, 155, 95][pi];
                  const podiumC = MEDAL_COLORS[rank];
                  return (
                    <motion.div key={e.userId}
                      initial={{ opacity:0, y:40 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay: rank === 1 ? 0.1 : 0.2 }}
                      className="flex flex-col items-center flex-1 max-w-[100px]">

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-3 mb-1"
                        style={{
                          background:  `${e.avatarColor}33`,
                          borderColor: podiumC,
                          boxShadow:   `0 0 16px ${podiumC}66`,
                          borderWidth: '3px',
                          borderStyle: 'solid',
                        }}>
                        {e.avatarEmoji}
                      </div>

                      <p className="text-white text-xs font-black text-center truncate w-full px-1 mb-0.5">{e.name}</p>
                      <p className="text-yellow-400 font-black text-sm mb-1">{e.score.toLocaleString()}</p>

                      {/* Podium block */}
                      <div className="w-full rounded-t-2xl flex items-center justify-center text-2xl font-black"
                        style={{ height, background:`${podiumC}22`, border:`2px solid ${podiumC}55` }}>
                        {MEDALS[rank]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {entries.map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-15 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border transition-all"
                  style={{
                    background:  e.isMe ? 'rgba(99,102,241,0.2)'  : 'rgba(255,255,255,0.04)',
                    borderColor: e.isMe ? '#6366f1' : 'rgba(255,255,255,0.08)',
                    boxShadow:   e.isMe ? '0 0 20px rgba(99,102,241,0.25)' : 'none',
                  }}>

                  {/* Rank */}
                  <div className="w-9 text-center font-black text-base flex-shrink-0"
                    style={{ color: MEDAL_COLORS[e.rank] || '#475569' }}>
                    {e.rank <= 3 ? MEDALS[e.rank] : `#${e.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2"
                    style={{ background:`${e.avatarColor}25`, borderColor: e.avatarColor }}>
                    {e.avatarEmoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white text-sm font-black truncate">
                        {e.name}
                      </span>
                      {e.isMe && (
                        <span className="text-indigo-400 text-[10px] font-black bg-indigo-400/20 px-1.5 py-0.5 rounded-full">
                          Kamu
                        </span>
                      )}
                      <span className="text-white/30 text-[10px] font-semibold">
                        Lv.{e.level}
                      </span>
                    </div>
                    <div className="text-white/40 text-[10px] font-semibold">
                      🔥 ×{e.maxStreak} · ✓ {e.accuracy}% · {e.category}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-yellow-400 font-black text-sm">{e.score.toLocaleString()}</div>
                    <div className="text-white/30 text-[10px] font-semibold">+{e.xpEarned} XP</div>
                  </div>
                </motion.div>
              ))}

              {entries.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🏆</div>
                  <p className="text-white/40 font-semibold">Belum ada data. Jadilah yang pertama!</p>
                </div>
              )}
            </div>
          </>
        )}

        <motion.button whileTap={{ scale:0.97 }}
          onClick={() => navigate('/category')}
          className="btn-primary w-full py-4 text-xl mt-6 flex items-center justify-center gap-2">
          <span className="text-2xl">🚀</span> Main Sekarang!
        </motion.button>
      </div>

      <p className="text-center text-white/20 text-xs mt-8">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
}
