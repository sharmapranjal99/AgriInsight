import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [40] (In[66], section 7 Environmental Analysis) inside the existing website card:
//   sub_corr = df[['Yield_Tonnes_Ha'] + env_cols].corr()['Yield_Tonnes_Ha'].drop('Yield_Tonnes_Ha').sort_values()
//   colors = ['#C0504D' if v < 0 else '#4E79A7' for v in sub_corr.values]
//   ax.barh(sub_corr.index, sub_corr.values, color=colors); ax.axvline(0, color='black', linewidth=0.8)
//   ax.set_title('Correlation of Environmental Variables with Yield (Tonnes/Ha)')   <- shown as the card title
// with cell [2]'s sns.set_style('whitegrid'): bar height 0.8, white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame on all
// sides, no tick marks, no axis labels. The coefficients, axis limits and ticks were read back from matplotlib after re-running the cell on
// the cleaned data (pixel-identical re-render; identical printed output).
const VARS = ["Soil_pH", "Sunlight_Hours_Day", "Avg_Temperature_C", "Soil_Moisture_pct", "Humidity_pct", "Disease_Pest_Risk_pct", "Rainfall_mm"];                      // sort_values(): ascending, first entry at the bottom (barh)
const R = [-0.021797014111854824, -0.015437993496097854, 0.009084680704232385, 0.010113669737778913, 0.010506570669547948, 0.01228602130072445, 0.026836989014930757];
const XLIM: [number, number] = [-0.024228714268194104, 0.029268689171270037] as [number, number];   // matplotlib's automatic limits
const YLIM: [number, number] = [-0.74, 6.739999999999999];
const XTICKS = [-0.019999999999999997, -0.009999999999999998, 0.0, 0.010000000000000002, 0.020000000000000004];
const XTICK_LABELS = ["−0.02", "−0.01", "0.00", "0.01", "0.02"];
const BAR_H = 0.8;
const POS = "#4E79A7", NEG = "#C0504D", GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = 12;                                                  // notebook 10 pt tick labels, sized for the card
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size = FS) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};

export function NotebookEnvCorr({ height }: { height: number }) {
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

  // narrow screens: slightly smaller variable names; tick numbers sized to fit their spacing (9 px minimum), and if they still
  // cannot fit, every other tick is labelled (all gridlines stay at the notebook's tick positions)
  const fsY = w < 480 ? 11 : FS;
  const left = Math.max(...VARS.map((v) => textW(v, fsY))) + 10;
  const right = textW(XTICK_LABELS[XTICK_LABELS.length - 1]) / 2 + 6;
  const m = { top: 6, left, right, bottom: FS + 14 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (c: number) => m.top + ph - ((c - YLIM[0]) / (YLIM[1] - YLIM[0])) * ph;   // category c = 0 at the bottom
  const lw = 0.8 * PT;
  const spacing = X(XTICKS[1]) - X(XTICKS[0]), widest = Math.max(...XTICK_LABELS.map((t) => textW(t)));
  const fsX = Math.max(9, Math.min(FS, Math.floor((FS * (spacing - 6)) / widest)));
  const step = (widest * fsX) / FS + 6 > spacing ? 2 : 1;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const c = YLIM[0] + ((m.top + ph - py) / ph) * (YLIM[1] - YLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(c), 0), VARS.length - 1), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Correlation of Environmental Variables with Yield (Tonnes/Ha): horizontal bar chart of Pearson r for 7 variables" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={m.left} y={Y(hover.i + 0.5)} width={pw} height={Y(hover.i - 0.5) - Y(hover.i + 0.5)} fill="rgba(31,138,91,.06)" />}
          {XTICKS.map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {VARS.map((v, i) => <line key={`gy${v}`} x1={m.left} x2={m.left + pw} y1={Y(i)} y2={Y(i)} stroke={GRID} strokeWidth={lw} />)}
          {VARS.map((v, i) => {
            const x0 = X(Math.min(0, R[i])), x1 = X(Math.max(0, R[i]));
            return <rect key={v} data-var={v} x={x0} y={Y(i + BAR_H / 2)} width={x1 - x0} height={Y(i - BAR_H / 2) - Y(i + BAR_H / 2)} fill={R[i] < 0 ? NEG : POS} stroke="#ffffff" strokeWidth={PT} />;
          })}
          <line data-zero="" x1={X(0)} x2={X(0)} y1={m.top} y2={m.top + ph} stroke="#000000" strokeWidth={0.8 * PT} />
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {VARS.map((v, i) => <text key={`ty${v}`} x={m.left - 6} y={Y(i)} dominantBaseline="central" textAnchor="end" fontSize={fsY} fill={INK}>{v}</text>)}
          {XTICKS.map((t, k) => (k % step === 0 || XTICKS[k] === 0) && <text key={`tx${t}`} x={X(t)} y={m.top + ph + 6 + FS * 0.8} textAnchor="middle" fontSize={fsX} fill={INK}>{XTICK_LABELS[k]}</text>)}
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={VARS[hover.i]} payload={[{ name: "Yield_Tonnes_Ha", value: R[hover.i], color: R[hover.i] < 0 ? NEG : POS }]} format={(v) => v.toFixed(3)} />
        </div>
      )}
    </div>
  );
}
