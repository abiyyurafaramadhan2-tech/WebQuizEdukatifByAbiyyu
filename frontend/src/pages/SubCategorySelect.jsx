import { useState }    from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ────────────────────────────────────────────
const DATA = {
  school: {
    title:  '📘 Sekolah',
    step1:  { label:'Pilih Kelas', key:'classLevel' },
    step1Options: Array.from({length:12}, (_,i) => ({
      id:    String(i+1),
      label: `Kelas ${i+1}`,
      emoji: ['🐣','🐥','🌱','🌿','🌲','🌳','🎒','🚀','⚡','🔥','💎','👑'][i],
      color: ['#4ade80','#22d3ee','#818cf8','#c084fc','#fb7185','#f97316','#facc15','#34d399','#60a5fa','#a78bfa','#f472b6','#fbbf24'][i],
    })),
    step2: { label:'Pilih Mata Pelajaran', key:'subject' },
    step2Options: [
      { id:'math',       label:'Matematika',       emoji:'🔢', color:'#6366f1' },
      { id:'science',    label:'IPA',              emoji:'🔬', color:'#22c55e' },
      { id:'social',     label:'IPS',              emoji:'🌏', color:'#f97316' },
      { id:'indonesian', label:'Bahasa Indonesia', emoji:'📚', color:'#f59e0b' },
      { id:'english',    label:'Bahasa Inggris',   emoji:'🌐', color:'#06b6d4' },
      { id:'history',    label:'Sejarah',          emoji:'🏛', color:'#84cc16' },
      { id:'civics',     label:'PKN',              emoji:'🏳', color:'#ef4444' },
      { id:'biology',    label:'Biologi',          emoji:'🧬', color:'#10b981' },
      { id:'chemistry',  label:'Kimia',            emoji:'⚗',  color:'#f59e0b' },
      { id:'physics',    label:'Fisika',           emoji:'⚛',  color:'#3b82f6' },
      { id:'economics',  label:'Ekonomi',          emoji:'📊', color:'#f97316' },
      { id:'geography',  label:'Geografi',         emoji:'🌍', color:'#8b5cf6' },
    ],
  },
  utbk: {
    title:  '🎓 UTBK',
    step1:  null,
    step2:  { label:'Pilih Sub-Tes UTBK', key:'subCategory' },
    step2Options: [
      { id:'TPS',      label:'TPS',              emoji:'🧩', color:'#6366f1', desc:'Tes Potensi Skolastik' },
      { id:'Literasi', label:'Literasi',          emoji:'📖', color:'#22c55e', desc:'Bahasa Indonesia & Inggris' },
      { id:'Penalaran',label:'Penalaran Mat.',   emoji:'📐', color:'#f59e0b', desc:'Penalaran Matematika' },
    ],
  },
  tpa: {
    title:  '🧠 TPA / TPS',
    step1:  null,
    step2:  { label:'Pilih Sub-Tes TPA', key:'subCategory' },
    step2Options: [
      { id:'Verbal',  label:'Verbal',  emoji:'💬', color:'#6366f1', desc:'Sinonim, antonim, analogi' },
      { id:'Numerik', label:'Numerik', emoji:'🔢', color:'#22c55e', desc:'Deret, aritmatika, perbandingan' },
      { id:'Logika',  label:'Logika',  emoji:'🧩', color:'#f59e0b', desc:'Silogisme, analitik, deduksi' },
      { id:'Spasial', label:'Spasial', emoji:'🔷', color:'#ef4444', desc:'Gambar, pola, rotasi' },
    ],
  },
  skd: {
    title:  '🏛️ SKD CPNS',
    step1:  null,
    step2:  { label:'Pilih Sub-Tes SKD', key:'subCategory' },
    step2Options: [
      { id:'TWK', label:'TWK', emoji:'🇮🇩', color:'#ef4444', desc:'Wawasan Kebangsaan' },
      { id:'TIU', label:'TIU', emoji:'🧠',  color:'#6366f1', desc:'Intelegensia Umum' },
      { id:'TKP', label:'TKP', emoji:'🤝',  color:'#22c55e', desc:'Karakteristik Pribadi' },
    ],
  },
};

