import { useRef, useState } from "react";

// Faithful SVG recreation of notebook cell [28] (In[17]), "Correlation Matrix - Key Numerical Variables":
//   corr_matrix = df[corr_cols].corr()                       (cleaned df, Pearson)
//   fig, ax = plt.subplots(figsize=(10, 6)); sns.heatmap(corr_matrix, cmap='RdBu_r', center=0, annot=False, ax=ax)
//   ax.set_title('Correlation Matrix - Key Numerical Variables'); plt.tight_layout()
// with cell [2]'s sns.set_style('whitegrid') and figure.dpi = 100. The notebook's inline PNG is 930 x 590 px; every coordinate below is in that
// pixel space, read back from matplotlib after re-running the cell (the re-render is pixel-identical to the saved output). The SVG scales to the card.
const W = 930, H = 590;
const AX = { x0: 220.972, y0: 30.411, x1: 828.194, y1: 369.028 };      // heatmap axes
const CB = { x0: 866.146, x1: 883.077 };                                // colour bar (same height as the axes)
const PX = (pt: number) => (pt * 100) / 72;
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const INK = "#262626";
// Browser vs matplotlib (Agg) text rasterisation offset, measured by diffing this SVG against the notebook PNG (px, notebook space).
const NUDGE = { xLabels: { across: -1.5, along: 1.8 }, yLabels: { x: -0.6, y: 0.4 }, cbar: { x: -1.1, y: 3.5 } };

