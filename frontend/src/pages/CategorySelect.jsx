import { useNavigate } from 'react-router-dom';
import { motion }      from 'framer-motion';

const CATEGORIES = [
  {
    id:    'school',
    emoji: '📘',
    label: 'Sekolah',
    desc:  'Kelas 1 – 12',
    sub:   'SD · SMP · SMA',
    color: '#6366f1',
    glow:  'rgba(99,102,241,0.4)',
    bg:    'linear-gradient(135deg,#6366f1,#8b5cf6)',
  },
  {
    id:    'utbk',
    emoji: '🎓',
    label: 'UTBK',
    desc:  'Seleksi PTN',
    sub:   'TPS · Literasi · Penalaran',
    color: '#22c55e',
    glow:  'rgba(34,197,94,0.4)',
    bg:    'linear-gradient(135deg,#16a34a,#22c55e)',
  },
  {
    id:    'tpa',
    emoji: '🧠',
    label: 'TPA / TPS',
    desc:  'Tes Potensi Akademik',
    sub:   'Verbal · Numerik · Logika',
    color: '#f59e0b',
    glow:  'rgba(245,158,11,0.4)',
    bg:    'linear-gradient(135deg,#d97706,#f59e0b)',
  },
  {
    id:    'skd',
    emoji: '🏛️',
    label: 'SKD CPNS',
    desc:  'Seleksi Kompetensi Dasar',
    sub:   'TWK · TIU · TKP',
    color: '#ef4444',
    glow:  'rgba(239,68,68,0.4)',
    bg:    'linear-gradient(135deg,#dc2626,#ef4444)',
  },
];

export default function CategorySelect() {
  const navigate = useNavigate();

  const select = cat => {
    sessionStorage.setItem('qg_category', cat.id);
    navigate('/subcategory');
  };

  return (
    <div className="min-h-screen"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-4 w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white text-lg">
          ←
        </motion.button>
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-white font-black text-2xl">Pilih Kategori</h1>
          <p className="text-white/50 text-sm mt-1 font-semibold">Belajar apa hari ini?</p>
        </motion.div>
      </div>

      {/* Cards */}
      <div className="px-4 max-w-lg mx-auto grid grid-cols-1 gap-4 pb-8">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity:0, x:-30 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => select(cat)}
            className="card-hover relative overflow-hidden rounded-3xl p-5 text-left border-2"
            style={{ background:`${cat.color}15`, borderColor:`${cat.color}40` }}
          >
            {/* Glow bg */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
              style={{ background:cat.bg }}/>

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background:cat.bg, boxShadow:`0 8px 24px ${cat.glow}` }}>
                {cat.emoji}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-white font-black text-xl">{cat.label}</h3>
                <p className="font-bold text-sm" style={{ color:cat.color }}>{cat.desc}</p>
                <p className="text-white/40 text-xs font-semibold mt-0.5">{cat.sub}</p>
              </div>

              {/* Arrow */}
              <div className="text-2xl" style={{ color:cat.color }}>›</div>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-white/20 text-xs pb-4">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
}
