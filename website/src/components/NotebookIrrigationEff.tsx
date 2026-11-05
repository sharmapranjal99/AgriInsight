import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [47] (section 8 Resource Analysis), "Water Use and Efficiency by Irrigation Method", inside the existing website card:
//   irrigation_order = ['Drip', 'Flood', 'Rainfed', 'Sprinkler']
//   irrigation_stats = df.groupby('Irrigation_Method')[['Water_Used_m3', 'Water_Efficiency_t_per_1000m3']].mean().reindex(irrigation_order)
//   colors = ['#218A60', '#3D73AA', '#8B6B45', '#D08A2E']; fig, axes = plt.subplots(1, 2, figsize=(15, 6))
//   axes[i].bar(irrigation_order, values, color=colors, width=0.65); set_title / set_xlabel('Irrigation Method') / set_ylabel(...)
//   set_ylim(0, 10000) + yticks 0..10000 step 2500  |  set_ylim(0, 8) + yticks 0..8 step 2
//   bar_label(labels=f'{v:,.0f}' / f'{v:.2f}', padding=4); plt.suptitle('Water Use and Efficiency by Irrigation Method')   <- the card title
// with cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame, no tick marks.
// Means, limits, ticks and labels were read back from matplotlib after re-running the cell on the cleaned data (pixel-identical re-render).
const METHODS = ["Drip", "Flood", "Rainfed", "Sprinkler"] as const;
const COLORS = ["#218A60", "#3D73AA", "#8B6B45", "#D08A2E"];
const BAR_W = 0.65;
const XLIM: [number, number] = [-0.5075000000000001, 3.5075];
const PANELS = [
  { key: "water", title: "Mean Water Used by Irrigation Method", xlabel: "Irrigation Method", ylabel: "Water Used (m³)",
    means: [5918.747540983607, 8026.472519083969, 3549.554274735831, 6208.258855585831], labels: ["5,919", "8,026", "3,550", "6,208"],
    ylim: [0.0, 10000.0] as [number, number], yticks: [0.0, 2500.0, 5000.0, 7500.0, 10000.0], yticklabels: ["0", "2500", "5000", "7500", "10000"] },
  { key: "eff", title: "Mean Water Efficiency by Irrigation Method", xlabel: "Irrigation Method", ylabel: "Water Efficiency (t/1000 m³)",
    means: [6.267128961748633, 3.438853435114504, 7.56378386167147, 4.669805177111717], labels: ["6.27", "3.44", "7.56", "4.67"],
    ylim: [0.0, 8.0] as [number, number], yticks: [0.0, 2.0, 4.0, 6.0, 8.0], yticklabels: ["0", "2", "4", "6", "8"] },
];
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11, value: 11 };   // notebook 12 pt titles, 10 pt labels/ticks/bar labels, sized for the card
const STACK_BELOW = 560;                                        // two panels side by side unless the card is narrower than this
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};
function wrap(t: string, size: number, max: number) {
  const lines: string[] = []; let cur = "";
  for (const w of t.split(" ")) { const n = cur ? `${cur} ${w}` : w; if (cur && textW(n, size) > max) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur);
  return lines;
}
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => { if (ref.current) setW(ref.current.clientWidth); }, []);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w] as const;
}
// horizontal layout of one subplot at width w (title centred over the axes and wrapped to fit)
function frame(p: (typeof PANELS)[number], w: number) {
  const left = FS.label + 6 + Math.max(...p.yticklabels.map((t) => textW(t, FS.tick))) + 6, right = 6;
  const pw = Math.max(w - left - right, 10), cx = left + pw / 2;
  const titleLines = w ? wrap(p.title, FS.title, 2 * Math.min(cx, w - cx) - 4) : [p.title];
  return { left, right, pw, cx, titleLines };
}

function Panel({ p, height }: { p: (typeof PANELS)[number]; height: number }) {
  const [box, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => {                                              // touch: close the tooltip when tapping outside this panel
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [box, close]);
  const { left, right, pw, cx, titleLines } = frame(p, w);
  const titleRows = Math.max(...PANELS.map((q) => frame(q, w).titleLines.length));   // both subplots share the same axes height
  const m = { top: titleRows * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  const ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - p.ylim[0]) / (p.ylim[1] - p.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const fsY = Math.min(FS.label, (FS.label * (ph - 4)) / textW(p.ylabel, FS.label));
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), METHODS.length - 1), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${p.title}: bar chart for ${METHODS.join(", ")}`} data-panel={p.key} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          {titleLines.map((t, k) => <text key={k} data-role="title" x={cx} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {p.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {METHODS.map((_, t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {METHODS.map((mt, i) => (
            <rect key={mt} data-method={mt} x={X(i - BAR_W / 2)} y={Y(p.means[i])} width={X(i + BAR_W / 2) - X(i - BAR_W / 2)} height={Y(0) - Y(p.means[i])} fill={COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {METHODS.map((mt, i) => <text key={`v${mt}`} data-role="value" x={X(i)} y={Y(p.means[i]) - 4 * PT} textAnchor="middle" fontSize={FS.value} fill={INK}>{p.labels[i]}</text>)}
          {p.yticks.map((t, k) => <text key={`ty${t}`} data-role="ytick" x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{p.yticklabels[k]}</text>)}
          {METHODS.map((mt, i) => <text key={`tx${mt}`} data-role="xtick" x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{mt}</text>)}
          <text data-role="xlabel" x={cx} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{p.xlabel}</text>
          <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={fsY} fill={INK}>{p.ylabel}</text>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={METHODS[hover.i]} payload={[{ name: p.ylabel, value: p.means[hover.i], color: COLORS[hover.i] }]} format={() => p.labels[hover.i]} />
        </div>
      )}
    </div>
  );
}

/** Both subplots of the notebook figure in one row; stacked only when the card is too narrow for two readable panels. */
export function NotebookIrrigationEff({ height }: { height: number }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const oneRow = w === 0 || w >= STACK_BELOW;
  return (
    <div ref={ref} data-layout={oneRow ? "row" : "stacked"} style={{ display: "grid", gridTemplateColumns: oneRow ? "1fr 1fr" : "1fr", gap: oneRow ? 16 : 20 }}>
      {PANELS.map((p) => <Panel key={p.key} p={p} height={height} />)}
    </div>
  );
}
