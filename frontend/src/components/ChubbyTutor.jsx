import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const MOODS = {
  idle:       { color:'#6366f1', eye:'normal',  mouth:'smile',  emoji:'🧠', bounce:false },
  happy:      { color:'#22c55e', eye:'happy',   mouth:'big',    emoji:'🎉', bounce:true  },
  cheering:   { color:'#f59e0b', eye:'star',    mouth:'wow',    emoji:'🔥', bounce:true  },
  explaining: { color:'#3b82f6', eye:'normal',  mouth:'talk',   emoji:'💡', bounce:false },
  sad:        { color:'#ef4444', eye:'sad',     mouth:'frown',  emoji:'😅', bounce:false },
  focused:    { color:'#334155', eye:'glasses', mouth:'line',   emoji:'🎓', bounce:false },
  urgent:     { color:'#dc2626', eye:'glasses', mouth:'worry',  emoji:'⏰', bounce:true  },
  proud:      { color:'#059669', eye:'glasses', mouth:'smile',  emoji:'✅', bounce:false },
};

function Eyes({ type }) {
  if (type === 'glasses') return <>
    <rect x="18" y="25" width="19" height="13" rx="4" fill="rgba(200,230,255,0.2)" stroke="#0f172a" strokeWidth="2.5"/>
    <rect x="44" y="25" width="19" height="13" rx="4" fill="rgba(200,230,255,0.2)" stroke="#0f172a" strokeWidth="2.5"/>
    <line x1="37" y1="31" x2="44" y2="31" stroke="#0f172a" strokeWidth="2"/>
    <circle cx="27" cy="31" r="3" fill="#0f172a"/>
    <circle cx="53" cy="31" r="3" fill="#0f172a"/>
    <circle cx="29" cy="29" r="1" fill="white"/>
    <circle cx="55" cy="29" r="1" fill="white"/>
  </>;
  if (type === 'star') return <>
    <text x="28" y="40" textAnchor="middle" fontSize="14">⭐</text>
    <text x="54" y="40" textAnchor="middle" fontSize="14">⭐</text>
  </>;
  if (type === 'happy') return <>
    <path d="M20 36 Q28 27 36 36" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M46 36 Q54 27 62 36" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round"/>
  </>;
  if (type === 'sad') return <>
    <circle cx="28" cy="31" r="5" fill="#0f172a"/>
    <circle cx="54" cy="31" r="5" fill="#0f172a"/>
    <circle cx="30" cy="29" r="1.5" fill="white"/>
    <circle cx="56" cy="29" r="1.5" fill="white"/>
  </>;
  return <>
    <circle cx="28" cy="31" r="5" fill="#0f172a"/>
    <circle cx="54" cy="31" r="5" fill="#0f172a"/>
    <circle cx="30" cy="29" r="1.5" fill="white"/>
    <circle cx="56" cy="29" r="1.5" fill="white"/>
  </>;
}

function Mouth({ type }) {
  if (type === 'big')   return <path d="M22 56 Q41 70 60 56" fill="#0f172a"/>;
  if (type === 'wow')   return <ellipse cx="41" cy="59" rx="10" ry="8" fill="#0f172a"/>;
  if (type === 'frown') return <path d="M25 63 Q41 53 57 63" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>;
  if (type === 'line')  return <line x1="28" y1="61" x2="54" y2="61" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>;
  if (type === 'worry') return <path d="M27 63 Q41 59 55 63" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>;
  if (type === 'talk')  return <>
    <path d="M24 58 Q41 68 58 58" fill="#0f172a"/>
    <path d="M29 58 Q41 53 53 58" fill="#ffaaaa"/>
  </>;
  return <path d="M25 60 Q41 69 57 60" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>;
}

export default function ChubbyTutor({ mood = 'idle', message = '', mode = 'practice', size = 100 }) {
  const [doBounce, setDoBounce] = useState(false);
  const cfg = MOODS[mood] || MOODS.idle;

  useEffect(() => {
    if (cfg.bounce) { setDoBounce(true); const t = setTimeout(() => setDoBounce(false), 900); return () => clearTimeout(t); }
  }, [mood]);

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={{
          y:      doBounce ? [0, -22, 0, -11, 0] : [0, -6, 0],
          scale:  doBounce ? [1, 1.12, 1] : 1,
          rotate: mood === 'cheering' ? [-5, 5, -3, 0] : 0,
        }}
        transition={{ duration: doBounce ? 0.7 : 3.5, repeat: doBounce ? 0 : Infinity, ease: 'easeInOut' }}
      >
        <svg width={size} height={size * 1.1} viewBox="0 0 82 92">
          <ellipse cx="41" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
          <ellipse cx="41" cy="68" rx="24" ry="19" fill={cfg.color}/>
          {mood === 'cheering' ? <>
            <path d="M17 57 Q5 38 9 26" stroke={cfg.color} strokeWidth="9" fill="none" strokeLinecap="round"/>
            <path d="M65 57 Q77 38 73 26" stroke={cfg.color} strokeWidth="9" fill="none" strokeLinecap="round"/>
            <circle cx="9"  cy="25" r="6" fill={cfg.color}/>
            <circle cx="73" cy="25" r="6" fill={cfg.color}/>
          </> : <>
            <path d="M17 64 Q7 68 9 76" stroke={cfg.color} strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M65 64 Q75 68 73 76" stroke={cfg.color} strokeWidth="8" fill="none" strokeLinecap="round"/>
          </>}
          <rect x="27" y="83" width="9" height="10" rx="4" fill={cfg.color}/>
          <rect x="46" y="83" width="9" height="10" rx="4" fill={cfg.color}/>
          <circle cx="41" cy="37" r="28" fill={cfg.color}/>
          <circle cx="16" cy="43" r="8" fill="rgba(255,200,200,0.35)"/>
          <circle cx="66" cy="43" r="8" fill="rgba(255,200,200,0.35)"/>
          <circle cx="35" cy="21" r="8" fill="rgba(255,255,255,0.12)"/>
          <Eyes type={cfg.eye}/>
          <Mouth type={cfg.mouth}/>
          <motion.text x="58" y="15" fontSize="16" textAnchor="middle"
            animate={{ scale:[1,1.2,1], rotate:[0,10,-10,0] }}
            transition={{ duration:2.5, repeat:Infinity }}>
            {cfg.emoji}
          </motion.text>
        </svg>
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div key={message.slice(0,15)}
            initial={{ opacity:0, y:8, scale:0.9 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.9 }}
            className="max-w-[230px] text-center"
          >
            <div className="relative px-3 py-2 rounded-2xl text-sm text-slate-200 leading-snug font-semibold"
              style={{ background:`${cfg.color}25`, border:`2px solid ${cfg.color}45` }}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderBottom:`10px solid ${cfg.color}45` }}/>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
          }
