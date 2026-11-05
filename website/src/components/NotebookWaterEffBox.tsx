import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Recreates notebook cell [44] (In[68], section 8 Resource Analysis), second subplot (axes[1]) inside the existing website card:
//   sns.boxplot(data=df, x='Season', y='Water_Efficiency_t_per_1000m3', order=SEASON_ORDER, hue='Season',
//               palette=SEASON_PALETTE, ax=axes[1], showfliers=False, legend=False)
//   axes[1].set_title('Water Efficiency (t / 1000 m3) by Season')     <- shown as the card title
// seaborn defaults: whis=1.5, box width 0.8, caps 0.4 wide, palette drawn at saturation 0.75, #333333 1 pt lines, no mean marker, no outliers;
// axis labels 'Season' / 'Water_Efficiency_t_per_1000m3' (set by seaborn from the column names); with sns.set_style('whitegrid'): #cccccc
// 0.8 pt horizontal gridlines (none on the categorical x axis) and frame on all sides, no tick marks. Every value below was read back from
// matplotlib after re-running the cell on the cleaned data (pixel-identical re-render; quartiles/whiskers = boxplot_stats(whis=1.5)).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const N = [1779, 1627, 594];
const Q1 = [1.8385, 1.6395, 1.205];
const MEDIAN = [3.277, 2.74, 2.3015];
const Q3 = [5.5120000000000005, 5.04, 4.147];
const WHISLO = [0.135, 0.146, 0.14];
const WHISHI = [11.003, 10.139, 8.515];
const FACES = ["#38733B", "#2A66AB", "#D16F1E"];
const XLIM: [number, number] = [-0.5, 2.5];
const YLIM: [number, number] = [-0.4084, 11.5464];
const YTICKS = [0.0, 2.0, 4.0, 6.0, 8.0, 10.0];
const YTICK_LABELS = ["0", "2", "4", "6", "8", "10"];
const XLABEL = "Season", YLABEL = "Water_Efficiency_t_per_1000m3";
const BOX_W = 0.8, CAP_W = 0.4;
const LINE = "#333333", GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { label: 11, tick: 11 };                          // notebook 10 pt labels/ticks, sized for the card
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};
const exact = (v: number) => String(+v.toFixed(4));               // quartiles/whiskers are data values or midpoints: 4 dp is exact

export function NotebookWaterEffBox({ height }: { height: number }) {
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

  const yTickW = Math.max(...YTICK_LABELS.map((t) => textW(t, FS.tick)));
  const m = { top: 8, left: FS.label + 6 + yTickW + 6, right: 8, bottom: FS.tick + 6 + FS.label + 8 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - YLIM[0]) / (YLIM[1] - YLIM[0])) * ph;
  // the rotated y label must fit the plot height: shrink it only if needed (long column name)
  const fsY = Math.min(FS.label, (FS.label * (ph - 4)) / textW(YLABEL, FS.label));
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Water Efficiency (t / 1000 m3) by Season: boxplots for Kharif, Rabi and Zaid, outliers hidden" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {YTICKS.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={0.8 * PT} />)}
          {SEASONS.map((sn, i) => (
            <g key={sn} data-box={sn}>
              <line data-part="whisker-lo" x1={X(i)} x2={X(i)} y1={Y(Q1[i])} y2={Y(WHISLO[i])} stroke={LINE} strokeWidth={PT} />
              <line data-part="whisker-hi" x1={X(i)} x2={X(i)} y1={Y(Q3[i])} y2={Y(WHISHI[i])} stroke={LINE} strokeWidth={PT} />
              <line data-part="cap-lo" x1={X(i - CAP_W / 2)} x2={X(i + CAP_W / 2)} y1={Y(WHISLO[i])} y2={Y(WHISLO[i])} stroke={LINE} strokeWidth={PT} />
              <line data-part="cap-hi" x1={X(i - CAP_W / 2)} x2={X(i + CAP_W / 2)} y1={Y(WHISHI[i])} y2={Y(WHISHI[i])} stroke={LINE} strokeWidth={PT} />
              <rect data-part="box" x={X(i - BOX_W / 2)} y={Y(Q3[i])} width={X(i + BOX_W / 2) - X(i - BOX_W / 2)} height={Y(Q1[i]) - Y(Q3[i])} fill={FACES[i]} stroke={LINE} strokeWidth={PT} />
              <line data-part="median" x1={X(i - BOX_W / 2)} x2={X(i + BOX_W / 2)} y1={Y(MEDIAN[i])} y2={Y(MEDIAN[i])} stroke={LINE} strokeWidth={PT} />
            </g>
          ))}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={0.8 * PT} />
          {YTICKS.map((t, k) => <text key={`ty${t}`} x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{YTICK_LABELS[k]}</text>)}
          {SEASONS.map((sn, i) => <text key={`tx${sn}`} x={X(i)} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{sn}</text>)}
          <text x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{XLABEL}</text>
          <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={fsY} fill={INK}>{YLABEL}</text>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <div className="tip">
            <div className="tip-t">{SEASONS[hover.i]} · n = {N[hover.i].toLocaleString("en-IN")}</div>
            {([["Upper whisker", WHISHI], ["Q3 (75%)", Q3], ["Median", MEDIAN], ["Q1 (25%)", Q1], ["Lower whisker", WHISLO]] as const).map(([k, a]) => (
              <div className="tip-r" key={k}><span className="tip-k">{k}</span><b>{exact(a[hover.i])}</b></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
