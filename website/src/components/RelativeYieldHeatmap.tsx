import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Recreates notebook cell [34] "Relative Seasonal Yield Performance by Crop" inside the existing website card
// (colours, range, labels and values from the notebook; display size from the website):
//   crop_season_yield = df.groupby(['Crop', 'Season'])['Yield_Tonnes_Ha'].mean().unstack()[SEASON_ORDER]
//   crop_season_yield_norm = crop_season_yield.div(crop_season_yield.max(axis=1), axis=0)
//   sns.heatmap(crop_season_yield_norm, annot=True, fmt='.2f', cmap='YlGnBu', cbar_kws={'label': "Yield relative to that crop's best season"})
//   ax.set_title("Relative Seasonal Yield Performance by Crop\n(1.00 = that crop's best season)")
// Values below were read back from matplotlib after re-running the cell on the cleaned data (the re-render is pixel-identical).
const ROWS = ["Chilli", "Cotton", "Groundnut", "Maize", "Pulses", "Rice", "Sugarcane", "Wheat"];
const COLS = ["Kharif", "Rabi", "Zaid"];
// crop_season_yield_norm and crop_season_yield at full precision (the website's stored copy is rounded to 2 dp,
// which would give 14 of the 24 cells a different colour and a different colour-scale minimum)
const NORM: number[][] = [
  [1.0, 0.845324189072189, 0.6874873102392703],
  [1.0, 0.869694811145277, 0.6958113377722366],
  [1.0, 0.8262337861238707, 0.6996824953228222],
  [1.0, 0.8825279337225389, 0.7767525283084105],
  [1.0, 0.8418467597596175, 0.6339131623103181],
  [1.0, 0.86349922427264, 0.7025180076150772],
  [1.0, 0.8231298691338802, 0.7187533496366466],
  [1.0, 0.9131785685877217, 0.7753152959219539],
];
const MEANS: number[][] = [
  [1.7304864864864864, 1.4628220858895706, 1.1896875],
  [1.3721860465116278, 1.1933830845771145, 0.9547826086956522],
  [1.4832124352331606, 1.2254802259887005, 1.0377777777777777],
  [2.9664102564102564, 2.6179399141630904, 2.3041666666666667],
  [1.0360633484162896, 0.8722065727699531, 0.6567741935483871],
  [2.705254777070064, 2.335985401459854, 1.9004901960784313],
  [53.459120000000006, 44.003798449612404, 38.42392156862745],
  [2.255325342465753, 2.0595147679324897, 1.7485882352941176],
];
// seaborn defaults vmin/vmax to the data range; matplotlib 'YlGnBu' 256-colour lookup table (exported from matplotlib)
const VMIN = 0.6339131623103181, VMAX = 1.0;
const LUT = [
  "ffffd9", "feffd8", "feffd6", "fdfed5", "fdfed4", "fcfed3", "fcfed1", "fbfdd0", "fafdcf", "fafdce", "f9fdcc", "f9fdcb", "f8fcca", "f8fcc9", "f7fcc7",
  "f7fcc6", "f6fbc5", "f5fbc4", "f5fbc2", "f4fbc1", "f4fbc0", "f3fabf", "f3fabd", "f2fabc", "f1fabb", "f1faba", "f0f9b8", "f0f9b7", "eff9b6", "eff9b5",
  "eef8b3", "edf8b2", "edf8b1", "ecf7b1", "eaf7b1", "e9f7b1", "e8f6b1", "e7f6b1", "e6f5b2", "e5f5b2", "e3f4b2", "e2f4b2", "e1f3b2", "e0f3b2", "dff2b2",
  "ddf2b2", "dcf1b2", "dbf1b2", "daf0b3", "d9f0b3", "d7efb3", "d6efb3", "d5efb3", "d4eeb3", "d3eeb3", "d1edb3", "d0edb3", "cfecb3", "ceecb3", "cdebb4",
  "cbebb4", "caeab4", "c9eab4", "c8e9b4", "c6e9b4", "c4e8b4", "c2e7b4", "c0e6b5", "bde5b5", "bbe4b5", "b9e4b5", "b7e3b6", "b4e2b6", "b2e1b6", "b0e0b6",
  "aedfb6", "abdeb7", "a9ddb7", "a7dcb7", "a5dcb7", "a2dbb8", "a0dab8", "9ed9b8", "9cd8b8", "99d7b8", "97d6b9", "95d5b9", "92d5b9", "90d4b9", "8ed3ba",
  "8cd2ba", "89d1ba", "87d0ba", "85cfba", "83cebb", "80cebb", "7ecdbb", "7cccbb", "7acbbc", "78cbbc", "76cabc", "75c9bd", "73c8bd", "71c8bd", "6fc7bd",
  "6dc6be", "6bc6be", "69c5be", "67c4be", "65c3bf", "63c3bf", "61c2bf", "5fc1c0", "5dc0c0", "5bc0c0", "59bfc0", "57bec1", "55bec1", "53bdc1", "52bcc2",
  "50bbc2", "4ebbc2", "4cbac2", "4ab9c3", "48b9c3", "46b8c3", "44b7c4", "42b6c4", "40b5c4", "3fb4c4", "3eb3c4", "3db2c4", "3cb1c3", "3bb0c3", "3aaec3",
  "39adc3", "37acc3", "36abc3", "35aac3", "34a9c3", "33a7c2", "32a6c2", "31a5c2", "2fa4c2", "2ea3c2", "2da2c2", "2ca1c2", "2b9fc2", "2a9ec1", "299dc1",
  "289cc1", "269bc1", "259ac1", "2498c1", "2397c1", "2296c1", "2195c0", "2094c0", "1f93c0", "1d91c0", "1d90c0", "1d8ebf", "1d8dbe", "1e8bbd", "1e8abd",
  "1e88bc", "1e86bb", "1e85ba", "1e83ba", "1f82b9", "1f80b8", "1f7eb7", "1f7db6", "1f7bb6", "1f7ab5", "1f78b4", "2076b3", "2075b3", "2073b2", "2072b1",
  "2070b0", "206eb0", "216daf", "216bae", "216aad", "2168ad", "2166ac", "2165ab", "2163aa", "2262aa", "2260a9", "225ea8", "225da8", "225ca7", "225aa6",
  "2259a6", "2258a5", "2356a4", "2355a4", "2354a3", "2352a3", "2351a2", "2350a1", "234fa1", "234da0", "234c9f", "234b9f", "23499e", "24489d", "24479d",
  "24459c", "24449c", "24439b", "24419a", "24409a", "243f99", "243d98", "243c98", "253b97", "253997", "253896", "253795", "253595", "253494", "243392",
  "233390", "22328f", "21318d", "21308b", "203089", "1f2f87", "1e2e85", "1d2e83", "1c2d81", "1b2c80", "1a2b7e", "192b7c", "182a7a", "172978", "172976",
  "162874", "152772", "142670", "13266f", "12256d", "11246b", "102369", "0f2367", "0e2265", "0d2163", "0d2161", "0c2060", "0b1f5e", "0a1e5c", "091e5a",
  "081d58"
].map((h) => `#${h}`);
const colourFor = (v: number) => LUT[Math.min(Math.max(Math.floor(((v - VMIN) / (VMAX - VMIN)) * 256), 0), 255)];
const CTICKS = [0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];                 // matplotlib's colour-bar ticks
const CTICK_LABELS = ["0.65", "0.70", "0.75", "0.80", "0.85", "0.90", "0.95", "1.00"];
const TITLE = ["Relative Seasonal Yield Performance by Crop", "(1.00 = that crop's best season)"];   // the title's two lines
const CLABEL = "Yield relative to that crop's best season";
const INK = "#262626";                                              // seaborn '.15' text colour
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { title: 13, label: 11, tick: 11, annot: 11 };         // notebook 12 pt title, 10 pt labels/ticks/annotations - sized for the card
// seaborn annotation colour: dark on light cells, white on dark cells (relative luminance > .408)
function textColour(hex: string) {
  const lin = [1, 3, 5].map((i) => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] > 0.408 ? INK : "#ffffff";
}
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

