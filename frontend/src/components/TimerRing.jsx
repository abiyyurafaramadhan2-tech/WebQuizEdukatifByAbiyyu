import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function TimerRing({ duration = 30, onExpire, isPaused = false }) {
  const [left, setLeft] = useState(duration);
  const ref = useRef(null);

  useEffect(() => { setLeft(duration); }, [duration]);

  useEffect(() => {
    if (isPaused || left <= 0) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setLeft(p => { if (p <= 1) { onExpire?.(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [left, isPaused]);

  const r    = 33;
  const circ = 2 * Math.PI * r;
  const pct  = left / duration;
  const col  = left > 10 ? '#22c55e' : left > 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5.5"/>
        <motion.circle cx="40" cy="40" r={r} fill="none" stroke={col}
          strokeWidth="5.5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 40 40)"
          style={{ filter:`drop-shadow(0 0 6px ${col})` }}
          transition={{ duration:0.9, ease:'linear' }}
        />
      </svg>
      <motion.div className="absolute font-black text-2xl" style={{ color:col }}
        animate={left <= 5 ? { scale:[1,1.3,1] } : {}}
        transition={{ duration:0.5, repeat:left<=5?Infinity:0 }}>
        {left}
      </motion.div>
    </div>
  );
}
