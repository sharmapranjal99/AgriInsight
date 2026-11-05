import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [45] (section 8 Resource Analysis), "Fertilizer and Pesticide Use Across Seasons", inside the existing website card:
//   resource_by_season = df.groupby('Season')[['Fertilizer_kg_ha', 'Pesticide_Litre_ha']].mean().reindex(['Kharif', 'Rabi', 'Zaid'])
//   colors = ['#218A60', '#3D73AA', '#D08A2E']; fig, axes = plt.subplots(1, 2, figsize=(12, 5))
//   axes[i].bar(seasons, values, color=colors, width=0.65); set_title / set_xlabel('Season') / set_ylabel(...); set_ylim(0, 210) and (0, 9)
//   axes[i].bar_label(bars, fmt='%.2f', padding=3); plt.suptitle('Fertilizer and Pesticide Use Across Seasons')   <- the card title
// with cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame, no tick marks.
// Means, limits, ticks and bar labels were read back from matplotlib after re-running the cell on the cleaned data (pixel-identical).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const COLORS = ["#218A60", "#3D73AA", "#D08A2E"];
const BAR_W = 0.65;
const XLIM: [number, number] = [-0.4575, 2.4575];
const PANELS = [
  { key: "Fertilizer_kg_ha", title: "Mean Fertilizer Use by Season", xlabel: "Season", ylabel: "Fertilizer (kg/ha)",
    means: [187.0779651489601, 185.40706822372465, 184.63804713804714], labels: ["187.08", "185.41", "184.64"],
    ylim: [0.0, 210.0] as [number, number], yticks: [0.0, 25.0, 50.0, 75.0, 100.0, 125.0, 150.0, 175.0, 200.0], yticklabels: ["0", "25", "50", "75", "100", "125", "150", "175", "200"] },
  { key: "Pesticide_Litre_ha", title: "Mean Pesticide Use by Season", xlabel: "Season", ylabel: "Pesticide (L/ha)",
    means: [5.079747048903879, 5.0246896127842655, 5.171212121212121], labels: ["5.08", "5.02", "5.17"],
    ylim: [0.0, 9.0] as [number, number], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0], yticklabels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] },
];
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11, value: 11 };   // notebook 12 pt titles, 10 pt labels/ticks/bar labels, sized for the card
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

function Panel({ p, height }: { p: (typeof PANELS)[number]; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => {                                              // touch: close the tooltip when tapping outside this panel
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [close]);

  const yTickW = Math.max(...p.yticklabels.map((t) => textW(t, FS.tick)));
  const left = FS.label + 6 + yTickW + 6, right = 6;
  const pw0 = Math.max(w - left - right, 10), cx = left + pw0 / 2;
  const titleLines = w ? wrap(p.title, FS.title, 2 * Math.min(cx, w - cx) - 4) : [p.title];
  const m = { top: titleLines.length * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  const pw = pw0, ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - p.ylim[0]) / (p.ylim[1] - p.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const fsY = Math.min(FS.label, (FS.label * (ph - 4)) / textW(p.ylabel, FS.label));
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${p.title}: bar chart for Kharif, Rabi and Zaid`} data-panel={p.key} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          {titleLines.map((t, k) => <text key={k} data-role="title" x={cx} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {p.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => (
            <rect key={sn} data-season={sn} x={X(i - BAR_W / 2)} y={Y(p.means[i])} width={X(i + BAR_W / 2) - X(i - BAR_W / 2)} height={Y(0) - Y(p.means[i])} fill={COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {SEASONS.map((sn, i) => <text key={`v${sn}`} data-role="value" x={X(i)} y={Y(p.means[i]) - 3 * PT} textAnchor="middle" fontSize={FS.value} fill={INK}>{p.labels[i]}</text>)}
          {p.yticks.map((t, k) => <text key={`ty${t}`} data-role="ytick" x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{p.yticklabels[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} data-role="xtick" x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{sn}</text>)}
          <text data-role="xlabel" x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{p.xlabel}</text>
          <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={fsY} fill={INK}>{p.ylabel}</text>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: p.ylabel, value: p.means[hover.i], color: COLORS[hover.i] }]} format={(v) => v.toFixed(2)} />
        </div>
      )}
    </div>
  );
}

/** Both subplots of the notebook figure, side by side (stacked on narrow screens by the existing grid). */
export function NotebookFertPest({ height }: { height: number }) {
  return (
    <div className="grid-2" style={{ gap: 8 }}>
      {PANELS.map((p) => <Panel key={p.key} p={p} height={height} />)}
    </div>
  );
}