export function RelativeYieldHeatmap({ height, describe }: { height: number; describe: (crop: string, season: string, mean: number, rel: number) => string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);
  useLayoutEffect(() => { if (box.current) setW(box.current.clientWidth); }, []);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);

  const rowW = Math.max(...ROWS.map((r) => textW(r, FS.tick)));
  const cTickW = Math.max(...CTICK_LABELS.map((t) => textW(t, FS.tick)));
  const left = FS.label + 6 + rowW + 6;
  const cbW = 12, cbGap = 12, right = cbGap + cbW + 5 + cTickW + 8 + FS.label + 2;
  const pw = Math.max(w - left - right, 30), cx = left + pw / 2;
  const titleLines = w ? TITLE.flatMap((t) => wrap(t, FS.title, 2 * Math.min(cx, w - cx) - 4)) : TITLE;
  const m = { top: titleLines.length * FS.title * 1.2 + 8, bottom: FS.tick + 6 + FS.label + 8 };
  const ph = height - m.top - m.bottom;
  const cw = pw / COLS.length, ch = ph / ROWS.length;
  const cbX = left + pw + cbGap, band = ph / 256;
  const cbY = (v: number) => m.top + ph - ((v - VMIN) / (VMAX - VMIN)) * ph;

  return (
    <div>
      <div ref={box} style={{ height }} onMouseLeave={() => setDetail(null)}>
        {w > 0 && (
          <svg width={w} height={height} role="table" aria-label="Relative Seasonal Yield Performance by Crop (1.00 = that crop's best season)" style={{ display: "block", fontFamily: FONT }}>
            {titleLines.map((t, k) => <text key={k} x={cx} y={FS.title * (1.2 * k + 1)} textAnchor="middle" fontSize={FS.title} fill={INK}>{t}</text>)}
            {ROWS.map((r, i) => COLS.map((c, j) => {
              const v = NORM[i][j], fill = colourFor(v), text = describe(r, c, MEANS[i][j], v);
              return (
                <g key={`${r}-${c}`} role="cell" aria-label={text} tabIndex={0} className="rel-cell" onMouseEnter={() => setDetail(text)} onFocus={() => setDetail(text)} onBlur={() => setDetail(null)}>
                  <rect x={left + j * cw} y={m.top + i * ch} width={cw} height={ch} fill={fill} shapeRendering="crispEdges" />
                  <text x={left + (j + 0.5) * cw} y={m.top + (i + 0.5) * ch} dominantBaseline="central" textAnchor="middle" fontSize={FS.annot} fill={textColour(fill)} pointerEvents="none">{v.toFixed(2)}</text>
                </g>
              );
            }))}
            {ROWS.map((r, i) => <text key={`y${r}`} x={left - 6} y={m.top + (i + 0.5) * ch} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{r}</text>)}
            {COLS.map((c, j) => <text key={`x${c}`} x={left + (j + 0.5) * cw} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{c}</text>)}
            <text x={cx} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>Season</text>
            <text x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>Crop</text>
            {LUT.map((g, k) => <rect key={k} x={cbX} y={m.top + ph - (k + 1) * band} width={cbW} height={band + 0.05} fill={g} shapeRendering="crispEdges" />)}
            {CTICKS.map((t, k) => <text key={t} x={cbX + cbW + 5} y={cbY(t)} dominantBaseline="central" fontSize={FS.tick} fill={INK}>{CTICK_LABELS[k]}</text>)}
            <text x={w - 3} y={m.top + ph / 2} transform={`rotate(-90 ${w - 3} ${m.top + ph / 2})`} textAnchor="middle" fontSize={FS.label} fill={INK}>{CLABEL}</text>
          </svg>
        )}
      </div>
      <div className="scale-bar" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
        <span style={{ color: "var(--ink-2)", fontWeight: 500, minHeight: 18 }} aria-live="polite">{detail ?? "Hover or focus a cell for details"}</span>
      </div>
    </div>
  );
}
