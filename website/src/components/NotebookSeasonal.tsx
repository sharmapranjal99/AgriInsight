import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [32] (In[41]), the Seasonal Performance figure (3 rows x 2 columns), one row per metric, inside the existing
// website chart boxes (data and plotting settings from the notebook, display size from the website):
//   left:  axes.bar(x[i] -/+ width/2, mean / median, width=0.35, color=season_colors[i] / median_colors[i]); grid(axis='y', alpha=0.25)
//          set_xlabel('Season'), set_ylabel(metric['ylabel']), set_xticks(x) / set_xticklabels(season_order); no legend on any subplot
//   right: sns.boxplot(x='Season', y=col, order=season_order, palette=season_colors, showfliers=False, whis=1.5); grid(axis='y', alpha=0.25)
// plus cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt frame on all sides, full-strength #cccccc x gridlines on the
// bar charts (seaborn turns them off on its categorical boxplot axis), no tick marks, Arial text in '.15' (#262626).
// Every number below was read back from matplotlib after re-running the cell on the cleaned data (the re-render is pixel-identical).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const SEASON_COLORS = ["#218A60", "#3D73AA", "#D58B2D"];          // season_colors
const MEDIAN_COLORS = ["#A9D1C1", "#B4C8DD", "#EBD0AC"];          // median_colors
const BOX_FACES = ["#2E7D5D", "#4B739C", "#C08842"];   // seaborn draws boxes at saturation 0.75
const BOX_LINE = "#333333";                                         // seaborn box/whisker/cap/median line colour
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;                                                 // 1 pt in px at the notebook's 100 dpi
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11 };                    // notebook 12 pt title, 10 pt labels/ticks - sized for the card
const BAR_W = 0.35, BAR_XLIM: [number, number] = [-0.485, 2.485]; // width = 0.35; matplotlib's x limits for the paired bars
const BOX_W = 0.8, CAP_W = 0.4, BOX_XLIM: [number, number] = [-0.5, 2.5];

export type SeasonMetric = "yield" | "production" | "waterEff";
type Spec = {
  ylabel: string;
  bars: { title: string; mean: number[]; median: number[]; ylim: number[]; yticks: number[]; yticklabels: string[] };
  box: { title: string; ylim: number[]; yticks: number[]; yticklabels: string[]; q1: number[]; median: number[]; q3: number[]; whislo: number[]; whishi: number[]; mean: number[]; n: number[] };
};
export const NB_SEASONAL: Record<SeasonMetric, Spec> = {
  yield: {
    ylabel: "Yield (Tonnes/Ha)",
    bars: { title: "Mean and Median Yield by Season", mean: [5.629525014052838, 5.098730792870313, 4.6403872053872055], median: [1.95, 1.66, 1.455], ylim: [0.0, 5.91100126475548], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0], yticklabels: ["0", "1", "2", "3", "4", "5"] },
    box: { title: "Yield Distribution by Season", ylim: [0.024499999999999966, 6.0855], yticks: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0], yticklabels: ["1", "2", "3", "4", "5", "6"],
      q1: [1.18, 1.02, 0.86], median: [1.95, 1.66, 1.455], q3: [3.1, 2.745, 2.2875], whislo: [0.3, 0.3, 0.3], whishi: [5.81, 5.2, 4.22],
      mean: [5.629525014052838, 5.098730792870313, 4.6403872053872055], n: [1779, 1627, 594] },
  },
  production: {
    ylabel: "Production (Tonnes)",
    bars: { title: "Mean and Median Production by Season", mean: [46.3111916807195, 41.48671173939767, 38.886111111111106], median: [13.24, 11.08, 9.97], ylim: [0.0, 48.62675126475548], yticks: [0.0, 10.0, 20.0, 30.0, 40.0], yticklabels: ["0", "10", "20", "30", "40"] },
    box: { title: "Production Distribution by Season", ylim: [-2.8300000000000005, 62.730000000000004], yticks: [0.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0], yticklabels: ["0", "10", "20", "30", "40", "50", "60"],
      q1: [5.365, 4.99, 4.3925], median: [13.24, 11.08, 9.97], q3: [27.125, 22.43, 19.9875], whislo: [0.2, 0.19, 0.15], whishi: [59.75, 47.61, 41.23],
      mean: [46.3111916807195, 41.48671173939767, 38.886111111111106], n: [1779, 1627, 594] },
  },
  waterEff: {
    ylabel: "Water Efficiency (t / 1000 m³)",
    bars: { title: "Mean and Median Water Efficiency by Season", mean: [5.891833614390107, 5.186122311001844, 4.413239057239057], median: [3.277, 2.74, 2.3015], ylim: [0.0, 6.186425295109612], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0], yticklabels: ["0", "1", "2", "3", "4", "5", "6"] },
    box: { title: "Water Efficiency Distribution by Season", ylim: [-0.4084, 11.5464], yticks: [0.0, 2.0, 4.0, 6.0, 8.0, 10.0], yticklabels: ["0", "2", "4", "6", "8", "10"],
      q1: [1.8385, 1.6395, 1.205], median: [3.277, 2.74, 2.3015], q3: [5.5120000000000005, 5.04, 4.147], whislo: [0.135, 0.146, 0.14], whishi: [11.003, 10.139, 8.515],
      mean: [5.891833614390107, 5.186122311001844, 4.413239057239057], n: [1779, 1627, 594] },
  },
};

