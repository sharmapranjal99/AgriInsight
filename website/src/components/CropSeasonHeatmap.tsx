import { useRef, useState } from "react";

// Faithful SVG recreation of notebook cell [24] (In[16]), "Crop Composition by Season":
//   crop_season_counts = pd.crosstab(df['Crop'], df['Season'])[SEASON_ORDER]
//   plt.figure(figsize=(10, 6))
//   sns.heatmap(crop_season_counts, annot=True, fmt='d', cmap='Greens', linewidths=0.5, linecolor='white',
//               cbar_kws={'label': 'Number of Records'})
//   plt.title('Crop Composition by Season', fontsize=14, fontweight='bold'); plt.xlabel('Season', fontsize=11); plt.ylabel('Crop', fontsize=11)
//   plt.tight_layout()
// with cell [2]'s sns.set_style('whitegrid') and figure.dpi = 100. The notebook's inline PNG is 926 x 590 px; every coordinate below is in
// that pixel space, read back from matplotlib after re-running the cell (the re-render is pixel-identical to the saved output).
const W = 926, H = 590;
const AX = { x0: 51.28, y0: 32.33, x1: 794.26, y1: 538.72 };      // heatmap axes
const CB = { x0: 840.69, x1: 866.01 };                              // colour bar (same height as the axes)
const PX = (pt: number) => (pt * 100) / 72;                         // matplotlib points -> px at 100 dpi
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif'; // seaborn style font list (the notebook rendered in Arial)
const INK = "#262626";                                              // seaborn ".15" text colour
const EDGE = { color: "#ffffff", width: PX(0.5) };                  // linewidths=0.5, linecolor='white'
// Browser vs matplotlib (Agg) text rasterisation offset, measured by diffing this SVG against the notebook PNG:
// rotated crop labels render ~2 px further along the text than matplotlib, other small labels ~0.5 px higher.
const NUDGE = { rotated: 2, small: 0.5 };

// matplotlib 'Greens' colormap, N = 256 lookup table (exported from matplotlib).
const GREENS = [
  "f7fcf5", "f6fcf4", "f6fcf4", "f5fbf3", "f5fbf2", "f4fbf2", "f4fbf1", "f3faf0", "f2faf0", "f2faef", "f1faee", "f1faee", "f0f9ed", "f0f9ec", "eff9ec",
  "eff9eb", "eef8ea", "edf8ea", "edf8e9", "ecf8e8", "ecf8e8", "ebf7e7", "ebf7e7", "eaf7e6", "e9f7e5", "e9f7e5", "e8f6e4", "e8f6e3", "e7f6e3", "e7f6e2",
  "e6f5e1", "e5f5e1", "e5f5e0", "e4f5df", "e3f4de", "e2f4dd", "e1f3dc", "e0f3db", "dff3da", "def2d9", "ddf2d8", "dcf2d7", "dbf1d6", "dbf1d5", "daf0d4",
  "d9f0d3", "d8f0d2", "d7efd1", "d6efd0", "d5efcf", "d4eece", "d3eecd", "d2edcc", "d1edcb", "d0edca", "cfecc9", "ceecc8", "cdecc7", "ccebc6", "cbebc5",
  "cbeac4", "caeac3", "c9eac2", "c8e9c1", "c7e9c0", "c6e8bf", "c4e8bd", "c3e7bc", "c2e7bb", "c1e6ba", "c0e6b9", "bee5b8", "bde5b6", "bce4b5", "bbe4b4",
  "bae3b3", "b8e3b2", "b7e2b1", "b6e2af", "b5e1ae", "b4e1ad", "b2e0ac", "b1e0ab", "b0dfaa", "afdfa8", "aedea7", "acdea6", "abdda5", "aadda4", "a9dca3",
  "a8dca2", "a7dba0", "a5db9f", "a4da9e", "a3da9d", "a2d99c", "a0d99b", "9fd899", "9ed798", "9cd797", "9bd696", "99d595", "98d594", "97d492", "95d391",
  "94d390", "92d28f", "91d28e", "90d18d", "8ed08b", "8dd08a", "8bcf89", "8ace88", "88ce87", "87cd86", "86cc85", "84cc83", "83cb82", "81ca81", "80ca80",
  "7fc97f", "7dc87e", "7cc87c", "7ac77b", "79c67a", "78c679", "76c578", "75c477", "73c476", "72c375", "70c274", "6ec173", "6dc072", "6bc072", "6abf71",
  "68be70", "66bd6f", "65bd6f", "63bc6e", "62bb6d", "60ba6c", "5eb96b", "5db96b", "5bb86a", "5ab769", "58b668", "56b567", "55b567", "53b466", "52b365",
  "50b264", "4eb264", "4db163", "4bb062", "4aaf61", "48ae60", "46ae60", "45ad5f", "43ac5e", "42ab5d", "40aa5d", "3fa95c", "3fa85b", "3ea75a", "3da65a",
  "3ca559", "3ba458", "3aa357", "39a257", "38a156", "37a055", "369f54", "359e53", "349d53", "339c52", "329b51", "319a50", "309950", "2f984f", "2f974e",
  "2e964d", "2d954d", "2c944c", "2b934b", "2a924a", "29914a", "289049", "278f48", "268e47", "258d47", "248c46", "238b45", "228a44", "218944", "208843",
  "1f8742", "1e8741", "1d8640", "1c8540", "1a843f", "19833e", "18823d", "17813d", "16803c", "157f3b", "147e3a", "137d39", "127c39", "117b38", "107a37",
  "0e7936", "0d7836", "0c7735", "0b7734", "0a7633", "097532", "087432", "077331", "067230", "05712f", "03702e", "026f2e", "016e2d", "006d2c", "006c2c",
  "006b2b", "00692a", "00682a", "006729", "006529", "006428", "006328", "006227", "006027", "005f26", "005e26", "005c25", "005b25", "005a24", "005924",
  "005723", "005622", "005522", "005321", "005221", "005120", "005020", "004e1f", "004d1f", "004c1e", "004a1e", "00491d", "00481d", "00471c", "00451c",
  "00441b"
].map((h) => `#${h}`);