// corr_matrix exactly as computed by cell [28] (full float64 precision; the notebook does not print it, annot=False).
const COLS = ["Yield_Tonnes_Ha", "Rainfall_mm", "Avg_Temperature_C", "Humidity_pct", "Sunlight_Hours_Day", "Soil_pH", "Soil_Moisture_pct", "Nitrogen_kg_ha", "Phosphorus_kg_ha", "Potassium_kg_ha", "Fertilizer_kg_ha", "Pesticide_Litre_ha", "Water_Efficiency_t_per_1000m3", "Disease_Pest_Risk_pct", "Profit_INR"];
const MATRIX: number[][] = [
  [1.0, 0.026836989014930757, 0.009084680704232385, 0.010506570669547948, -0.015437993496097854, -0.021797014111854824, 0.010113669737778913, 0.05361608445198806, 0.046553727371521615, 0.005249399280172981, -0.0004165961536713347, -0.008620368644512644, 0.9155338517453847, 0.01228602130072445, 0.4893279227630306],
  [0.026836989014930757, 1.0, 0.19859483091997215, 0.5261215767015779, -0.36698791532243574, 0.01641325768434413, 0.5201322303088026, 0.005236537464514636, 0.020930377102190787, 0.03072416683620179, 0.0245926866432452, 0.0014664645806843548, 0.05669751298903672, 0.6244049708092292, 0.10611679002060456],
  [0.009084680704232385, 0.19859483091997215, 1.0, 0.13813602613879244, -0.03386256061549646, 0.029988414601560234, 0.08326439775592294, 0.018706592934600412, 0.008508388950219542, 0.022993188045259086, 0.015860660681825848, 0.006656867072575127, 0.00653365609030859, 0.24561313710010096, 0.009042606450980742],
  [0.010506570669547948, 0.5261215767015779, 0.13813602613879244, 1.0, -0.29729763432505946, 0.028446767586493678, 0.45069342656061995, 0.0011979736089601204, -0.0059634715421830135, -0.003070423816594028, 0.02462293661273303, -0.004027978134427009, 0.02616930149587618, 0.5450929489749534, 0.06377495967259388],
  [-0.015437993496097854, -0.36698791532243574, -0.03386256061549646, -0.29729763432505946, 1.0, -0.017805944422937793, -0.30491805031260244, 0.009919736041877665, 0.0015435142979913273, -0.01440678172597602, -0.013073263993991184, -0.017237574811396747, -0.02138571611798325, -0.2532510482521815, -0.05482209386411623],
  [-0.021797014111854824, 0.01641325768434413, 0.029988414601560234, 0.028446767586493678, -0.017805944422937793, 1.0, 0.03090499557389279, 0.006285733953214906, 0.016620146171621542, -0.019406915915155885, -0.010591300340409364, -0.010134946890831675, -0.01008671483541986, 0.03114073584564158, -0.013144741999554345],
  [0.010113669737778913, 0.5201322303088026, 0.08326439775592294, 0.45069342656061995, -0.30491805031260244, 0.03090499557389279, 1.0, 0.007505469263869658, 0.01434565083229363, 0.00793304525638281, 0.007427133965134451, -0.022711607359381363, 0.028060883861826463, 0.3786070064160226, 0.09243631693839707],
  [0.05361608445198806, 0.005236537464514636, 0.018706592934600412, 0.0011979736089601204, 0.009919736041877665, 0.006285733953214906, 0.007505469263869658, 1.0, 0.01019885005544497, 0.010490236633130017, -0.032439624543601504, 0.0142798205690743, 0.054895504650841684, -0.011502512396299253, 0.08501630979743263],
  [0.046553727371521615, 0.020930377102190787, 0.008508388950219542, -0.0059634715421830135, 0.0015435142979913273, 0.016620146171621542, 0.01434565083229363, 0.01019885005544497, 1.0, 0.0028467663895849547, 0.012904861480546915, -0.029941982074801102, 0.057129306991191564, 0.032060802792397404, 0.04974742401842675],
  [0.005249399280172981, 0.03072416683620179, 0.022993188045259086, -0.003070423816594028, -0.01440678172597602, -0.019406915915155885, 0.00793304525638281, 0.010490236633130017, 0.0028467663895849547, 1.0, 0.01725352305042523, -0.004675005390382728, 0.006574719912161353, 0.013402584157461988, 0.03119223904100523],
  [-0.0004165961536713347, 0.0245926866432452, 0.015860660681825848, 0.02462293661273303, -0.013073263993991184, -0.010591300340409364, 0.007427133965134451, -0.032439624543601504, 0.012904861480546915, 0.01725352305042523, 1.0, -0.0011777747243974885, 0.005076524721095661, 0.01785136649553274, -0.07354237085001426],
  [-0.008620368644512644, 0.0014664645806843548, 0.006656867072575127, -0.004027978134427009, -0.017237574811396747, -0.010134946890831675, -0.022711607359381363, 0.0142798205690743, -0.029941982074801102, -0.004675005390382728, -0.0011777747243974885, 1.0, -0.006330202761717048, -0.4651834079009817, -0.02570500936905489],
  [0.9155338517453847, 0.05669751298903672, 0.00653365609030859, 0.02616930149587618, -0.02138571611798325, -0.01008671483541986, 0.028060883861826463, 0.054895504650841684, 0.057129306991191564, 0.006574719912161353, 0.005076524721095661, -0.006330202761717048, 1.0, 0.029252918501139483, 0.4894873007614452],
  [0.01228602130072445, 0.6244049708092292, 0.24561313710010096, 0.5450929489749534, -0.2532510482521815, 0.03114073584564158, 0.3786070064160226, -0.011502512396299253, 0.032060802792397404, 0.013402584157461988, 0.01785136649553274, -0.4651834079009817, 0.029252918501139483, 1.0, 0.0675831523230642],
  [0.4893279227630306, 0.10611679002060456, 0.009042606450980742, 0.06377495967259388, -0.05482209386411623, -0.013144741999554345, 0.09243631693839707, 0.08501630979743263, 0.04974742401842675, 0.03119223904100523, -0.07354237085001426, -0.02570500936905489, 0.4894873007614452, 0.0675831523230642, 1.0],
];
// seaborn center=0: vmin/vmax are the data range (-0.4651834079009817 .. 1.0) and 'RdBu_r' is re-sampled into a 256-colour
// map over that range so 0 sits at the colormap's centre. Lookup table exported from matplotlib.
const VMIN = -0.4651834079009817, VMAX = 1.0;
const LUT = [
  "78b4d5", "7bb6d6", "7bb6d6", "7eb8d7", "81bad8", "84bcd9", "84bcd9", "87beda", "8ac0db", "8dc2dc", "8dc2dc", "90c4dd", "93c6de", "96c7df", "96c7df",
  "98c8e0", "9bc9e0", "9bc9e0", "9dcbe1", "a0cce2", "a2cde3", "a2cde3", "a5cee3", "a7d0e4", "a9d1e5", "a9d1e5", "acd2e5", "aed3e6", "b1d5e7", "b1d5e7",
  "b3d6e8", "b6d7e8", "b6d7e8", "b8d8e9", "bbdaea", "bddbea", "bddbea", "c0dceb", "c2ddec", "c5dfec", "c5dfec", "c7e0ed", "cae1ee", "cce2ef", "cce2ef",
  "cfe4ef", "d1e5f0", "d2e6f0", "d2e6f0", "d4e6f1", "d5e7f1", "d5e7f1", "d7e8f1", "d8e9f1", "dae9f2", "dae9f2", "dbeaf2", "ddebf2", "deebf2", "deebf2",
  "e0ecf3", "e1edf3", "e3edf3", "e3edf3", "e4eef4", "e6eff4", "e6eff4", "e7f0f4", "e9f0f4", "eaf1f5", "eaf1f5", "ecf2f5", "edf2f5", "eff3f5", "eff3f5",
  "f0f4f6", "f2f5f6", "f3f5f6", "f3f5f6", "f5f6f7", "f6f7f7", "f7f6f6", "f7f6f6", "f7f5f4", "f8f4f2", "f8f4f2", "f8f3f0", "f8f2ef", "f8f1ed", "f8f1ed",
  "f9f0eb", "f9efe9", "f9eee7", "f9eee7", "f9ede5", "f9ebe3", "faeae1", "faeae1", "fae9df", "fae8de", "fae7dc", "fae7dc", "fbe6da", "fbe5d8", "fbe5d8",
  "fbe4d6", "fbe3d4", "fce2d2", "fce2d2", "fce0d0", "fcdfcf", "fcdecd", "fcdecd", "fdddcb", "fddcc9", "fddbc7", "fddbc7", "fdd9c4", "fcd7c2", "fcd7c2",
  "fcd5bf", "fcd3bc", "fbd0b9", "fbd0b9", "fbceb7", "fbccb4", "facab1", "facab1", "fac8af", "f9c6ac", "f9c4a9", "f9c4a9", "f9c2a7", "f8bfa4", "f8bda1",
  "f8bda1", "f8bb9e", "f7b99c", "f7b99c", "f7b799", "f7b596", "f6b394", "f6b394", "f6b191", "f6af8e", "f5ac8b", "f5ac8b", "f5aa89", "f5a886", "f4a683",
  "f4a683", "f3a481", "f2a17f", "f2a17f", "f19e7d", "f09c7b", "ef9979", "ef9979", "ee9677", "ec9374", "eb9172", "eb9172", "ea8e70", "e98b6e", "e8896c",
  "e8896c", "e6866a", "e58368", "e48066", "e48066", "e37e64", "e27b62", "e27b62", "e17860", "df765e", "de735c", "de735c", "dd7059", "dc6e57", "db6b55",
  "db6b55", "da6853", "d86551", "d7634f", "d7634f", "d6604d", "d55d4c", "d55d4c", "d35a4a", "d25849", "d05548", "d05548", "cf5246", "ce4f45", "cc4c44",
  "cc4c44", "cb4942", "c94741", "c84440", "c84440", "c6413e", "c53e3d", "c43b3c", "c43b3c", "c2383a", "c13639", "c13639", "bf3338", "be3036", "bd2d35",
  "bd2d35", "bb2a34", "ba2832", "b82531", "b82531", "b72230", "b61f2e", "b41c2d", "b41c2d", "b3192c", "b1182b", "b1182b", "ae172a", "ab162a", "a81529",
  "a81529", "a51429", "a21328", "9f1228", "9f1228", "9c1127", "991027", "960f27", "960f27", "930e26", "900d26", "8d0c25", "8d0c25", "8a0b25", "870a24",
  "870a24", "840924", "810823", "7f0823", "7f0823", "7c0722", "790622", "760521", "760521", "730421", "700320", "6d0220", "6d0220", "6a011f", "67001f",
  "67001f"
].map((h) => `#${h}`);
const colourFor = (v: number) => LUT[Math.min(Math.max(Math.floor(((v - VMIN) / (VMAX - VMIN)) * 256), 0), 255)];
const CTICKS = [-0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0];    // colour-bar ticks; matplotlib labels them with a true minus sign
const cLabel = (v: number) => (v < 0 ? `\u2212${Math.abs(v).toFixed(1)}` : v.toFixed(1));

