import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [51] (In[31], section 9 Economic Analysis), subplots 1 and 2, inside the existing website cards.
// Data: cell [50]  econ_by_season_mean = df.groupby('Season')[econ_cols].mean().round(0).reindex(SEASON_ORDER)
//   subplot 1: econ_by_season_mean[['Revenue_INR', 'Total_Cost_INR']].plot(kind='bar', ax=axes[0], color=['#4E79A7', '#C0504D'])
//              set_title('Mean Revenue vs. Cost by Season'); set_ylabel('INR'); x label 'Season' (index name); legend(loc='best')
//   subplot 2: axes[1].bar(profit_means.index, profit_means.values, color=['#2E7D32' if v >= 0 else '#C0504D' ...])
//              axhline(0, color='black', linewidth=0.8); set_title('Mean Profit by Season')        (no axis labels, no legend)
// Neither subplot has value labels. cell [2] sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame,
// no tick marks. Values, bar geometry, limits, ticks and legend were read back from matplotlib after re-running cells [50]-[51] on the
// cleaned data (pixel-identical re-render).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const REV = { name: "Revenue_INR", color: "#4E79A7", values: [710719.0, 601526.0, 519172.0], x: [-0.25, 0.75, 1.75] };
const COST = { name: "Total_Cost_INR", color: "#C0504D", values: [531804.0, 513837.0, 543977.0], x: [0.0, 1.0, 2.0] };
const RC = { barW: 0.25, xlim: [-0.5, 2.5] as [number, number], ylim: [0.0, 746254.95] as [number, number],
  yticks: [0.0, 100000.0, 200000.0, 300000.0, 400000.0, 500000.0, 600000.0, 700000.0], yticklabels: ["0", "100000", "200000", "300000", "400000", "500000", "600000", "700000"], xlabel: "Season", ylabel: "INR" };
const PROFIT = { values: [178915.0, 87689.0, -24805.0], colors: ["#2E7D32", "#2E7D32", "#C0504D"], barW: 0.8,
  xlim: [-0.54, 2.5400000000000005] as [number, number], ylim: [-34991.0, 189101.0] as [number, number],
  yticks: [-25000.0, 0.0, 25000.0, 50000.0, 75000.0, 100000.0, 125000.0, 150000.0, 175000.0], yticklabels: ["−25000", "0", "25000", "50000", "75000", "100000", "125000", "150000", "175000"] };
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { label: 11, tick: 11, legend: 11 };             // notebook 10 pt labels/ticks/legend, sized for the card
const rupees = (v: number) => `${v < 0 ? "\u2212" : ""}₹${Math.round(Math.abs(v)).toLocaleString("en-US")}`;   // tooltip only
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};
function useChart() {
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
  return { box, w, hover, setHover };
}
function TipAt({ hover, w, height, children }: { hover: { x: number; y: number }; w: number; height: number; children: React.ReactNode }) {
  return <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>{children}</div>;
}

