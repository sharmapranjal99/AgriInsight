import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Recreates notebook cell [44] (In[68], section 8 Resource Analysis), third subplot (axes[2]) inside the existing website card:
//   irrigation_ct = pd.crosstab(df['Season'], df['Irrigation_Method'], normalize='index').reindex(SEASON_ORDER) * 100
//   irrigation_ct.plot(kind='bar', stacked=True, ax=axes[2], colormap='tab10')
//   axes[2].set_title('Irrigation Method Mix by Season (%)')     <- shown as the card title
//   axes[2].set_ylabel('% of farms'); axes[2].legend(fontsize=8)
// pandas defaults: columns in alphabetical order stacked bottom-up, bar width 0.5, x tick labels rotated 90 degrees, x label 'Season' (index name),
// colormap 'tab10' sampled at 4 evenly spaced points; legend(loc='best') -> upper right, white frame at 0.8 opacity with #cccccc edge.
// sns.set_style('whitegrid'): white 1 pt bar edges, #cccccc 0.8 pt gridlines on both axes and frame, no tick marks.
// Percentages, limits and ticks were read back from matplotlib after re-running the cell on the cleaned data (pixel-identical re-render).
const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const METHODS = ["Drip", "Flood", "Rainfed", "Sprinkler"] as const;
const PCT: number[][] = [                                       // rows = season, columns = method (% of that season's farms)
  [22.765598650927487, 33.16469926925239, 26.025857223159075, 18.043844856661046],
  [22.741241548862938, 32.32944068838353, 26.920712968653966, 18.00860479409957],
  [23.56902356902357, 32.659932659932664, 23.56902356902357, 20.2020202020202],
];
const COLORS = ["#1F77B4", "#D62728", "#E377C2", "#17BECF"];
const XLIM: [number, number] = [-0.5, 2.5];
const YLIM: [number, number] = [0.0, 105.00000000000001];
const YTICKS = [0.0, 20.0, 40.0, 60.0, 80.0, 100.0];
const YTICK_LABELS = ["0", "20", "40", "60", "80", "100"];
const XLABEL = "Season", YLABEL = "% of farms";
const BAR_W = 0.5;
const GRID = "#cccccc", INK = "#262626";
const PT = 100 / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { label: 11, tick: 11, legend: 10 };             // notebook 10 pt labels/ticks and 8 pt legend, sized for the card
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, size: number) => {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return t.length * size * 0.55;
  measureCtx.font = `${size}px ${FONT}`; return measureCtx.measureText(t).width;
};

export function NotebookIrrigationMix({ height }: { height: number }) {
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
  const xTickH = Math.max(...SEASONS.map((t) => textW(t, FS.tick)));       // rotated 90 degrees: label length becomes height
  const m = { top: 8, left: FS.label + 6 + yTickW + 6, right: 8, bottom: 6 + xTickH + 8 + FS.label + 6 };
  const pw = Math.max(w - m.left - m.right, 10), ph = height - m.top - m.bottom;
  const X = (v: number) => m.left + ((v - XLIM[0]) / (XLIM[1] - XLIM[0])) * pw;
  const Y = (v: number) => m.top + ph - ((v - YLIM[0]) / (YLIM[1] - YLIM[0])) * ph;
  const lw = 0.8 * PT;
  const legRow = FS.legend * 1.35, legW = 6 + 2 * FS.legend + 6 + Math.max(...METHODS.map((t) => textW(t, FS.legend))) + 8, legH = METHODS.length * legRow + 8;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px > m.left + pw || py < m.top || py > m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    const v = XLIM[0] + ((px - m.left) / pw) * (XLIM[1] - XLIM[0]);
    setHover({ i: Math.min(Math.max(Math.round(v), 0), 2), x: px, y: py });
  };
  return (
    <div ref={box} style={{ position: "relative", height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Irrigation Method Mix by Season (%): stacked bars of Drip, Flood, Rainfed and Sprinkler shares for Kharif, Rabi and Zaid" style={{ display: "block", fontFamily: FONT }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="#ffffff" />
          {hover && <rect x={X(hover.i - 0.5)} y={m.top} width={X(hover.i + 0.5) - X(hover.i - 0.5)} height={ph} fill="rgba(31,138,91,.06)" />}
          {YTICKS.map((t) => <line key={`gy${t}`} x1={m.left} x2={m.left + pw} y1={Y(t)} y2={Y(t)} stroke={GRID} strokeWidth={lw} />)}
          {[0, 1, 2].map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={m.top} y2={m.top + ph} stroke={GRID} strokeWidth={lw} />)}
          {SEASONS.map((sn, i) => {
            let base = 0;
            return (
              <g key={sn} data-season={sn}>
                {METHODS.map((mt, k) => {
                  const y0 = base, y1 = base + PCT[i][k]; base = y1;
                  return <rect key={mt} data-method={mt} x={X(i - BAR_W / 2)} y={Y(y1)} width={X(i + BAR_W / 2) - X(i - BAR_W / 2)} height={Y(y0) - Y(y1)} fill={COLORS[k]} stroke="#ffffff" strokeWidth={PT} />;
                })}
              </g>
            );
          })}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="none" stroke={GRID} strokeWidth={lw} />
          {YTICKS.map((t, k) => <text key={`ty${t}`} x={m.left - 6} y={Y(t)} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{YTICK_LABELS[k]}</text>)}
          {SEASONS.map((sn, i) => { const x = X(i), y = m.top + ph + 6; return <text key={`tx${sn}`} x={x} y={y} transform={`rotate(-90 ${x} ${y})`} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{sn}</text>; })}
          <text x={m.left + pw / 2} y={height - 6} textAnchor="middle" fontSize={FS.label} fill={INK}>{XLABEL}</text>
          <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{YLABEL}</text>
          <g data-legend="" transform={`translate(${m.left + pw - legW - 5} ${m.top + 5})`}>
            <rect width={legW} height={legH} rx={3} fill="#ffffff" fillOpacity={0.8} stroke={GRID} strokeOpacity={0.8} strokeWidth={lw} />
            {METHODS.map((mt, k) => (
              <g key={mt} transform={`translate(6 ${4 + k * legRow})`}>
                <rect y={legRow * 0.18} width={2 * FS.legend} height={legRow * 0.6} fill={COLORS[k]} />
                <text x={2 * FS.legend + 6} y={legRow / 2} dominantBaseline="central" fontSize={FS.legend} fill={INK}>{mt}</text>
              </g>
            ))}
          </g>
        </svg>
      )}
      {hover && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > w / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <div className="tip">
            <div className="tip-t">{SEASONS[hover.i]} · % of farms</div>
            {[...METHODS].reverse().map((mt) => { const k = METHODS.indexOf(mt); return (
              <div className="tip-r" key={mt}><span className="tip-k"><i style={{ background: COLORS[k] }} />{mt}</span><b>{PCT[hover.i][k].toFixed(2)}</b></div>
            ); })}
          </div>
        </div>
      )}
    </div>
  );
}