export default function SubCategorySelect() {
  const navigate    = useNavigate();
  const categoryId  = sessionStorage.getItem('qg_category') || 'school';
  const cfg         = DATA[categoryId] || DATA.school;

  const [classLevel, setClassLevel] = useState(null);
  const [subject,    setSubject]    = useState(null);

  const needsStep1 = !!cfg.step1;
  const step       = needsStep1 && !classLevel ? 1 : 2;

  const proceed = () => {
    sessionStorage.setItem('qg_classLevel',  classLevel  || '');
    sessionStorage.setItem('qg_subject',     subject     || '');
    sessionStorage.setItem('qg_subCategory', needsStep1 ? subject || '' : subject || '');
    navigate('/mode');
  };

  const canProceed = needsStep1
    ? (classLevel && subject)
    : subject;

  return (
    <div className="min-h-screen pb-8"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3 relative">
        <button onClick={() => navigate('/category')}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white text-lg">
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-xl">{cfg.title}</h1>
          <p className="text-white/50 text-xs font-semibold">
            {needsStep1 ? (step === 1 ? 'Langkah 1 dari 2' : 'Langkah 2 dari 2') : 'Pilih sub-tes'}
          </p>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">

        {/* STEP 1: Class Level (Sekolah only) */}
        <AnimatePresence mode="wait">
          {needsStep1 && step === 1 && (
            <motion.div key="step1"
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}>
              <h2 className="text-white font-black text-lg mb-4">{cfg.step1.label}</h2>
              <div className="grid grid-cols-4 gap-2.5">
                {cfg.step1Options.map(opt => (
                  <motion.button key={opt.id} whileTap={{ scale:0.93 }}
                    onClick={() => setClassLevel(opt.id)}
                    className="p-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all"
                    style={{
                      background:  classLevel === opt.id ? `${opt.color}25` : 'rgba(255,255,255,0.05)',
                      borderColor: classLevel === opt.id ? opt.color : 'rgba(255,255,255,0.1)',
                      boxShadow:   classLevel === opt.id ? `0 0 16px ${opt.color}44` : 'none',
                    }}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-white text-[11px] font-black">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
              {classLevel && (
                <motion.button initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  whileTap={{ scale:0.97 }}
                  onClick={() => {/* tetap di step 1, lanjut ke step 2 scroll */}}
                  className="btn-primary w-full py-4 text-lg mt-5">
                  Lanjut Pilih Mapel →
                </motion.button>
              )}
            </motion.div>
          )}

          {/* STEP 2: Subject / SubCategory */}
          {(!needsStep1 || step === 2) && (
            <motion.div key="step2"
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}>

              {needsStep1 && (
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setClassLevel(null)}
                    className="text-indigo-400 text-sm font-bold hover:text-indigo-300">
                    ← Ganti Kelas
                  </button>
                  <span className="text-white/30">·</span>
                  <span className="text-white/60 text-sm font-bold">Kelas {classLevel}</span>
                </div>
              )}

              <h2 className="text-white font-black text-lg mb-4">{cfg.step2.label}</h2>

              <div className={`grid gap-3 ${needsStep1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {cfg.step2Options.map((opt, i) => (
                  <motion.button key={opt.id}
                    initial={{ opacity:0, y:15 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale:0.96 }}
                    onClick={() => setSubject(opt.id)}
                    className="card-hover flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      background:  subject === opt.id ? `${opt.color}22` : 'rgba(255,255,255,0.05)',
                      borderColor: subject === opt.id ? opt.color : 'rgba(255,255,255,0.1)',
                      boxShadow:   subject === opt.id ? `0 0 20px ${opt.color}33` : 'none',
                    }}>
                    <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm leading-tight">{opt.label}</p>
                      {opt.desc && <p className="text-white/40 text-xs font-semibold mt-0.5 truncate">{opt.desc}</p>}
                    </div>
                    {subject === opt.id && (
                      <span className="text-xl flex-shrink-0" style={{ color:opt.color }}>✓</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tombol Lanjut */}
        <AnimatePresence>
          {canProceed && (
            <motion.button
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              whileTap={{ scale:0.97 }}
              onClick={proceed}
              className="btn-primary w-full py-5 text-xl mt-6 flex items-center justify-center gap-3">
              <span>Lanjut ke Mode Belajar</span>
              <span>→</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-white/20 text-xs mt-8">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
}