let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (s: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return s.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(s).width;
};
function wrap(s: string, size: number, max: number) {
  const lines: string[] = []; let cur = "";
  for (const w of s.split(" ")) { const t = cur ? `${cur} ${w}` : w; if (cur && textW(t, size) > max) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
const exact = (v: number) => String(+v.toFixed(4));                // quartiles/whiskers are data values or midpoints: 4 dp is exact
const two = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// close a chart's tooltip when the pointer goes down anywhere outside that chart (touch tips stay open until then)
function useDismiss(ref: React.RefObject<HTMLDivElement>, close: () => void) {
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [ref, close]);
}

function useWidth() {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  return [box, w] as const;
}

// shared axes frame: title centred over the axes, rotated y label, tick labels, 'Season' x label
function layout(w: number, height: number, title: string, yticklabels: string[]) {
  const yTickW = Math.max(...yticklabels.map((t) => textW(t, FS.tick)));
  const left = FS.label + 6 + yTickW + 6, right = 8;
  const pw = Math.max(w - left - right, 10), cx = left + pw / 2;
  const titleLines = w ? wrap(title, FS.title, 2 * Math.min(cx, w - cx) - 4) : [title];
  const m = { top: titleLines.length * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  return { m, pw, ph: height - m.top - m.bottom, titleLines };
}
function Frame({ L, height, ylabel, yticks, yticklabels, Y, xticks }: { L: ReturnType<typeof layout>; height: number; ylabel: string; yticks: number[]; yticklabels: string[]; Y: (v: number) => number; xticks: number[] }) {
  const { m, pw, ph, titleLines } = L;
  return (
    <>
      {titleLines.map((t, k) => <text key={k} x={m.left + pw / 2} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
      {yticks.map((t, k) => <text key={`ty${t}`} x={m.left - 6} y={Y(t) + FS.tick * 0.35} textAnchor="end" fontSize={FS.tick} fill={INK}>{yticklabels[k]}</text>)}
      {SEASONS.map((s, i) => <text key={s} x={xticks[i]} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{s}</text>)}
      <text x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>Season</text>
      <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{ylabel}</text>
      <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={0.8 * PT} />
    </>
  );
}
function TipBox({ x, y, w, height, children }: { x: number; y: number; w: number; height: number; children: React.ReactNode }) {
  // beside the pointer (flipped on the right / lower half), then clamped so the tooltip never leaves the chart's width
  const ref = useRef<HTMLDivElement>(null);
  const [tw, setTw] = useState(0);
  useLayoutEffect(() => { if (ref.current) setTw(ref.current.offsetWidth); });
  const want = x > w / 2 ? x - 12 - tw : x + 12;
  const left = Math.min(Math.max(want, 0), Math.max(w - tw, 0));
  return <div ref={ref} style={{ position: "absolute", left, top: y, transform: `translateY(${y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap", visibility: tw ? "visible" : "hidden" }}>{children}</div>;
}

/** Left subplot: mean vs median bars per season. */
export function SeasonMeanMedianBars({ metric, height, unit }: { metric: SeasonMetric; height: number; unit: string }) {
  const [box, w] = useWidth();
  const s = NB_SEASONAL[metric], b = s.bars;
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useEffect(() => setHover(null), [metric]);
  useDismiss(box, useCallback(() => setHover(null), []));
  const L = layout(w, height, b.title, b.yticklabels); const { m, pw, ph } = L;
  const X = (v: number) => m.left + ((v - BAR_XLIM[0]) / (BAR_XLIM[1] - BAR_XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - b.ylim[0]) / (b.ylim[1] - b.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = BAR_XLIM[0] + ((px - m.left) / pw) * (BAR_XLIM[1] - BAR_XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${b.title}: mean and median for Kharif, Rabi and Zaid`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {b.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeOpacity={0.25} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => (
            <g key={sn}>
              <rect data-bar="mean" x={X(i - BAR_W)} y={Y(b.mean[i])} width={X(i) - X(i - BAR_W)} height={Y(0) - Y(b.mean[i])} fill={SEASON_COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
              <rect data-bar="median" x={X(i)} y={Y(b.median[i])} width={X(i + BAR_W) - X(i)} height={Y(0) - Y(b.median[i])} fill={MEDIAN_COLORS[i]} stroke="#ffffff" strokeWidth={PT} />
            </g>
          ))}
          <Frame L={L} height={height} ylabel={s.ylabel} yticks={b.yticks} yticklabels={b.yticklabels} Y={Y} xticks={[X(0), X(1), X(2)]} />
        </svg>
      )}
      {hover && (
        <TipBox x={hover.x} y={hover.y} w={w} height={height}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: "Mean", value: b.mean[hover.i], color: SEASON_COLORS[hover.i] }, { name: "Median", value: b.median[hover.i], color: MEDIAN_COLORS[hover.i] }]} format={(v) => `${two(v)} ${unit}`} />
        </TipBox>
      )}
    </div>
  );
}

