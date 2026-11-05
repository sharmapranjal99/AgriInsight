import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook cell [26] (In[36]) "Average Yield by Crop" - two figures, Log Scale and Linear Scale - inside the existing website
// chart box (plotting details from the notebook, display size from the website). Both figures:
//   ax.barh(crops, yields, color='#1f8a5b', height=0.65); ax.invert_yaxis()
//   ax.set_xlabel('Mean Yield (Tonnes/Ha)'); ax.set_ylabel('Crop'); ax.grid(axis='x', alpha=0.3); ax.set_axisbelow(True)
//   ax.annotate(f'{value:.2f}', xy=(value, bar centre), xytext=(5, 0), textcoords='offset points', va='center', fontsize=9, clip_on=False)
// plus cell [2]'s sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes (x at alpha 0.3, y at full),
// #cccccc 0.8 pt frame on all sides, no tick marks, Arial text in '.15' (#262626).
const BAR = "#1f8a5b", GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;                                               // 1 pt in px at the notebook's 100 dpi
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11, annot: 10 };          // notebook 12 pt title, 10 pt labels/ticks, 9 pt annotations - sized for the card
const BAR_H = 0.65;                                                // height=0.65 (category units)
const Y_LIM: [number, number] = [-0.7075, 7.7075];                 // matplotlib's category limits for 8 bars of height 0.65 (inverted: first crop on top)

export type CropBarsSpec = { title: string; scale: "log" | "linear"; xlim: [number, number]; ticks: number[]; tickLabels: string[] };

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

export function NotebookCropBars({ data, spec, height }: { data: { crop: string; yield: number }[]; spec: CropBarsSpec; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  useEffect(() => setHover(null), [spec]);                         // switching Log/Linear: drop the old row highlight / tooltip

  const [x0, x1] = spec.xlim, log = spec.scale === "log";
  const f = (v: number) => (log ? (Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0)) : (v - x0) / (x1 - x0));
  const off = 5 * PT;                                              // xytext=(5, 0) offset points
  const labels = data.map((d) => d.yield.toFixed(2));              // f'{value:.2f}'
  const yTickW = Math.max(...data.map((d) => textW(d.crop, FS.tick)));
  const left = FS.label + 6 + yTickW + 6;
  // annotations are clip_on=False, so keep room on the right for any that run past the axes
  // ...and for the last x tick label, which is centred on the right edge of the axes
  const lastTickHalf = textW(spec.tickLabels[spec.tickLabels.length - 1], FS.tick) / 2 + 2;
  let right = Math.max(6, lastTickHalf);
  for (let k = 0; k < 3; k++) {
    const pw0 = Math.max(w - left - right, 10);
    right = Math.max(6, lastTickHalf, ...data.map((d, i) => off + textW(labels[i], FS.annot) - (1 - Math.min(f(d.yield), 1)) * pw0 + 2));
  }
  const pwT = Math.max(w - left - right, 10), cx = left + pwT / 2;  // title is centred over the axes: wrap to the room on both sides of that centre
  const titleLines = w ? wrap(spec.title, FS.title, 2 * Math.min(cx, w - cx) - 4) : [spec.title];
  const m = { top: titleLines.length * FS.title * 1.2 + 8, left, right, bottom: FS.tick + 6 + FS.label + 8 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + Math.min(Math.max(f(v), 0), 1.5) * pw;            // bars start at 0: clipped to the left edge on the log axis
  const Y = (c: number) => m.top + ((c - Y_LIM[0]) / (Y_LIM[1] - Y_LIM[0])) * ph;   // category c (0 = top bar) -> px
  const lw = 0.8 * PT;
  const hv = hover && hover.i < data.length ? hover : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const c = Y_LIM[0] + ((py - m.top) / ph) * (Y_LIM[1] - Y_LIM[0]);
    const i = Math.min(Math.max(Math.round(c), 0), data.length - 1);
    setHover({ i, x: px, y: py });
  };

  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${spec.title}: mean yield in tonnes per hectare for ${data.length} crops`} style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          {titleLines.map((t, k) => <text key={k} x={m.left + pw / 2} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hv && <rect x={m.left} y={Y(hv.i - 0.5)} width={pw} height={Y(hv.i + 0.5) - Y(hv.i - 0.5)} fill="rgba(31,138,91,.06)" />}
          {spec.ticks.map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeOpacity={0.3} strokeWidth={lw} />)}
          {data.map((d, i) => <line key={`gy${d.crop}`} x1={m.left} x2={m.left + pw} y1={Y(i)} y2={Y(i)} stroke={GRID} strokeWidth={lw} />)}
          <g clipPath="url(#nb-crop-bars-axes)">
            <clipPath id="nb-crop-bars-axes"><rect x={m.left} y={m.top} width={pw} height={ph} /></clipPath>
            {data.map((d, i) => (
              <rect key={d.crop} x={m.left - 2} y={Y(i - BAR_H / 2)} width={X(d.yield) - m.left + 2} height={Y(i + BAR_H / 2) - Y(i - BAR_H / 2)} fill={BAR} stroke="#ffffff" strokeWidth={PT} />
            ))}
          </g>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {data.map((d, i) => <text key={`a${d.crop}`} x={X(d.yield) + off} y={Y(i)} dominantBaseline="central" fontSize={FS.annot} fill={INK}>{labels[i]}</text>)}
          {data.map((d, i) => <text key={`c${d.crop}`} x={m.left - 6} y={Y(i)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{d.crop}</text>)}
          {spec.ticks.map((t, k) => <text key={`tx${t}`} x={X(t)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{spec.tickLabels[k]}</text>)}
          <text x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>Mean Yield (Tonnes/Ha)</text>
          <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>Crop</text>
        </svg>
      )}
      {hv && (
        <div style={{ position: "absolute", left: hv.x, top: hv.y, transform: `translate(${hv.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hv.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2 }}>
          <Tip active payload={[{ name: "Mean yield", value: data[hv.i].yield, color: BAR }]} label={data[hv.i].crop} format={(v) => `${v.toFixed(2)} t/ha`} />
        </div>
      )}
    </div>
  );
}
