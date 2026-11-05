import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CloudRain, Coins, Droplets, FlaskConical, MapPin, Sprout, Sun, Tag, Thermometer, Wheat } from "lucide-react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { BlockTitle, ChartCard, Kpi, Reveal, SeasonLegend, Tip } from "../components/ui";
import { fmt, SEASON_COLOR, SEASON_DESC, SEASONS } from "../lib/format";

const GROUPS = [
  { name: "Agricultural / output", icon: Wheat, cols: ["Farm_Area_Hectares", "Yield_Tonnes_Ha", "Production_Tonnes", "Seed_Quality_Score"] },
  { name: "Environmental", icon: CloudRain, cols: ["Rainfall_mm", "Avg_Temperature_C", "Humidity_pct", "Sunlight_Hours_Day", "Soil_pH", "Soil_Moisture_pct", "Disease_Pest_Risk_pct"] },
  { name: "Soil nutrients", icon: FlaskConical, cols: ["Nitrogen_kg_ha", "Phosphorus_kg_ha", "Potassium_kg_ha"] },
  { name: "Resource usage", icon: Droplets, cols: ["Fertilizer_kg_ha", "Pesticide_Litre_ha", "Water_Used_m3", "Water_Efficiency_t_per_1000m3", "Irrigation_Method"] },
  { name: "Economic", icon: Coins, cols: ["Market_Price_INR_Tonne", "Total_Cost_INR", "Revenue_INR", "Profit_INR"] },
  { name: "Identifiers / categories", icon: Tag, cols: ["Farm_ID", "State", "District", "Crop", "Season"] },
];

const SEASON_TEXT: Record<string, { icon: typeof Sun; text: string }> = {
  Kharif: { icon: CloudRain, text: "Sown with the monsoon. In this dataset it has the highest rainfall, humidity and soil moisture." },
  Rabi: { icon: Thermometer, text: "Sown in winter. In this dataset it has the lowest average temperature and moderate rainfall." },
  Zaid: { icon: Sun, text: "A short summer window. In this dataset it has the hottest, driest conditions and the fewest records." },
};

export default function Overview() {
  const d = useData();
  const o = d.overview;
  const env = Object.fromEntries(d.environmentBySeason.map((e) => [e.season, e]));
  const pie = d.countsBySeason.map((c) => ({ name: c.season, value: c.count, fill: SEASON_COLOR[c.season] }));

  return (
    <PageShell lede="This project uses a farm-level agricultural dataset to study how yield, production, resource use and profitability differ between India's three cropping seasons. It follows a standard analytics workflow from exploration to hypothesis testing.">
      <div className="grid-4">
        <Kpi icon={<Sprout size={14} />} label="Farm records" value={fmt(o.rows)} note={`One row per farm (${fmt(o.rows)} unique Farm IDs)`} />
        <Kpi icon={<MapPin size={14} />} label="States / districts" value={`${o.states.length} / ${o.districts.length}`} note={o.states.join(", ")} />
        <Kpi icon={<Wheat size={14} />} label="Crops" value={o.crops.length} note={o.crops.join(", ")} />
        <Kpi icon={<Droplets size={14} />} label="Irrigation methods" value={o.irrigation.length} note={o.irrigation.join(", ")} />
      </div>

      <BlockTitle sub="The analysis is built around the three seasons present in the data. The season definitions (monsoon, winter, summer sowing) are standard agronomic context, not results from this dataset. The figures under each one are dataset results.">The three cropping seasons</BlockTitle>
      <div className="grid-2">
        <div className="season-trio" style={{ gridTemplateColumns: "1fr" }}>
          {SEASONS.map((s, i) => {
            const Icon = SEASON_TEXT[s].icon;
            return (
              <Reveal key={s} delay={i * 0.06} className="card" >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: `${SEASON_COLOR[s]}1a`, color: SEASON_COLOR[s], flexShrink: 0 }}><Icon size={20} /></span>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>{s} <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>· {SEASON_DESC[s]}</span></h3>
                    <p style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>{SEASON_TEXT[s].text}</p>
                    <p className="num" style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                      Rainfall {fmt(env[s].Rainfall_mm, 2)} mm · Temp {fmt(env[s].Avg_Temperature_C, 2)} °C · Humidity {fmt(env[s].Humidity_pct, 2)}%
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <ChartCard title="Records per season" subtitle="Share of the 4,000 farm records in each season." footnote="Zaid has noticeably fewer records. Totals may vary due to rounding.">
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
                  {pie.map((p) => <Cell key={p.name} fill={p.fill} />)}
                </Pie>
                <Tooltip content={<Tip format={(v) => `${fmt(v)} records (${fmt(d.countsBySeason.find((c) => c.count === v)!.sharePct, 1)}%)`} title={() => "Records"} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}><SeasonLegend /></div>
          <div className="grid-3" style={{ marginTop: 16, gap: 10 }}>
            {d.countsBySeason.map((c) => (
              <div key={c.season} style={{ textAlign: "center" }}>
                <div className="num" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: SEASON_COLOR[c.season] }}>{fmt(c.count)}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.season} · {fmt(c.sharePct, 1)}%</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <BlockTitle sub="The notebook sorts the 28 columns into six groups. Each analysis section uses one or more of them.">Variable groups</BlockTitle>
      <div className="grid-3">
        {GROUPS.map((g, i) => {
          const Icon = g.icon;
          return (
            <Reveal key={g.name} delay={i * 0.04} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="pc-icon" style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--emerald-50)", color: "var(--emerald-600)" }}><Icon size={17} /></span>
                <h3>{g.name}</h3>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{g.cols.length}</span>
              </div>
              <div className="tags" style={{ marginTop: 14 }}>{g.cols.map((c) => <span key={c} className="tag code">{c}</span>)}</div>
            </Reveal>
          );
        })}
      </div>

      <BlockTitle>Tools used in the analysis</BlockTitle>
      <Reveal className="card">
        <div className="tags" style={{ marginTop: 0 }}>
          {["Python", "Jupyter Notebook", "pandas", "NumPy", "Matplotlib", "seaborn", "SciPy (stats)"].map((t) => <span key={t} className="tag code" style={{ fontSize: 13, padding: "5px 12px" }}>{t}</span>)}
        </div>
      </Reveal>
    </PageShell>
  );
}
