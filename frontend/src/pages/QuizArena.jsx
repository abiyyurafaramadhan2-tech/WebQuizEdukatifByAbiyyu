import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }   from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios             from 'axios';
import ChubbyTutor       from '../components/ChubbyTutor';
import TimerRing         from '../components/TimerRing';
import StreakEffect       from '../components/StreakEffect';
import api               from '../api';

const OPT_COLORS = { A:'#6366f1', B:'#22c55e', C:'#f59e0b', D:'#ef4444' };
const OPT_BG     = { A:'rgba(99,102,241,0.15)', B:'rgba(34,197,94,0.15)', C:'rgba(245,158,11,0.15)', D:'rgba(239,68,68,0.15)' };

export default function QuizArena() {
  const navigate    = useNavigate();
  const sessionData = JSON.parse(sessionStorage.getItem('qg_session') || '{}');

  const [questions,   setQuestions]   = useState(sessionData.questions || []);
  const [qi,          setQi]          = useState(0);
  const [score,       setScore]       = useState(0);
  const [streak,      setStreak]      = useState(0);
  const [correct,     setCorrect]     = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [result,      setResult]      = useState(null);
  const [tutorMood,   setTutorMood]   = useState('idle');
  const [tutorMsg,    setTutorMsg]    = useState('');
  const [showStreak,  setShowStreak]  = useState(false);
  const [timerKey,    setTimerKey]    = useState(0);
  const [busy,        setBusy]        = useState(false);
  const [ptsPopup,    setPtsPopup]    = useState(null);
  const tStart = useRef(Date.now());

  const q      = questions[qi];
  const total  = questions.length;
  const isLast = qi >= total - 1;
  const isExam = sessionData.mode === 'exam';
  const config = sessionData.config || { time:30, streak:3 };

  // Redirect jika tidak ada session
  useEffect(() => {
    if (!sessionData.sessionId || questions.length === 0) {
      navigate('/dashboard');
    }
  }, []);

  // Sapaan awal
  useEffect(() => {
    setTimeout(() => {
      if (!isExam) {
        setTutorMood('happy');
        setTutorMsg('Ayo semangat! Aku siap bantu 🧠');
      } else {
        setTutorMood('focused');
        setTutorMsg('Mode ujian dimulai! Fokus ya 📝');
      }
    }, 500);
  }, []);

  const submitAnswer = useCallback(async (answer, timeTaken) => {
    if (busy || result || !q) return;
    setBusy(true);
    setSelected(answer);

    try {
      const { data } = await api.post('/quiz/answer', {
        sessionId: sessionData.sessionId,
        qi,
        answer,
        timeTaken: Math.floor(timeTaken),
      });

      setResult(data);
      setScore(data.totalScore);
      setStreak(data.newStreak);
      if (data.isCorrect) setCorrect(c => c + 1);

      // Popup poin
      if (data.earned > 0) {
        setPtsPopup({ pts: data.earned, bonus: data.timeBonus + data.stkBonus });
        setTimeout(() => setPtsPopup(null), 1800);
      }

      // Streak effect
      if (data.newStreak > 0 && data.newStreak % config.streak === 0) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 1800);
      }

      // Tutor reaction
      if (!isExam) {
        if (data.isCorrect) {
          if (data.newStreak >= 7) {
            setTutorMood('cheering');
            setTutorMsg('🔥 LUAR BIASA! Kamu gila pintar!');
          } else if (data.newStreak >= 3) {
            setTutorMood('cheering');
            setTutorMsg('✨ Streak! Terus pertahankan!');
          } else {
            setTutorMood('happy');
            setTutorMsg('Benar! Kamu keren banget! 🎉');
          }
        } else {
          setTutorMood('explaining');
          setTutorMsg(data.explanation || 'Hampir! Coba pelajari lagi ya.');
        }
      } else {
        setTutorMood(data.isCorrect ? 'proud' : 'focused');
        setTutorMsg(data.isCorrect ? '✓ Tepat!' : '✗ Next!');
      }

    } catch (err) {
      console.error('[answer]', err);
      setTutorMood('sad');
      setTutorMsg('Koneksi bermasalah. Coba lagi...');
    } finally {
      setBusy(false);
    }
  }, [qi, sessionData.sessionId, busy, result, q, isExam, config.streak]);

  const handleExpire = useCallback(() => {
    if (!result && !busy) {
      submitAnswer('A', config.time);
      setTutorMood(isExam ? 'urgent' : 'sad');
      setTutorMsg(isExam ? '⏰ Waktu habis!' : '⏰ Waktu habis! Tenang ya~');
    }
  }, [result, busy, submitAnswer, isExam, config.time]);

  const nextQuestion = useCallback(async () => {
    if (isLast) {
      // Finish quiz
      try {
        const { data } = await api.post('/quiz/finish', {
          sessionId: sessionData.sessionId,
        });
        sessionStorage.setItem('qg_result', JSON.stringify({
          ...data,
          score,
          correct: correct + (result?.isCorrect ? 0 : 0),
          total,
          category: sessionData.category,
          mode: sessionData.mode,
        }));
        navigate('/result');
      } catch {
        navigate('/dashboard');
      }
      return;
    }

    setQi(i => i + 1);
    setSelected(null);
    setResult(null);
    setTutorMood(isExam ? 'focused' : 'idle');
    setTutorMsg('');
    setTimerKey(k => k + 1);
    tStart.current = Date.now();
  }, [isLast, sessionData.sessionId, score, correct, total, result, isExam, navigate, sessionData.category, sessionData.mode]);

  const handleQuit = async () => {
    if (!window.confirm('Yakin keluar? Progress tidak tersimpan.')) return;
    try {
      await api.post('/quiz/quit', { sessionId: sessionData.sessionId });
    } catch {}
    navigate('/dashboard');
  };

  if (!q) return null;

  const progress = ((qi) / total) * 100;

  return (
    <div className="min-h-screen pb-6"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>

      <StreakEffect streak={streak} show={showStreak} />

      <div className="max-w-lg mx-auto px-4">

        {/* Progress bar */}
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2">
            <button onClick={handleQuit}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0 text-lg">
              ✕
            </button>
            <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)' }}
                animate={{ width:`${progress}%` }}
                transition={{ duration:0.5 }}
              />
            </div>
            <span className="text-white/50 text-xs font-black w-12 text-right flex-shrink-0">
              {qi + 1}/{total}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {/* Score */}
            <motion.div key={score}
              initial={{ scale:1.3, color:'#fbbf24' }}
              animate={{ scale:1, color:'#ffffff' }}
              transition={{ duration:0.4 }}
              className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl">
              <span>⭐</span>
              <span className="font-black text-sm text-white">{score.toLocaleString()}</span>
            </motion.div>

            {/* Streak */}
            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  initial={{ scale:0, opacity:0 }}
                  animate={{ scale:1, opacity:1 }}
                  exit={{ scale:0, opacity:0 }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-sm"
                  style={{ background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}>
                  🔥 ×{streak}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timer */}
          <TimerRing
            key={timerKey}
            duration={config.time}
            onExpire={handleExpire}
            isPaused={!!result}
          />
        </div>

        {/* ChubbyTutor */}
        <div className="flex justify-center py-2">
          <ChubbyTutor
            mood={tutorMood}
            message={tutorMsg}
            mode={sessionData.mode}
            size={85}
          />
        </div>

        {/* Points popup */}
        <AnimatePresence>
          {ptsPopup && (
            <motion.div
              className="fixed top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
              initial={{ y:0, opacity:1, scale:0.8 }}
              animate={{ y:-80, opacity:0, scale:1.3 }}
              transition={{ duration:1.5, ease:'easeOut' }}>
              <div className="text-4xl font-black text-yellow-400 drop-shadow-lg">
                +{ptsPopup.pts}
              </div>
              {ptsPopup.bonus > 0 && (
                <div className="text-sm font-black text-orange-300">
                  +{ptsPopup.bonus} bonus!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={qi}
            initial={{ opacity:0, y:30, scale:0.96 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-20, scale:0.96 }}
            transition={{ type:'spring', stiffness:300, damping:28 }}
            className="glass rounded-3xl p-5 mb-4">

            {/* Topic */}
            {q.topic && (
              <div className="inline-block bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-bold text-indigo-300 mb-3">
                📌 {q.topic}
              </div>
            )}

            {/* Question text */}
            <p className="text-white font-bold text-base leading-relaxed mb-5">
              {q.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {Object.entries(q.options || {}).map(([key, text]) => {
                const isSel   = selected === key;
                const isRight = result?.correctAnswer === key;
                const isWrong = isSel && result && !result.isCorrect;

                let bg     = 'rgba(255,255,255,0.05)';
                let border = 'rgba(255,255,255,0.12)';
                let shadow = 'none';

                if (result) {
                  if (isRight) {
                    bg = 'rgba(34,197,94,0.2)';
                    border = '#22c55e';
                    shadow = '0 0 20px rgba(34,197,94,0.4)';
                  } else if (isWrong) {
                    bg = 'rgba(239,68,68,0.2)';
                    border = '#ef4444';
                    shadow = '0 0 16px rgba(239,68,68,0.3)';
                  }
                } else if (isSel) {
                  bg     = OPT_BG[key];
                  border = OPT_COLORS[key];
                }

                return (
                  <motion.button key={key}
                    whileHover={!result ? { x:4, scale:1.01 } : {}}
                    whileTap={!result ? { scale:0.97 } : {}}
                    onClick={() => {
                      if (result || busy) return;
                      const elapsed = (Date.now() - tStart.current) / 1000;
                      submitAnswer(key, elapsed);
                    }}
                    disabled={!!result || busy}
                    className="flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-sm transition-all"
                    style={{ background:bg, border:`2px solid ${border}`, boxShadow:shadow, color:'white' }}>

                    {/* Option key badge */}
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                      style={{ background: OPT_COLORS[key] }}>
                      {key}
                    </span>

                    <span className="flex-1 leading-snug">{text}</span>

                    {result && isRight && <span className="text-green-400 text-xl flex-shrink-0">✓</span>}
                    {result && isWrong && <span className="text-red-400 text-xl flex-shrink-0">✗</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {result && (
            <motion.button
              initial={{ opacity:0, y:15 }}
              animate={{ opacity:1, y:0 }}
              whileTap={{ scale:0.97 }}
              onClick={nextQuestion}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
              {isLast ? (
                <><span className="text-xl">🏆</span> Lihat Hasil!</>
              ) : (
                <><span className="text-xl">⚡</span> Soal Berikutnya →</>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-white/20 text-xs mt-6">© Abiyyu Rafa Ramadhan</p>
    </div>
  );
      }