/** Subplot 1: Mean Revenue vs. Cost by Season (pandas grouped bars). */
export function NotebookRevenueCost({ height }: { height: number }) {
  const { box, w, hover, setHover } = useChart();
  const yTickW = Math.max(...RC.yticklabels.map((t) => textW(t, FS.tick)));
  const m = { top: 8, left: FS.label + 6 + yTickW + 6, right: 8, bottom: FS.tick + 6 + FS.label + 8 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - RC.xlim[0]) / (RC.xlim[1] - RC.xlim[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - RC.ylim[0]) / (RC.ylim[1] - RC.ylim[0])) * ph;
  const lw = 0.8 * PT;
  // legend(loc='best') -> upper right, white frame at 0.8 opacity with #cccccc edge, rectangle handles
  const legRow = FS.legend * 1.4, legW = 6 + 2 * FS.legend + 6 + Math.max(textW(REV.name, FS.legend), textW(COST.name, FS.legend)) + 8, legH = 2 * legRow + 8;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = RC.xlim[0] + ((px - m.left) / pw) * (RC.xlim[1] - RC.xlim[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Mean Revenue vs. Cost by Season: grouped bars of Revenue_INR and Total_Cost_INR for Kharif, Rabi and Zaid" data-chart="revcost" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {RC.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {[REV, COST].map((s) => SEASONS.map((sn, i) => (
            <rect key={`${s.name}-${sn}`} data-series={s.name} data-season={sn} x={X(s.x[i])} y={Y(s.values[i])} width={X(s.x[i] + RC.barW) - X(s.x[i])} height={Y(0) - Y(s.values[i])} fill={s.color} stroke="#ffffff" strokeWidth={PT} />
          )))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {RC.yticks.map((t, k) => <text key={`ty${t}`} data-role="ytick" x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{RC.yticklabels[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} data-role="xtick" x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{sn}</text>)}
          <text data-role="xlabel" x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{RC.xlabel}</text>
          <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{RC.ylabel}</text>
          <g data-legend="" transform={`translate(${m.left + pw - legW - 5} ${m.top + 5})`}>
            <rect width={legW} height={legH} rx={3} fill="#ffffff" fillOpacity={0.8} stroke={GRID} strokeOpacity={0.8} strokeWidth={lw} />
            {[REV, COST].map((s, k) => (
              <g key={s.name} transform={`translate(6 ${4 + k * legRow})`}>
                <rect y={legRow * 0.18} width={2 * FS.legend} height={legRow * 0.6} fill={s.color} />
                <text x={2 * FS.legend + 6} y={legRow / 2} dominantBaseline="central" fontSize={FS.legend} fill={INK}>{s.name}</text>
              </g>
            ))}
          </g>
        </svg>
      )}
      {hover && (
        <TipAt hover={hover} w={w} height={height}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: REV.name, value: REV.values[hover.i], color: REV.color }, { name: COST.name, value: COST.values[hover.i], color: COST.color }]} format={rupees} />
        </TipAt>
      )}
    </div>
  );
}

/** Subplot 2: Mean Profit by Season (green if positive, red if negative, black zero line). */
export function NotebookMeanProfit({ height }: { height: number }) {
  const { box, w, hover, setHover } = useChart();
  const yTickW = Math.max(...PROFIT.yticklabels.map((t) => textW(t, FS.tick)));
  const m = { top: 8, left: yTickW + 10, right: 8, bottom: FS.tick + 14 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - PROFIT.xlim[0]) / (PROFIT.xlim[1] - PROFIT.xlim[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - PROFIT.ylim[0]) / (PROFIT.ylim[1] - PROFIT.ylim[0])) * ph;
  const lw = 0.8 * PT;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = PROFIT.xlim[0] + ((px - m.left) / pw) * (PROFIT.xlim[1] - PROFIT.xlim[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Mean Profit by Season: bar chart for Kharif, Rabi and Zaid with a zero line" data-chart="profit" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {PROFIT.yticks.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => { const v = PROFIT.values[i]; return (
            <rect key={sn} data-season={sn} x={X(i - PROFIT.barW / 2)} y={Y(Math.max(v, 0))} width={X(i + PROFIT.barW / 2) - X(i - PROFIT.barW / 2)} height={Math.abs(Y(v) - Y(0))} fill={PROFIT.colors[i]} stroke="#ffffff" strokeWidth={PT} />
          ); })}
          <line data-zero="" x1={m.left} x2={m.left + pw} y1={Y(0)} y2={Y(0)} stroke="#000000" strokeWidth={0.8 * PT} />
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {PROFIT.yticks.map((t, k) => <text key={`ty${t}`} data-role="ytick" x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{PROFIT.yticklabels[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} data-role="xtick" x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{sn}</text>)}
        </svg>
      )}
      {hover && (
        <TipAt hover={hover} w={w} height={height}>
          <Tip active label={SEASONS[hover.i]} payload={[{ name: "Profit_INR (mean)", value: PROFIT.values[hover.i], color: PROFIT.colors[hover.i] }]} format={rupees} />
        </TipAt>
      )}
    </div>
  );
}
