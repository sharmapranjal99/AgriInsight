import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [44] (In[68], section 8 Resource Analysis), first subplot (axes[0]) inside the existing website card:
//   means_water = df.groupby('Season')['Water_Used_m3'].mean().reindex(SEASON_ORDER)
//   axes[0].bar(means_water.index, means_water.values, color=[SEASON_PALETTE[s] for s in means_water.index])
//   axes[0].set_title('Mean Water Used (m3) by Season')     <- shown as the card title
// with cell [2]'s SEASON_PALETTE and sns.set_style('whitegrid'): bar width 0.8, white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes
// and frame on all sides, no tick marks, no axis labels. Means, axis limits and ticks were read back from matplotlib after re-running the
// cell on the cleaned data (pixel-identical re-render). Tooltip values use the notebook's displayed rounding (cell [43], 2 dp).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const MEANS = [6102.201236649803, 5846.98709280885, 6419.893939393939];
const COLORS = ["#38733B", "#2A66AB", "#D16F1E"];                          // Kharif, Rabi, Zaid (colours set on the website)
const XLIM: [number, number] = [-0.54, 2.5400000000000005];
const YLIM: [number, number] = [0.0, 6740.888636363636];
const YTICKS = [0.0, 1000.0, 2000.0, 3000.0, 4000.0, 5000.0, 6000.0];
const YTICK_LABELS = ["0", "1000", "2000", "3000", "4000", "5000", "6000"];
const BAR_W = 0.8;
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = 12;                                                  // notebook 10 pt tick labels, sized for the card
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * FS * 0.55;
  measureCtx.font = `${FS}px ${FONT}`; return measureCtx.measureText(t).width;
};

export function NotebookWaterUsed({ height }: { height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => {                                              // touch: close the tooltip when tapping outside the chart
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [close]);

  const m = { top: 8, left: Math.max(...YTICK_LABELS.map(textW)) + 10, right: 8, bottom: FS + 14 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - YLIM[0]) / (YLIM[1] - YLIM[0])) * ph;
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
        <svg width={w} height={height} role="img" aria-label="Mean Water Used (m3) by Season: bar chart for Kharif, Rabi and Zaid" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {YTICKS.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => (
            <rect key={sn} data-season={sn} x={X(i - BAR_W / 2)} y={Y(MEANS[i])} width={X(i + BAR_W / 2) - X(i - BAR_W / 2)} height={Y(0) - Y(MEANS[i])} fill={COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {YTICKS.map((t, k) => <text key={`ty${t}`} x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS} fill={INK}>{YTICK_LABELS[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} x={X(i)} y={m.top + ph + 6 + FS * 0.8} textAnchor="middle" fontSize={FS} fill={INK}>{sn}</text>)}
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: "Water_Used_m3", value: MEANS[hover.i], color: COLORS[hover.i] }]} format={(v) => v.toFixed(2)} />
        </div>
      )}
    </div>
  );
}
