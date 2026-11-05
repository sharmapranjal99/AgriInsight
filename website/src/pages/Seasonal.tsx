import { useState } from "react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { SeasonBoxplot, SeasonMeanMedianBars, type SeasonMetric } from "../components/NotebookSeasonal";
import { RelativeYieldHeatmap } from "../components/RelativeYieldHeatmap";
import { BlockTitle, ChartCard, Kpi, Note, Reveal, Seg, Triad } from "../components/ui";
import { fmt, SEASON_COLOR, SEASONS } from "../lib/format";

type Metric = "yield" | "production" | "waterEff";
const META: Record<Metric, { label: string; unit: string; col: string; d: number }> = {
  yield: { label: "Yield", unit: "t/ha", col: "Yield_Tonnes_Ha", d: 2 },
  production: { label: "Production", unit: "tonnes", col: "Production_Tonnes", d: 2 },
  waterEff: { label: "Water efficiency", unit: "t / 1000 m³", col: "Water_Efficiency_t_per_1000m3", d: 2 },
};

// Units as written in the notebook's y-axis labels (cell [32]), used in the chart tooltips.
const NB_UNIT: Record<SeasonMetric, string> = { yield: "Tonnes/Ha", production: "Tonnes", waterEff: "t / 1000 m³" };

export default function Seasonal() {
  const d = useData();
  const [m, setM] = useState<Metric>("yield");
  const meta = META[m];
  const perf = d.seasonalPerformance;
  const K = perf[0], Z = perf[2];
  const crops = d.cropSeasonYield;
  const cmp = d.comparisons;

  return (
    <PageShell
      lede="This is the central section of the project. It compares yield, production and water-use efficiency across Kharif, Rabi and Zaid using descriptive statistics, distributions and a crop-normalised view."
      question="How does agricultural performance vary across seasons?"
    >
      <div className="grid-3">
        {perf.map((p, i) => (
          <Reveal key={p.season} delay={i * 0.06} className="card" >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: SEASON_COLOR[p.season] }}>{p.season}</h3>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>n = {fmt(p.count)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
              {(["yield", "production", "waterEff"] as Metric[]).map((k) => (
                <div key={k}>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>{META[k].label}</div>
                  <div className="num" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{fmt(p[k].mean, 2)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>mean · {META[k].unit}</div>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <ChartCard
        title={`${meta.label} by season`}
        subtitle={`Mean and median ${meta.label.toLowerCase()} (${meta.unit}) on the left; the full distribution on the right.`}
        controls={<Seg label="Metric" value={m} onChange={setM} options={[{ value: "yield", label: "Yield" }, { value: "production", label: "Production" }, { value: "waterEff", label: "Water efficiency" }]} />}
        footnote="Means sit well above medians because a few high-output farms (mostly sugarcane) pull the average up."
      >
        <div className="grid-2" style={{ gap: 24 }}>
          <SeasonMeanMedianBars metric={m} height={300} unit={NB_UNIT[m]} />
          <SeasonBoxplot metric={m} height={300} unit={NB_UNIT[m]} />
        </div>
      </ChartCard>

      <Reveal className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>Season</th><th>Records</th>{(["yield", "production", "waterEff"] as Metric[]).flatMap((k) => [<th key={k + "m"}>{META[k].label} mean</th>, <th key={k + "md"}>median</th>, <th key={k + "s"}>std</th>])}</tr>
          </thead>
          <tbody>
            {perf.map((p) => (
              <tr key={p.season}>
                <td style={{ fontWeight: 600, color: SEASON_COLOR[p.season] }}>{p.season}</td>
                <td>{fmt(p.count)}</td>
                {(["yield", "production", "waterEff"] as Metric[]).flatMap((k) => [<td key={k + "m"} style={{ fontWeight: 600 }}>{fmt(p[k].mean, 2)}</td>, <td key={k + "md"}>{fmt(p[k].median, 2)}</td>, <td key={k + "s"}>{fmt(p[k].std, 2)}</td>])}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <div className="grid-3">
        <Kpi label="Mean yield, Kharif vs Zaid" value={`+${fmt(cmp.yieldMeanGapPct, 1)}%`} note={`${fmt(K.yield.mean, 2)} vs ${fmt(Z.yield.mean, 2)} t/ha (raw yield, all crops)`} color={SEASON_COLOR.Kharif} />
        <Kpi label="Median yield, Kharif vs Zaid" value={`+${fmt(cmp.yieldMedianGapPct, 1)}%`} note={`${fmt(K.yield.median, 2)} vs ${fmt(Z.yield.median, 2)} t/ha (raw yield, all crops)`} color={SEASON_COLOR.Kharif} />
        <Kpi label="Water efficiency, Kharif vs Zaid" value={`+${fmt(cmp.waterEffGapPct, 1)}%`} note={`${fmt(K.waterEff.mean, 2)} vs ${fmt(Z.waterEff.mean, 2)} t/1000 m³`} color={SEASON_COLOR.Kharif} />
      </div>
      <Note kind="info" title="Crop composition affects raw comparisons.">
        Raw means mix crops on very different yield scales, and each season grows a different mix.
        The crop-adjusted comparison on the Statistical Findings page is the reliable test of the seasonal difference.
      </Note>

      <Triad
        obs="Kharif has the highest mean yield, production and water efficiency, Rabi comes second, and Zaid is lowest on all three. Levene's test on crop-adjusted yield indicates unequal variances."
        int="The order Kharif > Rabi > Zaid holds for yield, production and water efficiency alike, so the difference is not confined to one metric."
        ins="In this dataset, the season with the most rainfall (Kharif) also has the highest performance, and the driest season (Zaid) the lowest. That pattern is consistent with water availability playing a role, but this observational data cannot show that rainfall causes the difference."
      />

      <BlockTitle sub="Each crop's mean yield is divided by its own best season, so crops on very different scales (sugarcane vs pulses) can be compared directly. 1.00 = that crop's best season.">Relative seasonal yield by crop</BlockTitle>
      <div className="grid-2">
        <ChartCard title="Crop-normalised yield heatmap" subtitle="Hover a cell to see the actual mean yield.">
          <RelativeYieldHeatmap height={372} describe={(r, c, mean, v) => `${r} · ${c}: ${fmt(mean, 2)} t/ha (${(v * 100).toFixed(0)}% of best season)`} />
        </ChartCard>
        <ChartCard title="Mean yield by crop and season" subtitle="Actual t/ha values behind the heatmap.">
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Crop</th>{SEASONS.map((s) => <th key={s} style={{ color: SEASON_COLOR[s] }}>{s}</th>)}<th>Best</th></tr></thead>
              <tbody>
                {crops.map((c) => (
                  <tr key={c.crop}>
                    <td style={{ fontWeight: 600 }}>{c.crop}</td>
                    {SEASONS.map((s) => <td key={s} style={{ fontWeight: c.best === s ? 700 : 400 }}>{fmt(c[s], 2)}</td>)}
                    <td style={{ color: SEASON_COLOR[c.best], fontWeight: 600 }}>{c.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </PageShell>
  );
}
