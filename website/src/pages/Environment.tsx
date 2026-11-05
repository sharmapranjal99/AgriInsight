import { useState } from "react";
import { CloudRain, Droplet, Gauge, Bug, Sun, Thermometer, Waves } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { ENV_COLS, NotebookEnvBars, type EnvCol } from "../components/NotebookEnvBars";
import { NotebookEnvCorr } from "../components/NotebookEnvCorr";
import { BlockTitle, ChartCard, Reveal, Seg, Triad } from "../components/ui";
import { fmt, SEASON_COLOR, SEASONS } from "../lib/format";

const VARS = [
  { col: "Rainfall_mm", label: "Rainfall", unit: "mm", icon: CloudRain, d: 2 },
  { col: "Avg_Temperature_C", label: "Avg temperature", unit: "°C", icon: Thermometer, d: 2 },
  { col: "Humidity_pct", label: "Humidity", unit: "%", icon: Droplet, d: 2 },
  { col: "Soil_Moisture_pct", label: "Soil moisture", unit: "%", icon: Waves, d: 2 },
  { col: "Soil_pH", label: "Soil pH", unit: "", icon: Gauge, d: 2 },
  { col: "Sunlight_Hours_Day", label: "Sunlight", unit: "h/day", icon: Sun, d: 2 },
  { col: "Disease_Pest_Risk_pct", label: "Disease / pest risk", unit: "%", icon: Bug, d: 2 },
] as const;

// Seasonal mean of each environmental variable (Kharif, Rabi, Zaid): the authoritative values for the profile cards
// (identical to the notebook's env_by_season table, which rounds the means to 2 dp).
const ENV_SEASONAL: Record<(typeof VARS)[number]["col"], Record<"Kharif" | "Rabi" | "Zaid", number>> = {
  Rainfall_mm: { Kharif: 852.11, Rabi: 435.94, Zaid: 299.12 },
  Avg_Temperature_C: { Kharif: 28.45, Rabi: 23.49, Zaid: 31.04 },
  Humidity_pct: { Kharif: 71.81, Rabi: 57.89, Zaid: 52.01 },
  Soil_Moisture_pct: { Kharif: 31.2, Rabi: 24.05, Zaid: 19.17 },
  Soil_pH: { Kharif: 6.73, Rabi: 6.67, Zaid: 6.69 },
  Sunlight_Hours_Day: { Kharif: 6.79, Rabi: 7.59, Zaid: 8.18 },
  Disease_Pest_Risk_pct: { Kharif: 54.47, Rabi: 40.48, Zaid: 38.22 },
};

export default function Environment() {
  const [envCol, setEnvCol] = useState<EnvCol>("Rainfall_mm");

  return (
    <PageShell
      lede="The dataset records rainfall, temperature, humidity, sunlight, soil pH, soil moisture and disease/pest risk for every farm. This section compares their seasonal averages and checks how strongly each one relates to yield."
      question="How do environmental conditions vary across seasons, and how are they associated with agricultural performance?"
    >
      <BlockTitle sub="Mean value per season. Bars are scaled to the highest season for each variable. The badge shows how much higher the highest season's mean is than the lowest's.">Seasonal environmental profile</BlockTitle>
      <div className="small-multiples">
        {VARS.map((v, i) => {
          const Icon = v.icon;
          const row = ENV_SEASONAL[v.col];
          const vals = SEASONS.map((s) => row[s]);
          const max = Math.max(...vals), min = Math.min(...vals);
          const spread = ((max - min) / min) * 100;                 // highest season vs lowest season, from the values above
          return (
            <Reveal key={v.col} delay={(i % 3) * 0.05} className="sm-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={16} style={{ color: "var(--emerald-600)" }} />
                <h4>{v.label}</h4>
                <span className="sm-u" style={{ marginLeft: "auto" }}>{spread >= 1 ? `highest season +${fmt(spread, 1)}% vs lowest` : "seasons differ by < 1%"}</span>
              </div>
              <div className="mini-bars">
                {SEASONS.map((s) => (
                  <div className="mini-bar-row" key={s}>
                    <span style={{ fontWeight: 600, color: SEASON_COLOR[s] }}>{s}</span>
                    <div className="track"><div className="fill" style={{ width: `${(row[s] / max) * 100}%`, background: SEASON_COLOR[s] }} /></div>
                    <span className="val">{fmt(row[s], v.d)}{v.unit && <small style={{ color: "var(--muted)", fontWeight: 500 }}> {v.unit}</small>}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>

      <ChartCard
        title="Seasonal means by environmental variable"
        controls={<Seg label="Environmental variable" value={envCol} onChange={setEnvCol} options={ENV_COLS.map((c) => ({ value: c, label: c }))} />}
      >
        <NotebookEnvBars col={envCol} height={340} />
      </ChartCard>

      <Triad
        obs="Environmental conditions follow different seasonal patterns. Rainfall, humidity and soil moisture decline across seasons, while temperature and sunlight increase toward Zaid. Soil pH remains relatively stable."
        int="The seasonal profile reflects a shift from wetter Kharif conditions toward hotter and drier Zaid conditions, with Rabi showing the coolest average temperature. These are descriptive patterns and do not establish cause-and-effect relationships."
        ins="Kharif combines the strongest average yield performance with the highest recorded disease/pest-risk score. This highlights the importance of considering productivity and risk together; the risk score is an indicator, not a measure of actual crop loss."
      />

      <BlockTitle sub="Pearson correlation between each environmental variable and raw yield (tonnes per hectare) across all 4,000 farm records.">Association with yield</BlockTitle>
      <ChartCard title="Correlation of Environmental Variables with Yield (Tonnes/Ha)">
        <NotebookEnvCorr height={320} />
      </ChartCard>

      <Triad
        obs="All environmental variables show very weak linear correlations with raw yield. Rainfall has the strongest positive association, while soil pH has the strongest negative association."
        int="The correlations suggest that no individual environmental variable has a strong linear relationship with raw yield in the overall dataset. These results describe associations and do not establish cause and effect."
        ins="Farm productivity should be understood through multiple factors, including crop selection, seasonal conditions and resource management. Environmental variables should not be treated as standalone predictors of yield based on these correlations alone."
      />
    </PageShell>
  );
}