/** Right subplot: seaborn boxplot per season (whis=1.5, showfliers=False). */
export function SeasonBoxplot({ metric, height, unit }: { metric: SeasonMetric; height: number; unit: string }) {
  const [box, w] = useWidth();
  const s = NB_SEASONAL[metric], x = s.box;
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useEffect(() => setHover(null), [metric]);
  useDismiss(box, useCallback(() => setHover(null), []));
  const L = layout(w, height, x.title, x.yticklabels); const { m, pw, ph } = L;
  const X = (v: number) => m.left + ((v - BOX_XLIM[0]) / (BOX_XLIM[1] - BOX_XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - x.ylim[0]) / (x.ylim[1] - x.ylim[0])) * ph;
  const lw = PT;                                                     // seaborn line width 1 pt
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = BOX_XLIM[0] + ((px - m.left) / pw) * (BOX_XLIM[1] - BOX_XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${x.title}: boxplots for Kharif, Rabi and Zaid, whiskers at 1.5 x IQR, outliers hidden`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {x.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeOpacity={0.25} strokeWidth={0.8 * PT} />)}
          {SEASONS.map((sn, i) => (
            <g key={sn} data-box={sn}>
              <line data-part="whisker-lo" x1={X(i)} x2={X(i)} y1={Y(x.q1[i])} y2={Y(x.whislo[i])} stroke={BOX_LINE} strokeWidth={lw} />
              <line data-part="whisker-hi" x1={X(i)} x2={X(i)} y1={Y(x.q3[i])} y2={Y(x.whishi[i])} stroke={BOX_LINE} strokeWidth={lw} />
              <line data-part="cap-lo" x1={X(i - CAP_W / 2)} x2={X(i + CAP_W / 2)} y1={Y(x.whislo[i])} y2={Y(x.whislo[i])} stroke={BOX_LINE} strokeWidth={lw} />
              <line data-part="cap-hi" x1={X(i - CAP_W / 2)} x2={X(i + CAP_W / 2)} y1={Y(x.whishi[i])} y2={Y(x.whishi[i])} stroke={BOX_LINE} strokeWidth={lw} />
              <rect data-part="box" x={X(i - BOX_W / 2)} y={Y(x.q3[i])} width={X(i + BOX_W / 2) - X(i - BOX_W / 2)} height={Y(x.q1[i]) - Y(x.q3[i])} fill={BOX_FACES[i]} stroke={BOX_LINE} strokeWidth={lw} />
              <line data-part="median" x1={X(i - BOX_W / 2)} x2={X(i + BOX_W / 2)} y1={Y(x.median[i])} y2={Y(x.median[i])} stroke={BOX_LINE} strokeWidth={lw} />
            </g>
          ))}
          <Frame L={L} height={height} ylabel={s.ylabel} yticks={x.yticks} yticklabels={x.yticklabels} Y={Y} xticks={[X(0), X(1), X(2)]} />
        </svg>
      )}
      {hover && (
        <TipBox x={hover.x} y={hover.y} w={w} height={height}>
          <div className="tip">
            <div className="tip-t">{SEASONS[hover.i]} · n = {x.n[hover.i].toLocaleString("en-IN")}</div>
            {([["Upper whisker", exact(x.whishi[hover.i])], ["Q3 (75%)", exact(x.q3[hover.i])], ["Median", exact(x.median[hover.i])], ["Mean", two(x.mean[hover.i])], ["Q1 (25%)", exact(x.q1[hover.i])], ["Lower whisker", exact(x.whislo[hover.i])]] as const).map(([k, v]) => (
              <div className="tip-r" key={k}><span className="tip-k">{k}</span><b>{v} {unit}</b></div>
            ))}
          </div>
        </TipBox>
      )}
    </div>
  );
}
