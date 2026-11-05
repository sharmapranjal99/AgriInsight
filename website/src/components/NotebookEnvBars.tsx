import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates one panel at a time of notebook cell [38] (the 7-subplot environmental figure):
//   for col in env_cols:  means = df.groupby('Season')[col].mean().reindex(SEASON_ORDER)
//                         axes[i].bar(means.index, means.values, color=[SEASON_PALETTE[s] for s in means.index]); axes[i].set_title(col)
// with cell [2]'s sns.set_style('whitegrid'): bar width 0.8, white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame on all
// sides, no tick marks, no axis labels (the notebook sets only the title). Means and axis limits/ticks were read back from matplotlib after
// re-running the cell on the cleaned data (pixel-identical re-render). Season colours: the website palette you specified (the notebook's
// SEASON_PALETTE uses #1565C0 for Rabi and #EF6C00 for Zaid).
export const ENV_COLS = ["Rainfall_mm", "Avg_Temperature_C", "Humidity_pct", "Soil_Moisture_pct", "Soil_pH", "Sunlight_Hours_Day", "Disease_Pest_Risk_pct"] as const;
export type EnvCol = (typeof ENV_COLS)[number];
const SPEC: Record<EnvCol, { means: number[]; ylim: number[]; yticks: number[]; yticklabels: string[] }> = {
  Rainfall_mm: { means: [852.1126756604834, 435.93706207744316, 299.12323232323234], ylim: [0.0, 894.7183094435076], yticks: [0.0, 100.0, 200.0, 300.0, 400.0, 500.0, 600.0, 700.0, 800.0], yticklabels: ["0", "100", "200", "300", "400", "500", "600", "700", "800"] },
  Avg_Temperature_C: { means: [28.454019111860593, 23.489182544560542, 31.042087542087543], ylim: [0.0, 32.59419191919192], yticks: [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0], yticklabels: ["0", "5", "10", "15", "20", "25", "30"] },
  Humidity_pct: { means: [71.81259134345137, 57.89317762753534, 52.012121212121215], ylim: [0.0, 75.40322091062394], yticks: [0.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0], yticklabels: ["0", "10", "20", "30", "40", "50", "60", "70"] },
  Soil_Moisture_pct: { means: [31.19842608206858, 24.05021511985249, 19.16902356902357], ylim: [0.0, 32.758347386172005], yticks: [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0], yticklabels: ["0", "5", "10", "15", "20", "25", "30"] },
  Soil_pH: { means: [6.727993254637437, 6.673749231714813, 6.69486531986532], ylim: [0.0, 7.064392917369309], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0], yticklabels: ["0", "1", "2", "3", "4", "5", "6", "7"] },
  Sunlight_Hours_Day: { means: [6.793367060146149, 7.589797172710511, 8.178787878787878], ylim: [0.0, 8.587727272727271], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0], yticklabels: ["0", "1", "2", "3", "4", "5", "6", "7", "8"] },
  Disease_Pest_Risk_pct: { means: [54.46790331646992, 40.48211432083589, 38.21666666666667], ylim: [0.0, 57.19129848229342], yticks: [0.0, 10.0, 20.0, 30.0, 40.0, 50.0], yticklabels: ["0", "10", "20", "30", "40", "50"] },
};
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const COLORS = ["#2E7D32", "#3D73AA", "#D08A2E"];
const XLIM: [number, number] = [-0.54, 2.54], BAR_W = 0.8;
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 14, tick: 12 };                              // notebook 12 pt title / 10 pt ticks, sized for one large chart
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};

export function NotebookEnvBars({ col, height }: { col: EnvCol; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  useEffect(() => setHover(null), [col]);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => {                                                // touch: close the tooltip when tapping anywhere outside the chart
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [close]);

  const s = SPEC[col];
  const left = Math.max(...s.yticklabels.map((t) => textW(t, FS.tick))) + 10, right = 8;
  const m = { top: FS.title * 1.2 + 10, left, right, bottom: FS.tick + 14 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - s.ylim[0]) / (s.ylim[1] - s.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${col}: mean per season for Kharif, Rabi and Zaid`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <text x={m.left + pw / 2} y={FS.title} textAnchor="middle" fontSize={FS.title} fill={INK}>{col}</text>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {s.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => (
            <rect key={sn} data-season={sn} x={X(i - BAR_W / 2)} y={Y(s.means[i])} width={X(i + BAR_W / 2) - X(i - BAR_W / 2)} height={Y(0) - Y(s.means[i])} fill={COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {s.yticks.map((t, k) => <text key={`ty${t}`} x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{s.yticklabels[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{sn}</text>)}
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: col, value: s.means[hover.i], color: COLORS[hover.i] }]} format={(v) => v.toFixed(2)} />
        </div>
      )}
    </div>
  );
}
