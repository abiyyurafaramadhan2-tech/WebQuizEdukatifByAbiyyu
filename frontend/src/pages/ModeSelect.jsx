import { useState }    from 'react';
import { useNavigate } from 'react-router-dom';
import { motion }      from 'framer-motion';
import api             from '../api';

const MODES = [
  {
    id:    'practice',
    emoji: '📖',
    label: 'Mode Latihan',
    desc:  'Ada penjelasan dari AI Tutor saat kamu salah',
    perks: ['✅ Penjelasan AI tiap soal', '✅ Tidak ada tekanan waktu yang berat', '✅ Cocok untuk belajar konsep baru'],
    color: '#22c55e',
    bg:    'linear-gradient(135deg,#16a34a,#22c55e)',
  },
  {
    id:    'exam',
    emoji: '📝',
    label: 'Mode Ujian',
    desc:  'Simulasi ujian sesungguhnya tanpa bantuan',
    perks: ['⚡ Tanpa penjelasan soal', '⚡ Timer ketat', '⚡ Skor masuk leaderboard'],
    color: '#ef4444',
    bg:    'linear-gradient(135deg,#dc2626,#ef4444)',
  },
];

export default function ModeSelect() {
  const navigate  = useNavigate();
  const [mode,    setMode]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const category    = sessionStorage.getItem('qg_category')    || '';
  const classLevel  = sessionStorage.getItem('qg_classLevel')  || '';
  const subject     = sessionStorage.getItem('qg_subject')     || '';
  const subCategory = sessionStorage.getItem('qg_subCategory') || '';

  const handleStart = async () => {
    if (!mode) return;
    setError(''); setLoading(true);

    try {
      const payload = {
        category,
        mode,
        ...(classLevel  && { classLevel }),
        ...(subject     && { subject    }),
        ...(subCategory && { subCategory }),
      };

      const res = await api.post('/quiz/start', payload);
      sessionStorage.setItem('qg_session', JSON.stringify({
        sessionId:      res.data.sessionId,
        questions:      res.data.questions,
        totalQuestions: res.data.totalQuestions,
        config:         res.data.config,
        mode,
        category,
      }));
      navigate('/quiz');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memulai quiz. Cek API Key AI di server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/subcategory')}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white text-lg">
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-xl">Pilih Mode</h1>
          <p className="text-white/50 text-xs font-semibold">
            {category === 'school'
              ? `Kelas ${classLevel} · ${subject}`
              : `${category.toUpperCase()} · ${subCategory}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {MODES.map((m, i) => (
          <motion.button key={m.id}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale:0.97 }}
            onClick={() => setMode(m.id)}
            className="card-hover w-full text-left rounded-3xl p-5 border-2 transition-all overflow-hidden relative"
            style={{
              background:  mode === m.id ? `${m.color}18` : 'rgba(255,255,255,0.05)',
              borderColor: mode === m.id ? m.color : 'rgba(255,255,255,0.12)',
              boxShadow:   mode === m.id ? `0 0 30px ${m.color}30` : 'none',
            }}>

            {/* Bg glow */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-15"
              style={{ background:m.bg }}/>

            <div className="relative flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background:m.bg, boxShadow:`0 6px 20px ${m.color}44` }}>
                {m.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg">{m.label}</h3>
                <p className="text-white/50 text-sm font-semibold">{m.desc}</p>
              </div>
              {mode === m.id && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background:m.color }}>
                  <span className="text-white text-sm font-black">✓</span>
                </div>
              )}
            </div>

            <div className="relative space-y-1">
              {m.perks.map(p => (
                <p key={p} className="text-white/60 text-xs font-semibold">{p}</p>
              ))}
            </div>
          </motion.button>
        ))}

        {/* Info soal */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-white font-black text-sm">20 Soal per Quiz</p>
            <p className="text-white/50 text-xs font-semibold">Semua soal di-generate real-time oleh AI</p>
          </div>
        </div>

        {/* Tombol mulai */}
        <motion.button
          whileTap={{ scale:0.97 }}
          onClick={handleStart}
          disabled={!mode || loading}
          className="btn-primary w-full py-5 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
          {loading ? (
            <>
              <motion.span
                animate={{ rotate:360 }}
                transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full"/>
              <span>AI membuat 20 soal... (±15 detik)</span>
            </>
          ) : (
            <>
              <span className="text-2xl">⚡</span>
              <span>{mode ? 'Mulai Quiz!' : 'Pilih mode dulu'}</span>
            </>
          )}
        </motion.button>
      </div>

      <p className="text-center text-white/20 text-xs mt-8">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
              }