export function CorrelationHeatmap() {
  const wrap = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number; flip: boolean } | null>(null);
  const n = COLS.length, cw = (AX.x1 - AX.x0) / n, ch = (AX.y1 - AX.y0) / n;
  const band = (AX.y1 - AX.y0) / 256;
  const cbY = (v: number) => AX.y1 - ((v - VMIN) / (VMAX - VMIN)) * (AX.y1 - AX.y0);
  const show = (e: React.PointerEvent, text: string) => {
    const el = wrap.current; if (!el) return;
    const b = el.getBoundingClientRect();
    setTip({ text, x: e.clientX - b.left + el.scrollLeft, y: e.clientY - b.top, flip: e.clientX - b.left > b.width / 2 });
  };
  return (
    <div ref={wrap} style={{ position: "relative", overflowX: "auto" }}
      // mouse: hide when the pointer leaves; touch: a pointer "leaves" as soon as the finger lifts, so keep the tip until a tap outside the cells
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setTip(null); }}
      onPointerDown={(e) => { if (!(e.target as Element).closest("[data-cell]")) setTip(null); }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Correlation Matrix - Key Numerical Variables: heatmap of Pearson correlations between 15 numerical variables"
        style={{ display: "block", width: "100%", maxWidth: W, minWidth: 600, height: "auto", margin: "0 auto", background: "#ffffff", fontFamily: FONT }}>
        <text x={524.58} y={22.08} textAnchor="middle" fontSize={PX(12.0)} fill={INK}>Correlation Matrix - Key Numerical Variables</text>
        {MATRIX.map((row, i) => row.map((v, j) => {
          const label = `${COLS[i]} \u00d7 ${COLS[j]}: r = ${v.toFixed(3)}`;
          return (
            <rect key={`${i}-${j}`} data-cell="" x={AX.x0 + j * cw} y={AX.y0 + i * ch} width={cw} height={ch} fill={colourFor(v)} shapeRendering="crispEdges"
              onPointerEnter={(e) => show(e, label)} onPointerMove={(e) => show(e, label)} onPointerDown={(e) => show(e, label)} />
          );
        }))}
        {COLS.map((c, j) => { const x = AX.x0 + (j + 0.5) * cw + 3.0 + NUDGE.xLabels.across, y = 378.75 + NUDGE.xLabels.along; return <text key={`x${c}`} x={x} y={y} transform={`rotate(-90 ${x} ${y})`} textAnchor="end" fontSize={PX(10)} fill={INK}>{c}</text>; })}
        {COLS.map((c, i) => <text key={`y${c}`} x={211.25 + NUDGE.yLabels.x} y={AX.y0 + (i + 0.5) * ch + 3.0 + NUDGE.yLabels.y} textAnchor="end" fontSize={PX(10)} fill={INK}>{c}</text>)}
        {LUT.map((g, k) => <rect key={k} x={CB.x0} y={AX.y1 - (k + 1) * band} width={CB.x1 - CB.x0} height={band + 0.05} fill={g} shapeRendering="crispEdges" />)}
        {CTICKS.map((v) => <text key={v} x={892.799 + NUDGE.cbar.x} y={cbY(v) + 4.5 + NUDGE.cbar.y} fontSize={PX(10)} fill={INK}>{cLabel(v)}</text>)}
      </svg>
      {tip && (
        <div className="tip" style={{ position: "absolute", left: tip.x, top: tip.y, transform: `translate(${tip.flip ? "calc(-100% - 12px)" : "12px"}, 12px)`, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 2 }}>
          <div className="tip-t" style={{ marginBottom: 0 }}>{tip.text}</div>
        </div>
      )}
    </div>
  );
}
