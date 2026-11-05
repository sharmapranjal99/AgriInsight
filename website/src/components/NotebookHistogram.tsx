import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates the notebook's yield histograms inside the existing website chart box (data and plotting details from the notebook,
// display size from the website):
//   cell [21]: sns.histplot(df['Yield_Tonnes_Ha'], bins=50, kde=False, color='#4E79A7', ax=ax)            (all crops, cleaned df)
//   cell [22]: sns.histplot(df_no_sugarcane['Yield_Tonnes_Ha'], bins=40, kde=False, color='#4E79A7', ax=ax) (Crop != 'Sugarcane')
// Styling as matplotlib/seaborn rendered it (sns.set_style('whitegrid'), cell [2]): bars '#4E79A7' at seaborn's default alpha 0.75 with white
// edges, light-grey (#cccccc, 0.8 pt) grid on both axes and frame on all four sides, no tick marks, Arial text in '.15' (#262626).
const BAR = "#4E79A7", BAR_ALPHA = 0.75, GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;                                               // 1 pt in px at the notebook's 100 dpi
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11 };                     // notebook 12 pt title / 10 pt labels+ticks, sized for the website card

export type NotebookHistSpec = {
  title: string; xlabel: string; ylabel: string;
  ticksX: number[]; ticksY: number[];                              // matplotlib's auto-locator ticks inside the axis limits
  edgeLwPt: number;                                                // bar edge width matplotlib used (pt)
};

let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (s: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return s.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(s).width;
};
function wrap(s: string, size: number, max: number) {
  const words = s.split(" "), lines: string[] = [];
  let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (cur && textW(t, size) > max) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
// exact decimal edge for display (edges are data min + k * width; 4 dp is exact for both notebook histograms)
const edgeLabel = (v: number) => String(+v.toFixed(4));

export function NotebookHistogram({ bins, spec, height }: { bins: { x0: number; x1: number; count: number }[]; spec: NotebookHistSpec; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect();
  }, []);
  useEffect(() => setHover(null), [bins]);                         // switching histogram: drop the old bar highlight / tooltip

  const n = bins.length;
  // np.histogram / seaborn: n equal-width bins from the data minimum to the data maximum
  const lo = bins[0].x0, hi = bins[n - 1].x1;
  const edges = Array.from({ length: n + 1 }, (_, k) => (k === n ? hi : lo + ((hi - lo) * k) / n));
  const counts = bins.map((b) => b.count);
  // matplotlib autoscale: 5% margin on x; bars are sticky at y = 0 so y runs 0 .. 1.05 x tallest bar
  const xMin = lo - 0.05 * (hi - lo), xMax = hi + 0.05 * (hi - lo), yMax = 1.05 * Math.max(...counts);

  const yTickW = Math.max(...spec.ticksY.map((t) => textW(String(t), FS.tick)));
  const left = FS.label + 6 + yTickW + 6, right = 6;
  const cx = left + Math.max(w - left - right, 10) / 2;                       // title is centred over the plot area
  const titleLines = w ? wrap(spec.title, FS.title, 2 * Math.min(cx, w - cx) - 4) : [spec.title];
  const m = { top: titleLines.length * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - xMin) / (xMax - xMin)) * pw;
  const Y = (v: number) => m.top + ph - (v / yMax) * ph;
  const lw = 0.8 * PT;
  const hv = hover && hover.i < n ? hover : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = xMin + ((px - m.left) / pw) * (xMax - xMin);
    const i = Math.min(Math.floor(((v - lo) / (hi - lo)) * n), n - 1);
    if (i < 0 || v > hi) { if (e.pointerType === "mouse") setHover(null); return; }
    setHover({ i, x: px, y: py });
  };

  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${spec.title}: histogram of ${spec.xlabel} with ${n} bins`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          {titleLines.map((t, k) => <text key={k} x={m.left + pw / 2} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {spec.ticksX.map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {spec.ticksY.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {hv && <rect x={X(edges[hv.i])} y={m.top} width={X(edges[hv.i + 1]) - X(edges[hv.i])} height={ph} fill="rgba(31,138,91,.08)" />}
          {counts.map((c, i) => c > 0 && (
            <rect key={i} x={X(edges[i])} y={Y(c)} width={X(edges[i + 1]) - X(edges[i])} height={Y(0) - Y(c)}
              fill={BAR} fillOpacity={BAR_ALPHA} stroke="#ffffff" strokeWidth={spec.edgeLwPt * PT} />
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {spec.ticksX.map((t) => <text key={`tx${t}`} x={X(t)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{t}</text>)}
          {spec.ticksY.map((t) => <text key={`ty${t}`} x={m.left - 6} y={Y(t) + FS.tick * 0.35} textAnchor="end" fontSize={FS.tick} fill={INK}>{t}</text>)}
          <text x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{spec.xlabel}</text>
          <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{spec.ylabel}</text>
        </svg>
      )}
      {hv && (
        <div style={{ position: "absolute", left: hv.x, top: hv.y, transform: `translate(${hv.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hv.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2 }}>
          <Tip active payload={[{ name: "Farms", value: counts[hv.i], color: BAR }]} label={hv.i} title={() => `${edgeLabel(edges[hv.i])} – ${edgeLabel(edges[hv.i + 1])} t/ha`} format={(v) => `${v.toLocaleString("en-IN")} farms`} />
        </div>
      )}
    </div>
  );
}
