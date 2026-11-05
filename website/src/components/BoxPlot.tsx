import { useEffect, useRef, useState } from "react";
import type { BoxStat } from "../data/types";
import { SEASON_COLOR } from "../lib/format";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(min: number, max: number, count = 5) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? mag * 10;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) ticks.push(Number(v.toPrecision(10)));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/** Boxplot with seaborn-style whiskers (1.5 × IQR), outliers hidden — matching the notebook. */
export function BoxPlot({ data, format, height = 300, zeroLine, unit }: { data: BoxStat[]; format: (v: number) => string; height?: number; zeroLine?: boolean; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { t: 14, r: 12, b: 34, l: 64 };
  const lo = Math.min(...data.map((d) => d.min), zeroLine ? 0 : Infinity);
  const hi = Math.max(...data.map((d) => d.max));
  const ticks = niceTicks(Math.min(lo, 0 < lo && lo < hi * 0.25 ? 0 : lo), hi);
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const ih = height - m.t - m.b, iw = Math.max(100, width - m.l - m.r);
  const y = (v: number) => m.t + ih - ((v - y0) / (y1 - y0)) * ih;
  const band = iw / data.length;
  const bw = Math.min(90, band * 0.46);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg width={width} height={height} role="img" aria-label={`Boxplot by season${unit ? ` (${unit})` : ""}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} stroke="#ece8de" />
            <text x={m.l - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize={12} fill="#5d6c62">{format(t)}</text>
          </g>
        ))}
        {zeroLine && y0 < 0 && <line x1={m.l} x2={m.l + iw} y1={y(0)} y2={y(0)} stroke="#13231a" strokeWidth={1.2} />}
        {data.map((d, i) => {
          const cx = m.l + band * i + band / 2;
          const c = SEASON_COLOR[d.season];
          const dim = hover !== null && hover !== i;
          return (
            <g key={d.season} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "default", opacity: dim ? 0.45 : 1, transition: "opacity .2s" }}>
              <rect x={cx - band / 2} y={m.t} width={band} height={ih} fill="transparent" />
              <line x1={cx} x2={cx} y1={y(d.max)} y2={y(d.q3)} stroke={c} strokeWidth={1.6} />
              <line x1={cx} x2={cx} y1={y(d.q1)} y2={y(d.min)} stroke={c} strokeWidth={1.6} />
              <line x1={cx - bw / 4} x2={cx + bw / 4} y1={y(d.max)} y2={y(d.max)} stroke={c} strokeWidth={1.6} />
              <line x1={cx - bw / 4} x2={cx + bw / 4} y1={y(d.min)} y2={y(d.min)} stroke={c} strokeWidth={1.6} />
              <rect x={cx - bw / 2} y={y(d.q3)} width={bw} height={Math.max(1, y(d.q1) - y(d.q3))} rx={6} fill={c} fillOpacity={0.16} stroke={c} strokeWidth={1.6} />
              <line x1={cx - bw / 2} x2={cx + bw / 2} y1={y(d.median)} y2={y(d.median)} stroke={c} strokeWidth={3} />
              <circle cx={cx} cy={y(d.mean)} r={4} fill="#fff" stroke={c} strokeWidth={2} />
              <text x={cx} y={height - 10} textAnchor="middle" fontSize={13} fontWeight={600} fill="#2c3d33">{d.season}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (() => {
        const d = data[hover];
        const cx = m.l + band * hover + band / 2;
        const left = Math.min(Math.max(8, cx + bw / 2 + 10), width - 180);
        return (
          <div className="tip" style={{ position: "absolute", top: 10, left }}>
            <div className="tip-t">{d.season} · n = {d.n.toLocaleString("en-IN")}</div>
            {([["Upper whisker", d.max], ["Q3 (75%)", d.q3], ["Median", d.median], ["Mean", d.mean], ["Q1 (25%)", d.q1], ["Lower whisker", d.min]] as const).map(([k, v]) => (
              <div className="tip-r" key={k}><span className="tip-k">{k}</span><b>{format(v)}</b></div>
            ))}
          </div>
        );
      })()}
      <div className="legend" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
        <span><svg width="18" height="10"><line x1="0" x2="18" y1="5" y2="5" stroke="#5d6c62" strokeWidth="3" /></svg>Median</span>
        <span><svg width="10" height="10"><circle cx="5" cy="5" r="3.5" fill="#fff" stroke="#5d6c62" strokeWidth="1.5" /></svg>Mean</span>
        <span>Box = interquartile range · whiskers = 1.5 × IQR · outliers hidden</span>
      </div>
    </div>
  );
}
