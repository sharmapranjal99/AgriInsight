import { motion } from "framer-motion";

/** Decorative hero landscape: sun, a three-season ring and terraced fields. */
export function HeroLandscape() {
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => [260 + r * Math.cos((a * Math.PI) / 180), 200 + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  return (
    <svg viewBox="0 0 520 460" aria-hidden="true" style={{ width: "100%", height: "auto" }}>
      <defs>
        <radialGradient id="sunglow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f6c879" stopOpacity=".9" />
          <stop offset=".45" stopColor="#e3a24a" stopOpacity=".35" />
          <stop offset="1" stopColor="#e3a24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2f7a52" /><stop offset="1" stopColor="#1b4d34" /></linearGradient>
        <linearGradient id="h2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3f9b69" /><stop offset="1" stopColor="#226043" /></linearGradient>
        <linearGradient id="h3" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c9a86a" /><stop offset="1" stopColor="#9c7b46" /></linearGradient>
        <clipPath id="frame"><rect x="20" y="20" width="480" height="420" rx="36" /></clipPath>
      </defs>
      <rect x="20" y="20" width="480" height="420" rx="36" fill="#143524" stroke="rgba(255,255,255,.08)" />
      <g clipPath="url(#frame)">
        <circle cx="260" cy="200" r="150" fill="url(#sunglow)" />
        <motion.circle cx="260" cy="200" r="46" fill="#f2c26e" initial={{ scale: 0.9 }} animate={{ scale: [0.96, 1.03, 0.96] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "260px 200px" }} />
        <path d="M20 300 C 120 250, 200 262, 290 286 S 440 300, 500 268 L500 440 L20 440Z" fill="url(#h1)" />
        <path d="M20 340 C 110 300, 230 312, 320 336 S 450 344, 500 322 L500 440 L20 440Z" fill="url(#h2)" />
        <path d="M20 382 C 140 352, 260 360, 360 378 S 460 384, 500 372 L500 440 L20 440Z" fill="url(#h3)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${260 + (i - 6.5) * 12} 372 L ${260 + (i - 6.5) * 52} 450`} stroke="#7d5f35" strokeWidth="2" opacity=".45" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 70 + i * 46, yb = 338 - Math.sin(i / 1.4) * 6;
          return (
            <g key={i} opacity=".9">
              <path d={`M${x} ${yb} q -2 -18 0 -30`} stroke="#9fdcb9" strokeWidth="2" fill="none" />
              <path d={`M${x} ${yb - 16} q -10 -6 -12 -16 q 10 2 12 16Z`} fill="#7fd1a8" />
              <path d={`M${x} ${yb - 22} q 10 -6 12 -16 q -10 2 -12 16Z`} fill="#a7e3c2" />
            </g>
          );
        })}
      </g>
      {/* season ring */}
      <g fill="none" strokeWidth="7" strokeLinecap="round">
        <motion.path d={arc(96, 185, 295)} stroke="#2ba36d" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />
        <motion.path d={arc(96, 305, 395)} stroke="#5b8fcb" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }} />
        <motion.path d={arc(96, 405, 535)} stroke="#e3a24a" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 1.4 }} />
      </g>
      <g fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" letterSpacing=".08em">
        <text x="150" y="128" fill="#7fd1a8">KHARIF</text>
        <text x="352" y="150" fill="#a9c8ee">RABI</text>
        <text x="318" y="318" fill="#f2c26e">ZAID</text>
      </g>
    </svg>
  );
}

/** Subtle line-art for section headers. */
export function FieldLines() {
  return (
    <svg className="page-hero-art" viewBox="0 0 420 220" aria-hidden="true">
      <g fill="none" stroke="#1f8a5b" strokeWidth="1.2" opacity=".55">
        {Array.from({ length: 11 }).map((_, i) => (
          <path key={i} d={`M0 ${200 - i * 4} C 120 ${150 - i * 9}, 260 ${170 - i * 10}, 420 ${110 - i * 8}`} />
        ))}
      </g>
      <circle cx="330" cy="58" r="26" fill="#d08a2e" opacity=".22" />
      {[60, 110, 160, 210].map((x, i) => (
        <g key={x} transform={`translate(${x} ${178 - i * 12})`} opacity=".7">
          <path d="M0 0 q -1 -14 0 -24" stroke="#1e4d35" strokeWidth="1.6" fill="none" />
          <path d="M0 -12 q -8 -4 -10 -12 q 8 2 10 12Z" fill="#2ba36d" />
          <path d="M0 -17 q 8 -4 10 -12 q -8 2 -10 12Z" fill="#7fd1a8" />
        </g>
      ))}
    </svg>
  );
}
