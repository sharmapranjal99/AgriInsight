import { Droplets, FlaskConical, Gauge, ShieldCheck, Sprout } from "lucide-react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { NotebookWaterUsed } from "../components/NotebookWaterUsed";
import { NotebookWaterEffBox } from "../components/NotebookWaterEffBox";
import { NotebookIrrigationMix } from "../components/NotebookIrrigationMix";
import { NotebookFertPest } from "../components/NotebookFertPest";
import { NotebookCropIntensity } from "../components/NotebookCropIntensity";
import { NotebookIrrigationEff } from "../components/NotebookIrrigationEff";
import { BlockTitle, ChartCard, Kpi, Triad } from "../components/ui";
import { fmt, SEASON_COLOR } from "../lib/format";

export default function Resources() {
  const d = useData();
  const r = Object.fromEntries(d.resourcesBySeason.map((x) => [x.season, x]));

  return (
    <PageShell
      lede="The dataset records water used, water-use efficiency, fertilizer, pesticide, seed quality and irrigation method. This section asks whether some seasons use resources more heavily, or less efficiently, than others."
      question="How does resource utilisation vary across seasons, and how is it associated with performance?"
    >
      <div className="grid-4">
        <Kpi icon={<Droplets size={14} />} label="Highest water use" value="Zaid" note={`${fmt(r.Zaid.Water_Used_m3, 2)} m³ mean per farm`} color={SEASON_COLOR.Zaid} />
        <Kpi icon={<Gauge size={14} />} label="Lowest water efficiency" value="Zaid" note={`${r.Zaid.Water_Efficiency_t_per_1000m3} t/1000 m³ vs ${r.Kharif.Water_Efficiency_t_per_1000m3} in Kharif`} color={SEASON_COLOR.Zaid} />
        <Kpi icon={<FlaskConical size={14} />} label="Fertilizer range" value={`${fmt(r.Zaid.Fertilizer_kg_ha, 1)}–${fmt(r.Kharif.Fertilizer_kg_ha, 1)}`} note="kg/ha across seasons, nearly flat" />
        <Kpi icon={<Sprout size={14} />} label="Seed quality" value={`${r.Kharif.Seed_Quality_Score}–${r.Rabi.Seed_Quality_Score}`} note="Score, the same in every season" />
      </div>

      <div className="grid-2">
        <ChartCard title="Mean Water Used (m3) by Season">
          <NotebookWaterUsed height={300} />
        </ChartCard>
        <ChartCard title="Water Efficiency (t / 1000 m3) by Season">
          <NotebookWaterEffBox height={300} />
        </ChartCard>
      </div>

      <ChartCard title="Irrigation Method Mix by Season (%)">
        <NotebookIrrigationMix height={300} />
      </ChartCard>

      <Triad
        obs="Zaid has the highest mean water use and the lowest water efficiency, while Rabi has the lowest mean water use and Kharif the highest water efficiency. The share of farms using each irrigation method is broadly similar in all three seasons."
        int="Higher average water use does not correspond to higher water efficiency across seasons. Because the irrigation-method mix differs little between seasons, differences in irrigation method alone are unlikely to explain this gap. These plots do not establish what causes it."
        ins="Water management in Zaid stands out as an area worth examining, since that season combines high water use with low efficiency. Changes to irrigation practices or crop choices would need to be tested on farms, because these descriptive plots cannot establish which measures would improve efficiency."
      />

      <BlockTitle sub="Chemical inputs and seed quality per season.">Fertilizer and pesticide</BlockTitle>
      <div className="grid-2">
        <ChartCard title="Fertilizer and Pesticide Use Across Seasons">
          <NotebookFertPest height={280} />
        </ChartCard>
        <ChartCard title="Fertilizer and Pesticide Intensity by Crop">
          <NotebookCropIntensity height={330} />
        </ChartCard>
      </div>

      <ChartCard title="Water Use and Efficiency by Irrigation Method">
        <NotebookIrrigationEff height={320} />
      </ChartCard>
      <div className="note info" style={{ display: "flex", gap: 14 }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          Across all seasons, rainfed farms record the lowest water use ({fmt(d.irrigationEfficiency.find((x) => x.method === "Rainfed")!.water)} m³) and flood-irrigated farms the highest
          ({fmt(d.irrigationEfficiency.find((x) => x.method === "Flood")!.water)} m³), with the lowest efficiency ({d.irrigationEfficiency.find((x) => x.method === "Flood")!.eff}). This supports the
          recommendation to adopt drip or sprinkler irrigation, but it is a descriptive comparison, not a controlled one.
        </div>
      </div>
    </PageShell>
  );
}