// seaborn: vmin/vmax default to the data range; matplotlib maps a value to LUT entry floor(norm * N), clipped to N - 1.
const colourFor = (v: number, lo: number, hi: number) => GREENS[Math.min(Math.max(Math.floor(((v - lo) / (hi - lo)) * 256), 0), 255)];
// seaborn annotation colour: dark (".15") on light cells, white on dark cells, by relative luminance > .408.
function textColour(hex: string) {
  const lin = [1, 3, 5].map((i) => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] > 0.408 ? INK : "#ffffff";
}

export function CropSeasonHeatmap({ rows, cols, values }: { rows: string[]; cols: string[]; values: number[][] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number; flip: boolean } | null>(null);
  const flat = values.flat(), lo = Math.min(...flat), hi = Math.max(...flat);
  const cw = (AX.x1 - AX.x0) / cols.length, ch = (AX.y1 - AX.y0) / rows.length;
  // colour-bar ticks: matplotlib's auto locator gives 50-unit steps for the notebook's 51-314 range
  const step = 50, ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);
  const cbY = (v: number) => AX.y1 - ((v - lo) / (hi - lo)) * (AX.y1 - AX.y0);
  const band = (AX.y1 - AX.y0) / 256;

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
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Crop Composition by Season: heatmap of record counts for each crop and season"
        style={{ display: "block", width: "78%", maxWidth: W, minWidth: 600, height: "auto", margin: "0 auto", background: "#ffffff", fontFamily: FONT }}>
        <text x={422.76} y={24} textAnchor="middle" fontSize={PX(14)} fontWeight="bold" fill={INK}>Crop Composition by Season</text>
        {rows.map((r, i) => cols.map((c, j) => {
          const v = values[i][j], fill = colourFor(v, lo, hi), x = AX.x0 + j * cw, y = AX.y0 + i * ch, label = `${r}, ${c}`;
          return (
            <g key={label} data-cell="" onPointerEnter={(e) => show(e, label)} onPointerMove={(e) => show(e, label)} onPointerDown={(e) => show(e, label)}>
              <rect x={x} y={y} width={cw} height={ch} fill={fill} stroke={EDGE.color} strokeWidth={EDGE.width} />
              <text x={x + cw / 2} y={y + ch / 2 + 3 + NUDGE.small} textAnchor="middle" fontSize={PX(10)} fill={textColour(fill)} pointerEvents="none">{v}</text>
            </g>
          );
        }))}
        {cols.map((c, j) => <text key={c} x={AX.x0 + (j + 0.5) * cw} y={557.44 + NUDGE.small} textAnchor="middle" fontSize={PX(10)} fill={INK}>{c}</text>)}
        {rows.map((r, i) => { const y = AX.y0 + (i + 0.5) * ch + NUDGE.rotated; return <text key={r} x={38.56} y={y} transform={`rotate(-90 38.56 ${y})`} textAnchor="middle" fontSize={PX(10)} fill={INK}>{r}</text>; })}
        <text x={422.76} y={577} textAnchor="middle" fontSize={PX(11)} fill={INK}>Season</text>
        <text x={21} y={285.53} transform="rotate(-90 21 285.53)" textAnchor="middle" fontSize={PX(11)} fill={INK}>Crop</text>
        {GREENS.map((g, k) => <rect key={k} x={CB.x0} y={AX.y1 - (k + 1) * band} width={CB.x1 - CB.x0} height={band + 0.05} fill={g} shapeRendering="crispEdges" />)}
        {ticks.map((t) => <text key={t} x={875.73} y={cbY(t) + 4.5 + NUDGE.small} fontSize={PX(10)} fill={INK}>{t}</text>)}
        <text x={913.54} y={285.53} transform="rotate(-90 913.54 285.53)" textAnchor="middle" fontSize={PX(10)} fill={INK}>Number of Records</text>
      </svg>
      {tip && (
        <div className="tip" style={{ position: "absolute", left: tip.x, top: tip.y, transform: `translate(${tip.flip ? "calc(-100% - 12px)" : "12px"}, 12px)`, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 2 }}>
          <div className="tip-t" style={{ marginBottom: 0 }}>{tip.text}</div>
        </div>
      )}
    </div>
  );
}
