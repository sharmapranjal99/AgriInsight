import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Copy, Eraser, Rows3 } from "lucide-react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { BlockTitle, ChartCard, Kpi, Reveal, Seg, Tip } from "../components/ui";
import { fmt } from "../lib/format";

export default function Dataset() {
  const d = useData();
  const o = d.overview;
  const [view, setView] = useState<"sample" | "describe">("sample");
  const missing = Object.entries(d.cleaning.before).map(([k, v]) => ({ col: k, before: v, after: d.cleaning.after[k], pct: (v / o.rows) * 100 }));
  const head = d.sampleRowsNotebook;
  const desc = d.describeNotebook;
  // Indian-style thousands separators on the integer part only; decimals kept exactly as the notebook prints them
  const groupIN = (v: string) => { const m = /^(-?)(\d+)(\.\d+)?$/.exec(v); if (!m || m[2].length <= 3) return v; const i = m[2]; const head3 = i.slice(-3), rest = i.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ","); return `${m[1]}${rest},${head3}${m[3] ?? ""}`; };

  return (
    <PageShell
      lede={`The dataset has ${fmt(o.rows)} farm records and ${o.columns} variables. Before analysis it was checked for missing values, duplicates and implausible readings, and the few gaps were filled using group medians.`}
      question="Is the data reliable enough to support seasonal comparisons, and what had to be cleaned?"
    >
      <div className="grid-4">
        <Kpi icon={<Rows3 size={14} />} label="Rows × columns" value={`${fmt(o.rows)} × ${o.columns}`} note={`${o.categorical.length} categorical · ${o.numerical.length} numerical`} />
        <Kpi icon={<Eraser size={14} />} label="Missing values" value={fmt(o.totalMissing)} note={`In ${Object.keys(o.missing).length} columns only`} />
        <Kpi icon={<Copy size={14} />} label="Duplicate rows / IDs" value={`${o.duplicateRows} / ${o.duplicateIds}`} note="No duplicates found" />
        <Kpi icon={<CheckCircle2 size={14} />} label="Missing after cleaning" value={d.cleaning.remainingMissing} note="All 4,000 rows kept" color="var(--emerald-600)" />
      </div>

      <div className="grid-2">
        <ChartCard title="Missing values by column" subtitle="Count of empty cells before and after imputation." footnote="No column is more than 1.2% missing.">
          <div style={{ height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={missing} layout="vertical" margin={{ left: 10, right: 40, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="#ece8de" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="col" width={130} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(31,138,91,.06)" }} content={<Tip format={(v) => `${v} rows`} />} />
                <Bar dataKey="before" name="Before cleaning" fill="#d08a2e" radius={[0, 6, 6, 0]} barSize={18}>
                  <LabelList dataKey="before" position="right" fontSize={12} fill="#2c3d33" />
                </Bar>
                <Bar dataKey="after" name="After cleaning" fill="#1f8a5b" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Reveal className="card">
          <h3>Cleaning strategy</h3>
          <p className="card-sub">Each fill uses the grouping the variable differs by most</p>
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {missing.map((m) => (
              <div key={m.col} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span className="tag code">{m.col}</span>
                  <span className="num" style={{ fontSize: 13, color: "var(--muted)" }}>{m.before} → {m.after} missing ({m.pct.toFixed(1)}%)</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 14.5, fontWeight: 600 }}>{d.cleaning.strategy[m.col]}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            Rainfall and soil moisture differ strongly between seasons, so season medians keep the seasonal pattern intact. Mean yield differs up to about
            fifty-fold between crops (sugarcane vs pulses), so crop medians keep filled values on a realistic scale for that crop.
          </p>
        </Reveal>
      </div>

      <BlockTitle sub="Bounded variables were checked against their natural ranges.">Plausibility checks</BlockTitle>
      <Reveal className="table-wrap">
        <table className="data">
          <thead><tr><th>Check</th><th>Invalid rows</th><th>Result</th></tr></thead>
          <tbody>
            {d.plausibilityChecks.map((c) => (
              <tr key={c.check}><td>{c.check}</td><td>{c.invalid}</td><td style={{ color: c.invalid ? "var(--neg)" : "var(--emerald-600)", fontWeight: 600 }}>{c.invalid ? "Flagged" : "Pass"}</td></tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <BlockTitle sub="Switch between the first 5 raw records and the summary statistics for every numerical column (before cleaning).">Inspect the data</BlockTitle>
      <ChartCard
        title={view === "sample" ? "First 5 records (raw CSV)" : "Descriptive statistics (raw data)"}
        subtitle={view === "sample" ? "Scroll sideways to see all 28 columns." : "Counts below 4,000 show where values are missing."}
        controls={<Seg label="Table view" value={view} onChange={setView} options={[{ value: "sample", label: "Sample rows" }, { value: "describe", label: "Summary stats" }]} />}
      >
        <div className="table-wrap" style={{ maxHeight: 460 }}>
          {view === "sample" ? (
            <table className="data">
              <thead><tr>{head.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {head.rows.map((r, i) => (
                  <tr key={i}>{head.columns.map((c, j) => { const isNum = head.numeric.includes(c); return <td key={c} className={isNum ? "" : "l"}>{isNum ? groupIN(r[j]) : r[j]}</td>; })}</tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data">
              <thead><tr><th>Column</th>{desc.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {desc.rows.map((r) => {
                  const incomplete = parseFloat(r.values[0]) < o.rows;
                  return (
                    <tr key={r.column}>
                      <td>{r.column}</td>
                      {r.values.map((v, i) => <td key={i} style={i === 0 && incomplete ? { color: "var(--clay)", fontWeight: 700 } : undefined}>{v}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </ChartCard>

    </PageShell>
  );
}
