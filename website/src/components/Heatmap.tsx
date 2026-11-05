import { useState } from "react";

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
const lum = (c: RGB) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

const SEQ = ["#f1f7f2", "#bfe3cf", "#5fbf8f", "#1f8a5b", "#123d29"].map(hex);
const NEG = hex("#b5483a"), MID = hex("#f6f2ea"), POS = hex("#1f8a5b");

function ramp(stops: RGB[], t: number): RGB {
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mix(stops[i], stops[i + 1], x - i);
}

export const seqColor = (t: number) => ramp(SEQ, t);
/** t in [-1, 1] */
export const divColor = (t: number) => (t < 0 ? mix(MID, NEG, Math.min(1, -t)) : mix(MID, POS, Math.min(1, t)));

export const SEQ_CSS = `linear-gradient(90deg, ${SEQ.map(css).join(",")})`;
export const DIV_CSS = `linear-gradient(90deg, ${css(NEG)}, ${css(MID)}, ${css(POS)})`;

interface Props {
  rows: string[];
  cols: string[];
  value: (r: number, c: number) => number;
  /** maps a value to [0,1] for sequential, or [-1,1] for diverging */
  scale: (v: number) => number;
  diverging?: boolean;
  format: (v: number) => string;
  describe: (row: string, col: string, v: number) => string;
  cellW?: number;
  cellH?: number;
  rowLabelW?: number;
  rotateCols?: boolean;
  showValues?: boolean;
  scaleLabels?: [string, string, string?];
  ariaLabel: string;
}

export function Heatmap({ rows, cols, value, scale, diverging, format, describe, cellW = 84, cellH = 40, rowLabelW = 130, rotateCols, showValues = true, scaleLabels, ariaLabel }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div>
      <div className="hm-wrap">
        <div
          className="heatmap"
          role="table"
          aria-label={ariaLabel}
          style={cols.length <= 4
            ? { gridTemplateColumns: `minmax(76px, ${rowLabelW}px) repeat(${cols.length}, minmax(58px, ${cellW}px))`, minWidth: 0 }
            : { gridTemplateColumns: `${rowLabelW}px repeat(${cols.length}, ${cellW}px)` }}
          onMouseLeave={() => setHover(null)}
        >
          <div />
          {cols.map((c) => <div key={c} className={`hm-col ${rotateCols ? "rot" : ""}`} role="columnheader" style={rotateCols ? { height: 150 } : undefined}>{c}</div>)}
          {rows.map((r, ri) => (
            <div key={r} style={{ display: "contents" }} role="row">
              <div className="hm-row" role="rowheader">{r}</div>
              {cols.map((c, ci) => {
                const v = value(ri, ci);
                const t = scale(v);
                const bg = diverging ? divColor(t) : seqColor(t);
                const text = describe(r, c, v);
                return (
                  <div
                    key={c}
                    role="cell"
                    className="hm-cell"
                    title={text}
                    aria-label={text}
                    tabIndex={0}
                    onMouseEnter={() => setHover(text)}
                    onFocus={() => setHover(text)}
                    style={{ height: cellH, background: css(bg), color: lum(bg) < 0.55 ? "#fff" : "#1b2a21", fontSize: cellW < 50 ? 10.5 : 12.5 }}
                  >
                    {showValues ? format(v) : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="scale-bar" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {scaleLabels?.[0]}
          <span className="bar" style={{ background: diverging ? DIV_CSS : SEQ_CSS }} />
          {scaleLabels?.[1]}
        </span>
        <span style={{ color: "var(--ink-2)", fontWeight: 500, minHeight: 18 }} aria-live="polite">{hover ?? "Hover or focus a cell for details"}</span>
      </div>
    </div>
  );
}
