import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [46] (section 8 Resource Analysis), "Fertilizer and Pesticide Intensity by Crop", inside the existing website card:
//   crop_inputs = df.groupby('Crop')[['Fertilizer_kg_ha', 'Pesticide_Litre_ha']].mean()
//   fertilizer_data / pesticide_data = each column .sort_values(ascending=False)          (sorted independently)
//   fig, axes = plt.subplots(1, 2, figsize=(15, 6)); axes[i].barh(..., color='#8B6B45' / '#3D73AA', height=0.65); invert_yaxis()
//   set_title / set_xlabel / set_ylabel('Crop'); set_xlim(0, 210) & xticks 0..200 step 50 / set_xlim(0, 9) & xticks 0..8 step 2
//   bar_label(fmt='%.1f' / '%.2f', padding=4); plt.suptitle('Fertilizer and Pesticide Intensity by Crop')   <- the card title
// with cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame, no tick marks.
// Means, order and labels were read back from matplotlib after re-running the cell on the cleaned data (pixel-identical re-render).
const PANELS = [
  { key: "fertilizer", title: "Fertilizer Intensity by Crop", xlabel: "Fertilizer (kg/ha)", ylabel: "Crop", color: "#8B6B45",
    crops: ["Maize", "Chilli", "Groundnut", "Rice", "Cotton", "Sugarcane", "Pulses", "Wheat"],
    values: [191.32105263157894, 188.73422330097088, 186.64316037735847, 185.50579710144928, 185.41692913385828, 184.29213114754097, 183.34314516129032, 183.2130293159609],
    labels: ["191.3", "188.7", "186.6", "185.5", "185.4", "184.3", "183.3", "183.2"],
    xlim: [0.0, 210.0] as [number, number], xticks: [0.0, 50.0, 100.0, 150.0, 200.0], xticklabels: ["0", "50", "100", "150", "200"] },
  { key: "pesticide", title: "Pesticide Intensity by Crop", xlabel: "Pesticide (L/ha)", ylabel: "Crop", color: "#3D73AA",
    crops: ["Groundnut", "Chilli", "Cotton", "Maize", "Rice", "Sugarcane", "Wheat", "Pulses"],
    values: [5.141438679245282, 5.134781553398058, 5.111870078740157, 5.107205081669692, 5.058405797101449, 5.043540983606557, 5.007671009771987, 4.988004032258065],
    labels: ["5.14", "5.13", "5.11", "5.11", "5.06", "5.04", "5.01", "4.99"],
    xlim: [0.0, 9.0] as [number, number], xticks: [0.0, 2.0, 4.0, 6.0, 8.0], xticklabels: ["0", "2", "4", "6", "8"] },
];
const BAR_H = 0.65;
const YLIM: [number, number] = [7.7075000000000005, -0.7075];       // inverted: first (largest) crop at the top
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 12, label: 10, tick: 10, value: 10 };   // notebook 12 pt titles, 10 pt labels/ticks/bar labels, sized for the card
const STACK_BELOW = 380;                                        // two panels side by side unless the card is narrower than this
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

// horizontal layout of one subplot at width w: room for crop labels on the left, for the bar labels (which may run past the axes,
// as bar_label does in the notebook) and the last tick on the right; the title is centred over the axes and wrapped to fit
function frame(p: (typeof PANELS)[number], w: number) {
  const cropW = Math.max(...p.crops.map((c) => textW(c, FS.tick)));
  const left = FS.label + 5 + cropW + 5;
  let right = 6;
  for (let k = 0; k < 3; k++) {
    const pw0 = Math.max(w - left - right, 10);
    right = Math.max(6, textW(p.xticklabels[p.xticklabels.length - 1], FS.tick) / 2 + 2,
      ...p.values.map((v, i) => 4 * PT + textW(p.labels[i], FS.value) + 2 - (1 - (v - p.xlim[0]) / (p.xlim[1] - p.xlim[0])) * pw0));
  }
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
  // both subplots share the same axes height (as in the notebook): reserve as many title lines as the longer wrapped title needs
  const titleRows = Math.max(...PANELS.map((q) => frame(q, w).titleLines.length));
  const m = { top: titleRows * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  const ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - p.xlim[0]) / (p.xlim[1] - p.xlim[0])) * pw;
  const Y = (c: number) => m.top + ((c - YLIM[1]) / (YLIM[0] - YLIM[1])) * ph;      // category 0 at the top
  const lw = 0.8 * PT;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const c = YLIM[1] + ((py - m.top) / ph) * (YLIM[0] - YLIM[1]);
    setHover({ i: Math.min(Math.max(Math.round(c), 0), p.crops.length - 1), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${p.title}: horizontal bar chart of ${p.crops.length} crops`} data-panel={p.key} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          {titleLines.map((t, k) => <text key={k} data-role="title" x={cx} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={m.left} y={Y(hover.i - 0.5)} width={pw} height={Y(hover.i + 0.5) - Y(hover.i - 0.5)} fill="rgba(31,138,91,.06)" />}
          {p.xticks.map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {p.crops.map((c, i) => <line key={`gy${c}`} x1={m.left} x2={m.left + pw} y1={Y(i)} y2={Y(i)} stroke={GRID} strokeWidth={lw} />)}
          {p.crops.map((c, i) => (
            <rect key={c} data-crop={c} x={X(0)} y={Y(i - BAR_H / 2)} width={X(p.values[i]) - X(0)} height={Y(i + BAR_H / 2) - Y(i - BAR_H / 2)} fill={p.color} stroke="#ffffff" strokeWidth={PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {p.crops.map((c, i) => <text key={`v${c}`} data-role="value" x={X(p.values[i]) + 4 * PT} y={Y(i)} dominantBaseline="central" fontSize={FS.value} fill={INK}>{p.labels[i]}</text>)}
          {p.crops.map((c, i) => <text key={`ty${c}`} data-role="ytick" x={m.left - 5} y={Y(i)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{c}</text>)}
          {p.xticks.map((t, k) => <text key={`tx${t}`} data-role="xtick" x={X(t)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{p.xticklabels[k]}</text>)}
          <text data-role="xlabel" x={cx} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{p.xlabel}</text>
          <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{p.ylabel}</text>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={p.crops[hover.i]} payload={[{ name: p.xlabel, value: p.values[hover.i], color: p.color }]} format={() => p.labels[hover.i]} />
        </div>
      )}
    </div>
  );
}

/** Both subplots of the notebook figure in one row; stacked only when the card is too narrow for two readable panels. */
export function NotebookCropIntensity({ height }: { height: number }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const oneRow = w === 0 || w >= STACK_BELOW;
  return (
    <div ref={ref} data-layout={oneRow ? "row" : "stacked"} style={{ display: "grid", gridTemplateColumns: oneRow ? "1fr 1fr" : "1fr", gap: oneRow ? 10 : 16 }}>
      {PANELS.map((p) => <Panel key={p.key} p={p} height={height} />)}
    </div>
  );
}
