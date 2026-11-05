import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tip } from "./ui";

// Recreates notebook section 10 (Regional and Crop Analysis) inside the existing website card:
//   cell [54] (In[32]): state_season_profit = df.groupby(['State', 'Season'])['Profit_INR'].mean().unstack()[SEASON_ORDER]
//   cell [55] (In[33]): fig, ax = plt.subplots(figsize=(9, 5)); sns.heatmap(state_season_profit, annot=True, fmt='.0f', cmap='RdYlGn', center=0, ax=ax)
//                        ax.set_title('Mean Profit (INR) by State and Season')                                   <- the card title
//   cell [56]:           crop_season_profit = df.pivot_table(index='Crop', columns='Season', values='Profit_INR', aggfunc='mean')[['Kharif', 'Rabi', 'Zaid']]
//                        sns.heatmap(crop_season_profit, annot=True, fmt='.0f', cmap='RdYlGn', center=0, ax=ax)
//                        ax.set_title('Mean Profit (INR) by Crop and Season')                                    <- the card title
// with cell [2]'s sns.set_style('whitegrid'). Values are the full-precision float64 means; annotations, annotation colours (seaborn's
// luminance rule), colour-bar ticks/offset and the re-centred RdYlGn lookup tables (center=0, linear norm over the data's min..max) were
// read back from matplotlib after re-running the cells on the cleaned data (pixel-identical re-render of both saved outputs).
const COLS = ["Kharif", "Rabi", "Zaid"] as const;
const DATA = {
  state: {
    cell: 55, rows: ["Andhra Pradesh", "Gujarat", "Karnataka", "Madhya Pradesh", "Maharashtra", "Punjab", "Tamil Nadu", "Telangana"], ylabel: "State", xlabel: "Season",
    matrix: [
      [169315.52083333334, 26315.710784313724, -84084.8705882353],
      [217051.33031674207, 82846.195, -106929.6119402985],
      [201226.2057416268, 70952.61165048544, 23310.905405405407],
      [134242.3982300885, 61576.26442307692, 209.6984126984127],
      [168801.04954954956, 159581.50458715597, -40597.59722222222],
      [133779.09954751132, 169294.52150537635, 62109.68831168831],
      [211303.9563106796, 70456.86057692308, -15175.197183098591],
      [199668.38034188034, 62824.604060913705, -34620.77647058824],
    ],
    annot: ["169316", "26316", "-84085", "217051", "82846", "-106930", "201226", "70953", "23311", "134242", "61576", "210", "168801", "159582", "-40598", "133779", "169295", "62110", "211304", "70457", "-15175", "199668", "62825", "-34621"],
    annotColor: ["#ffffff", "#262626", "#262626", "#ffffff", "#262626", "#ffffff", "#ffffff", "#262626", "#262626", "#ffffff", "#262626", "#262626", "#ffffff", "#ffffff", "#262626", "#ffffff", "#ffffff", "#262626", "#ffffff", "#262626", "#262626", "#ffffff", "#262626", "#262626"],
    vmin: -106929.6119402985, vmax: 217051.33031674207,
    cticks: [-100000.0, -50000.0, 0.0, 50000.0, 100000.0, 150000.0, 200000.0], cticklabels: ["−100000", "−50000", "0", "50000", "100000", "150000", "200000"], coffset: "",
    lut: [
      "f98e52", "f99153", "f99355", "fa9656", "fa9656", "fa9857", "fa9b58", "fb9d59", "fb9d59", "fba05b", "fba35c", "fca55d", "fca55d", "fca85e", "fcaa5f", "fdad60",
      "fdad60", "fdaf62", "fdb163", "fdb365", "fdb365", "fdb567", "fdb768", "fdb96a", "fdb96a", "fdbb6c", "fdbd6d", "fdbf6f", "fdbf6f", "fdc171", "fdc372", "fdc574",
      "fdc574", "fdc776", "fec877", "feca79", "feca79", "fecc7b", "fece7c", "fed07e", "fed07e", "fed27f", "fed481", "fed683", "fed683", "fed884", "feda86", "fedc88",
      "fedc88", "fede89", "fee08b", "fee18d", "fee18d", "fee28f", "fee491", "fee593", "fee593", "fee695", "fee797", "fee999", "fee999", "feea9b", "feeb9d", "feec9f",
      "feec9f", "feeda1", "feefa3", "fff0a6", "fff0a6", "fff1a8", "fff2aa", "fff3ac", "fff3ac", "fff5ae", "fff6b0", "fff7b2", "fff7b2", "fff8b4", "fffab6", "fffbb8",
      "fffbb8", "fffcba", "fffdbc", "fffebe", "fffebe", "feffbe", "fdfebc", "fbfdba", "fbfdba", "fafdb8", "f8fcb6", "f7fcb4", "f7fcb4", "f5fbb2", "f4fab0", "f2faae",
      "f2faae", "f1f9ac", "eff8aa", "eef8a8", "eef8a8", "ecf7a6", "ebf7a3", "e9f6a1", "e9f6a1", "e8f59f", "e6f59d", "e5f49b", "e5f49b", "e3f399", "e2f397", "e0f295",
      "e0f295", "dff293", "ddf191", "dcf08f", "dcf08f", "daf08d", "d9ef8b", "d7ee8a", "d7ee8a", "d5ed88", "d3ec87", "d1ec86", "d1ec86", "cfeb85", "cdea83", "cbe982",
      "cbe982", "c9e881", "c7e77f", "c5e67e", "c5e67e", "c3e67d", "c1e57b", "bfe47a", "bfe47a", "bde379", "bbe278", "b9e176", "b9e176", "b7e075", "b5df74", "b3df72",
      "b3df72", "b1de71", "afdd70", "addc6f", "addc6f", "abdb6d", "a9da6c", "a7d96b", "a7d96b", "a5d86a", "a2d76a", "a0d669", "a0d669", "9dd569", "9bd469", "98d368",
      "98d368", "96d268", "93d168", "91d068", "91d068", "8ecf67", "8ccd67", "89cc67", "89cc67", "87cb67", "84ca66", "82c966", "82c966", "7fc866", "7dc765", "7ac665",
      "7ac665", "78c565", "75c465", "73c264", "73c264", "70c164", "6ec064", "6bbf64", "6bbf64", "69be63", "66bd63", "63bc62", "63bc62", "60ba62", "5db961", "5ab760",
      "5ab760", "57b65f", "54b45f", "51b35e", "51b35e", "4eb15d", "4bb05c", "48ae5c", "48ae5c", "45ad5b", "42ac5a", "3faa59", "3faa59", "3ca959", "39a758", "36a657",
      "36a657", "33a456", "30a356", "2da155", "2da155", "2aa054", "279f53", "249d53", "249d53", "219c52", "1e9a51", "1b9950", "1b9950", "199750", "18954f", "17934e",
      "17934e", "16914d", "15904c", "148e4b", "148e4b", "138c4a", "128a49", "118848", "118848", "108647", "0f8446", "0e8245", "0e8245", "0d8044", "0c7f43", "0b7d42",
      "0b7d42", "0a7b41", "097940", "08773f", "08773f", "07753e", "06733d", "05713c", "05713c", "04703b", "036e3a", "026c39", "026c39", "016a38", "006837", "006837",
    ].map((h) => `#${h}`),
  },
  crop: {
    cell: 56, rows: ["Chilli", "Cotton", "Groundnut", "Maize", "Pulses", "Rice", "Sugarcane", "Wheat"], ylabel: "Crop", xlabel: "Season",
    matrix: [
      [954380.4216216216, 638572.4969325153, 448659.09375],
      [216999.5488372093, 107343.58706467661, -53925.336956521736],
      [108265.44041450777, 10416.542372881357, -68872.5],
      [-39332.67094017094, -89133.4034334764, -194049.16666666666],
      [43338.89592760181, -14309.136150234743, -139227.8064516129],
      [-64903.40445859873, -98427.8686131387, -227239.3431372549],
      [1000790.808, 731612.8604651163, 583635.8039215687],
      [-105871.8698630137, -119954.56540084389, -193208.95294117648],
    ],
    annot: ["954380", "638572", "448659", "217000", "107344", "-53925", "108265", "10417", "-68872", "-39333", "-89133", "-194049", "43339", "-14309", "-139228", "-64903", "-98428", "-227239", "1000791", "731613", "583636", "-105872", "-119955", "-193209"],
    annotColor: ["#ffffff", "#ffffff", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#262626", "#ffffff", "#ffffff", "#ffffff", "#262626", "#262626", "#262626"],
    vmin: -227239.3431372549, vmax: 1000790.808,
    cticks: [-200000.0, 0.0, 200000.0, 400000.0, 600000.0, 800000.0, 1000000.0], cticklabels: ["−0.2", "0.0", "0.2", "0.4", "0.6", "0.8", "1.0"], coffset: "1e6",
    lut: [
      "fed884", "feda86", "fedc88", "fedc88", "fede89", "fee08b", "fee08b", "fee18d", "fee18d", "fee28f", "fee491", "fee491", "fee593", "fee593", "fee695", "fee797",
      "fee797", "fee999", "feea9b", "feea9b", "feeb9d", "feeb9d", "feec9f", "feeda1", "feeda1", "feefa3", "feefa3", "fff0a6", "fff1a8", "fff1a8", "fff2aa", "fff3ac",
      "fff3ac", "fff5ae", "fff5ae", "fff6b0", "fff7b2", "fff7b2", "fff8b4", "fff8b4", "fffab6", "fffbb8", "fffbb8", "fffcba", "fffdbc", "fffdbc", "fffebe", "fffebe",
      "feffbe", "fdfebc", "fdfebc", "fbfdba", "fbfdba", "fafdb8", "f8fcb6", "f8fcb6", "f7fcb4", "f5fbb2", "f5fbb2", "f4fab0", "f4fab0", "f2faae", "f1f9ac", "f1f9ac",
      "eff8aa", "eff8aa", "eef8a8", "ecf7a6", "ecf7a6", "ebf7a3", "e9f6a1", "e9f6a1", "e8f59f", "e8f59f", "e6f59d", "e5f49b", "e5f49b", "e3f399", "e3f399", "e2f397",
      "e0f295", "e0f295", "dff293", "ddf191", "ddf191", "dcf08f", "dcf08f", "daf08d", "d9ef8b", "d9ef8b", "d7ee8a", "d7ee8a", "d5ed88", "d3ec87", "d3ec87", "d1ec86",
      "cfeb85", "cfeb85", "cdea83", "cdea83", "cbe982", "c9e881", "c9e881", "c7e77f", "c7e77f", "c5e67e", "c3e67d", "c3e67d", "c1e57b", "bfe47a", "bfe47a", "bde379",
      "bde379", "bbe278", "b9e176", "b9e176", "b7e075", "b5df74", "b5df74", "b3df72", "b3df72", "b1de71", "afdd70", "afdd70", "addc6f", "addc6f", "abdb6d", "a9da6c",
      "a9da6c", "a7d96b", "a5d86a", "a5d86a", "a2d76a", "a2d76a", "a0d669", "9dd569", "9dd569", "9bd469", "9bd469", "98d368", "96d268", "96d268", "93d168", "91d068",
      "91d068", "8ecf67", "8ecf67", "8ccd67", "89cc67", "89cc67", "87cb67", "87cb67", "84ca66", "82c966", "82c966", "7fc866", "7dc765", "7dc765", "7ac665", "7ac665",
      "78c565", "75c465", "75c465", "73c264", "73c264", "70c164", "6ec064", "6ec064", "6bbf64", "69be63", "69be63", "66bd63", "66bd63", "63bc62", "60ba62", "60ba62",
      "5db961", "5db961", "5ab760", "57b65f", "57b65f", "54b45f", "51b35e", "51b35e", "4eb15d", "4eb15d", "4bb05c", "48ae5c", "48ae5c", "45ad5b", "45ad5b", "42ac5a",
      "3faa59", "3faa59", "3ca959", "39a758", "39a758", "36a657", "36a657", "33a456", "30a356", "30a356", "2da155", "2da155", "2aa054", "279f53", "279f53", "249d53",
      "219c52", "219c52", "1e9a51", "1e9a51", "1b9950", "199750", "199750", "18954f", "18954f", "17934e", "16914d", "16914d", "15904c", "148e4b", "148e4b", "138c4a",
      "138c4a", "128a49", "118848", "118848", "108647", "108647", "0f8446", "0e8245", "0e8245", "0d8044", "0c7f43", "0c7f43", "0b7d42", "0b7d42", "0a7b41", "097940",
      "097940", "08773f", "08773f", "07753e", "06733d", "06733d", "05713c", "04703b", "04703b", "036e3a", "036e3a", "026c39", "016a38", "016a38", "006837", "006837",
    ].map((h) => `#${h}`),
  },
};
export type ProfitHeatmapKind = keyof typeof DATA;
const INK = "#262626";
const FONT = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const FS = { tick: 11, label: 11, annot: 11 };     // notebook 10 pt ticks/labels/annotations, sized for the card
const MIN_W = 310;                                  // below this the chart keeps its width and scrolls inside the card
const GAP = 0.0625, CB_ASPECT = 20;                 // matplotlib colour-bar pad (relative to the axes width) and aspect
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

export function NotebookProfitHeatmap({ kind, height }: { kind: ProfitHeatmapKind; height: number }) {
  const D = DATA[kind];
  const [box, cw] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ r: number; c: number; x: number; y: number } | null>(null);
  const close = useCallback(() => setHover(null), []);
  useEffect(() => { setHover(null); }, [kind]);
  useEffect(() => {                                              // touch: close the tooltip when tapping outside the chart
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", onDown); return () => document.removeEventListener("pointerdown", onDown);
  }, [box, close]);
  const w = Math.max(cw, MIN_W);
  const lutAt = (v: number) => D.lut[Math.min(Math.max(Math.floor(((v - D.vmin) / (D.vmax - D.vmin)) * 256), 0), 255)];
  const m = { top: D.coffset ? FS.tick + 16 : 8, bottom: FS.tick + 6 + FS.label + 8, left: FS.label + 8 + Math.max(...D.rows.map((t) => textW(t, FS.tick))) + 6 };
  const ph = height - m.top - m.bottom, cbW = ph / CB_ASPECT;
  const cbLabW = 6 + Math.max(...D.cticklabels.map((t) => textW(t, FS.tick))) + 4;
  const pw = Math.max((w - m.left - cbW - cbLabW) / (1 + GAP), 10);
  const cbX = m.left + pw + GAP * pw;
  const cellW = pw / COLS.length, cellH = ph / D.rows.length;
  const fsA = Math.max(9, Math.min(FS.annot, (FS.annot * (cellW - 6)) / Math.max(...D.annot.map((t) => textW(t, FS.annot)))));
  const fsY = Math.min(FS.label, (FS.label * (ph - 4)) / textW(D.ylabel, FS.label));
  const cbY = (v: number) => m.top + ph - ((v - D.vmin) / (D.vmax - D.vmin)) * ph;
  const band = ph / 256;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < m.left || px >= m.left + pw || py < m.top || py >= m.top + ph) { if (e.pointerType === "mouse") setHover(null); return; }
    setHover({ r: Math.floor((py - m.top) / cellH), c: Math.floor((px - m.left) / cellW), x: px - (box.current?.scrollLeft ?? 0), y: py });
  };
  const hv = hover ? D.matrix[hover.r][hover.c] : null;
  return (
    <div style={{ position: "relative" }}>
      <div ref={box} style={{ overflowX: "auto", height }}>
        {cw > 0 && (
          <svg width={w} height={height} role="img" data-chart={`profit-${kind}`} aria-label={`Heatmap of mean profit (INR) by ${D.ylabel.toLowerCase()} and season`} style={{ display: "block", maxWidth: "none", fontFamily: FONT }}
            onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
            {D.matrix.map((row, i) => row.map((v, j) => (
              <rect key={`${i}-${j}`} data-cell={`${D.rows[i]}|${COLS[j]}`} x={m.left + j * cellW} y={m.top + i * cellH} width={cellW} height={cellH} fill={lutAt(v)} shapeRendering="crispEdges" />
            )))}
            {hover && <rect x={m.left + hover.c * cellW + 0.75} y={m.top + hover.r * cellH + 0.75} width={cellW - 1.5} height={cellH - 1.5} fill="none" stroke={INK} strokeWidth={1.5} pointerEvents="none" />}
            {D.matrix.map((row, i) => row.map((_, j) => (
              <text key={`a${i}-${j}`} data-role="annot" x={m.left + (j + 0.5) * cellW} y={m.top + (i + 0.5) * cellH} dominantBaseline="central" textAnchor="middle" fontSize={fsA} fill={D.annotColor[i * COLS.length + j]} pointerEvents="none">{D.annot[i * COLS.length + j]}</text>
            )))}
            {D.rows.map((t, i) => <text key={`y${t}`} data-role="ytick" x={m.left - 6} y={m.top + (i + 0.5) * cellH} dominantBaseline="central" textAnchor="end" fontSize={FS.tick} fill={INK}>{t}</text>)}
            {COLS.map((t, j) => <text key={`x${t}`} data-role="xtick" x={m.left + (j + 0.5) * cellW} y={m.top + ph + 6 + FS.tick * 0.8} textAnchor="middle" fontSize={FS.tick} fill={INK}>{t}</text>)}
            <text data-role="xlabel" x={m.left + pw / 2} y={height - 4} textAnchor="middle" fontSize={FS.label} fill={INK}>{D.xlabel}</text>
            <text data-role="ylabel" x={FS.label} y={m.top + ph / 2} transform={`rotate(-90 ${FS.label} ${m.top + ph / 2})`} textAnchor="middle" fontSize={fsY} fill={INK}>{D.ylabel}</text>
            <g data-colorbar="">
              {D.lut.map((c, k) => <rect key={k} x={cbX} y={m.top + ph - (k + 1) * band} width={cbW} height={band + 0.05} fill={c} shapeRendering="crispEdges" />)}
            </g>
            {D.cticks.map((v, k) => <text key={`c${v}`} data-role="ctick" x={cbX + cbW + 6} y={cbY(v)} dominantBaseline="central" fontSize={FS.tick} fill={INK}>{D.cticklabels[k]}</text>)}
            {D.coffset && <text data-role="coffset" x={cbX + cbW} y={m.top - 10} textAnchor="start" fontSize={FS.tick} fill={INK}>{D.coffset}</text>}
          </svg>
        )}
      </div>
      {hover && hv !== null && (
        <div style={{ position: "absolute", left: hover.x, top: hover.y, transform: `translate(${hover.x > Math.min(cw, w) / 2 ? "calc(-100% - 12px)" : "12px"}, ${hover.y > height / 2 ? "calc(-100% - 12px)" : "12px"})`, pointerEvents: "none", zIndex: 2, whiteSpace: "nowrap" }}>
          <Tip active label={`${D.rows[hover.r]} · ${COLS[hover.c]}`} payload={[{ name: "Mean Profit (INR)", value: hv, color: lutAt(hv) }]} format={() => exact(hv)} />
        </div>
      )}
    </div>
  );
}
