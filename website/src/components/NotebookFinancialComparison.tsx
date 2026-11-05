import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [57] (In[43]), section 10 Regional and Crop Analysis, one subplot at a time inside the existing website card:
//   metrics = ['Revenue_INR', 'Total_Cost_INR', 'Profit_INR']
//   crop_financial  = df.groupby('Crop')[metrics].mean().sort_values('Profit_INR', ascending=False)
//   state_financial = df.groupby('State')[metrics].mean().sort_values('Profit_INR', ascending=False)
//   crop_plot = crop_financial / 100000; state_plot = state_financial / 100000            (₹ Lakhs)
//   ax.bar(x + (i - 1) * 0.24, values, width=0.24, color=...)  Revenue '#3B6EA5', Cost '#C9B89B', Profit '#218A60' if v >= 0 else '#B5483A'
//   ax.axhline(0, color='black', linewidth=0.8); ax.set_title(title, fontsize=14, fontweight='bold')          <- the card title
//   ax.set_xticklabels(data.index, rotation=30, ha='right'); ax.set_ylabel('Mean Amount (₹ Lakhs)')
//   ax.grid(axis='y', alpha=0.25); ax.set_axisbelow(True); ax.legend(frameon=False)
// with cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt frame and vertical gridlines, no tick marks.
// Full-precision means, axis limits, ticks, colours and the legend position were read back from matplotlib after re-running the cell
// on the cleaned data (pixel-identical re-render of the saved output).
const SERIES = ["Revenue", "Cost", "Profit"] as const;
const DATA = {
  crop: {
    title: "Mean Revenue, Cost and Profit by Crop", ylabel: "Mean Amount (₹ Lakhs)",
    cats: ["Sugarcane", "Chilli", "Cotton", "Groundnut", "Pulses", "Maize", "Rice", "Wheat"],
    values: [
      [13.719801147540984, 12.767772281553398, 6.394230826771654, 5.429354976415094, 5.2846586693548385, 4.570679909255898, 4.236152594202898, 4.001048859934853],
      [5.547921278688524, 5.258988859223301, 5.148761673228346, 4.980773773584906, 5.327039193548386, 5.4104631760435575, 5.258287637681159, 5.235032231270358],
      [8.171879868852459, 7.508783422330097, 1.2454691535433071, 0.4485812028301887, -0.04238052419354839, -0.8397832667876588, -1.022135043478261, -1.2339833713355048],
    ],   // ₹ lakhs: Revenue, Cost, Profit
    inr: [
      [1371980.1147540985, 1276777.2281553398, 639423.0826771654, 542935.4976415094, 528465.8669354839, 457067.9909255898, 423615.25942028983, 400104.88599348534],
      [554792.1278688525, 525898.8859223301, 514876.16732283466, 498077.37735849054, 532703.9193548387, 541046.3176043557, 525828.7637681159, 523503.22312703583],
      [817187.9868852459, 750878.3422330098, 124546.9153543307, 44858.12028301887, -4238.052419354839, -83978.32667876588, -102213.50434782609, -123398.33713355049],
    ],
    colors: [["#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5"], ["#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B"], ["#218A60", "#218A60", "#218A60", "#218A60", "#B5483A", "#B5483A", "#B5483A", "#B5483A"]],
    ylim: [-1.9816725972793292, 14.467490373484809] as [number, number], yticks: [0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0], yticklabels: ["0", "2", "4", "6", "8", "10", "12", "14"],
  },
  state: {
    title: "Mean Revenue, Cost and Profit by State", ylabel: "Mean Amount (₹ Lakhs)",
    cats: ["Punjab", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Telangana", "Madhya Pradesh", "Andhra Pradesh"],
    values: [
      [6.862257024793388, 6.50032669921875, 6.534261820040899, 6.290934164948454, 6.546928606557377, 6.287845329457364, 5.975583581488934, 6.066636597353497],
      [5.502000661157025, 5.14603814453125, 5.340038466257669, 5.113486680412371, 5.37124625, 5.1995491666666664, 5.107176016096579, 5.332101323251418],
      [1.3602563636363636, 1.3542885546875, 1.1942233537832312, 1.1774474845360825, 1.175682356557377, 1.0882961627906977, 0.8684075653923542, 0.7345352741020794],
    ],   // ₹ lakhs: Revenue, Cost, Profit
    inr: [
      [686225.7024793389, 650032.669921875, 653426.1820040899, 629093.4164948454, 654692.8606557377, 628784.5329457364, 597558.3581488933, 606663.6597353497],
      [550200.0661157025, 514603.814453125, 534003.8466257668, 511348.6680412371, 537124.625, 519954.9166666667, 510717.6016096579, 533210.1323251418],
      [136025.63636363635, 135428.85546875, 119422.33537832311, 117744.74845360825, 117568.2356557377, 108829.61627906977, 86840.75653923542, 73453.52741020794],
    ],
    colors: [["#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5", "#3B6EA5"], ["#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B", "#C9B89B"], ["#218A60", "#218A60", "#218A60", "#218A60", "#218A60", "#218A60", "#218A60", "#218A60"]],
    ylim: [0.0, 7.205369876033058] as [number, number], yticks: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0], yticklabels: ["0", "1", "2", "3", "4", "5", "6", "7"],
  },
};
export type FinancialKind = keyof typeof DATA;
const BAR_W = 0.24;
const XLIM: [number, number] = [-0.746, 7.746];
const LEGEND = { x1: 0.9911834460382816, y1: 0.98537787406652, handles: ["#3B6EA5", "#C9B89B", "#218A60"] };
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { label: 11, tick: 11, legend: 11 };   // notebook 10 pt labels/ticks/legend, sized for the card
const ROT = (30 * Math.PI) / 180;                  // rotation=30, ha='right'
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};
const exact = (v: number) => `${v < 0 ? "−" : ""}₹${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => { if (ref.current) setW(ref.current.clientWidth); }, []);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w] as const;
}

export function NotebookFinancialComparison({ kind, height }: { kind: FinancialKind; height: number }) {
  const D = DATA[kind];
  const [box, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => { setHover(null); }, [kind]);
  useEffect(() => {                                              // touch: close the tooltip when tapping outside the chart
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [box, close]);
  const n = D.cats.length;
  // rotated category labels: one step smaller on phones, and never larger than the gap between neighbouring labels (measured across the 30° slant)
  const fsT = w && w < 480 ? Math.max(9, Math.min(10, (((w - 60) / (XLIM[1] - XLIM[0])) * Math.sin(ROT)) / 1.25)) : FS.tick;
  const labW = D.cats.map((t) => textW(t, fsT));
  const yLabW = Math.max(...D.yticklabels.map((t) => textW(t, FS.tick)));
  let left = FS.label + 6 + yLabW + 6;
  const right = 6;
  // the first rotated label hangs left of its tick: make room for it
  for (let k = 0; k < 2; k++) { const pw0 = Math.max(w - left - right, 10); const x0 = left + ((0 - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw0; left = Math.max(left, left + (labW[0] * Math.cos(ROT) + 4) - x0); }
  const bottom = 4 + Math.max(...labW) * Math.sin(ROT) + fsT * Math.cos(ROT) + 6;
  const narrow = w > 0 && w < 480;                               // phones: legend in a row above the axes so it does not cover bars
  const m = { top: narrow ? FS.legend * 1.5 + 10 : 8, left, right, bottom };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - D.ylim[0]) / (D.ylim[1] - D.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const fsY = Math.min(FS.label, (FS.label * (ph - 4)) / textW(D.ylabel, FS.label));
  // legend: frameon=False, loc='best' resolved by matplotlib to the upper right; anchored by its right/top edge in axes fractions
  const sw = FS.legend * 1.4, lgW = sw + 6 + Math.max(...SERIES.map((t) => textW(t, FS.legend)));
  const lgX = m.left + LEGEND.x1 * pw - lgW, lgY = m.top + (1 - LEGEND.y1) * ph;
  const itemW = SERIES.map((t) => sw + 6 + textW(t, FS.legend) + 14);
  const legendPos = (k: number) => narrow ? { x: m.left + itemW.slice(0, k).reduce((a, b) => a + b, 0), y: 2 } : { x: lgX, y: lgY + 4 + k * FS.legend * 1.5 };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), n - 1), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" data-chart={`financial-${kind}`} aria-label={`Grouped bar chart of mean revenue, cost and profit (₹ lakhs) for ${D.cats.join(", ")}`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {D.yticks.map((t) => <line key={`gy${t}`} data-grid="y" x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeOpacity={0.25} strokeWidth={lw} />)}
          {D.cats.map((_, j) => <line key={`gx${j}`} data-grid="x" x1={X(j)} x2={X(j)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SERIES.map((s, i) => D.values[i].map((v, j) => (
            <rect key={`${s}${j}`} data-series={s} data-cat={D.cats[j]} x={X(j + (i - 1) * BAR_W - BAR_W / 2)} y={Math.min(Y(v), Y(0))} width={X(j + (i - 1) * BAR_W + BAR_W / 2) - X(j + (i - 1) * BAR_W - BAR_W / 2)} height={Math.abs(Y(0) - Y(v))}
              fill={D.colors[i][j]} stroke="#ffffff" strokeWidth={PT} />
          )))}
          <line data-zero="" x1={m.left} x2={m.left + pw} y1={Y(0)} y2={Y(0)} stroke="#000000" strokeWidth={lw} />
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          <g data-legend="">
            {SERIES.map((s, k) => (
              <g key={s}>
                <rect x={legendPos(k).x} y={legendPos(k).y} width={sw} height={FS.legend * 0.7} fill={LEGEND.handles[k]} stroke="#ffffff" strokeWidth={PT} />
                <text x={legendPos(k).x + sw + 6} y={legendPos(k).y + FS.legend * 0.35} dominantBaseline="central" fontSize={FS.legend} fill={INK}>{s}</text>
              </g>
            ))}
          </g>
          {D.yticks.map((t, k) => <text key={`ty${t}`} data-role="ytick" x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{D.yticklabels[k]}</text>)}
          {D.cats.map((c, j) => { const x = X(j), y = m.top + ph + 4 + fsT * 0.75; return <text key={`tx${c}`} data-role="xtick" x={x} y={y} transform={`rotate(-30 ${x} ${y})`} textAnchor="end" fontSize={fsT} fill={INK}>{c}</text>; })}
          <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={fsY} fill={INK}>{D.ylabel}</text>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={D.cats[hover.i]} payload={SERIES.map((s, k) => ({ name: s, value: D.inr[k][hover.i], color: D.colors[k][hover.i] }))} format={(v) => exact(v)} />
        </div>
      )}
    </div>
  );
}
