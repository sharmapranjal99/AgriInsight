import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { CropSeasonHeatmap } from "../components/CropSeasonHeatmap";
import { CorrelationHeatmap } from "../components/CorrelationHeatmap";
import { NotebookHistogram, type NotebookHistSpec } from "../components/NotebookHistogram";
import { NotebookCropBars, type CropBarsSpec } from "../components/NotebookCropBars";
import { BlockTitle, ChartCard, Kpi, Seg, Tip, Triad } from "../components/ui";
import { fmt, SEASONS } from "../lib/format";

type Dim = "season" | "crop" | "state";

// Colours used by the notebook's "Number of Farm Records per Season / Crop / State" figure (cell 20, In[12]; SEASON_PALETTE from cell 2).
const NB_RECORDS_COLORS = { season: { Kharif: "#2E7D32", Rabi: "#3D73AA", Zaid: "#D08A2E" }, crop: "#4E79A7", state: "#59A14F" } as const;
// Value-axis scales of that same figure, read back from matplotlib after re-running cell 20: limits are (0, max count × 1.05) from the
// default 5% autoscale margin (Season 1779, Crop 690, State 529), ticks are matplotlib's auto locator, labels are plain integers.
const NB_RECORDS_AXES = {
  season: { max: 1867.95, ticks: [0, 250, 500, 750, 1000, 1250, 1500, 1750], label: "Count" },
  crop: { max: 724.5, ticks: [0, 100, 200, 300, 400, 500, 600, 700], label: "" },
  state: { max: 555.45, ticks: [0, 100, 200, 300, 400, 500], label: "" },
} as const;
// On narrow cards, label every 2nd (or 3rd) notebook tick so the count labels never run into each other; gridlines and values are unchanged.
const recTickStep = (dim: keyof typeof NB_RECORDS_AXES, w: number) => {
  if (!w) return 0;
  const t = NB_RECORDS_AXES[dim].ticks, plotW = w - 8 - 48 - 120, labelW = String(t[t.length - 1]).length * 7.5 + 12;
  return Math.max(0, Math.ceil((t.length * labelW) / Math.max(plotW, 1)) - 1);
};
// Notebook yield histograms: cell [21] (all crops, bins=50) and cell [22] (Sugarcane excluded, bins=40), both on the cleaned df.
// Titles/labels as set in those cells; ticks are matplotlib's auto locator; edge width is what matplotlib drew (pt).
const NB_HIST: Record<"all" | "nosc", NotebookHistSpec> = {
  all: { title: "Overall Distribution of Yield (Tonnes/Ha) - All Crops Combined", xlabel: "Yield (Tonnes/Ha)", ylabel: "Count", ticksX: [0, 20, 40, 60, 80, 100], ticksY: [0, 500, 1000, 1500, 2000, 2500], edgeLwPt: 0.8116 },
  nosc: { title: "Distribution of Yield (Tonnes/Ha) - Excluding Sugarcane", xlabel: "Yield (Tonnes/Ha)", ylabel: "Count", ticksX: [1, 2, 3, 4, 5, 6], ticksY: [0, 50, 100, 150, 200, 250, 300], edgeLwPt: 1 },
};
// Notebook "Average Yield by Crop", cell [26] (In[36]): the two figures it draws, with the limits, ticks and labels that cell sets.
const NB_CROP_YIELD: Record<"log" | "linear", CropBarsSpec> = {
  log: { title: "Average Yield by Crop - Log Scale", scale: "log", xlim: [0.5, 100], ticks: [0.5, 1, 2, 5, 10, 20, 50, 100], tickLabels: ["0.5", "1", "2", "5", "10", "20", "50", "100"] },
  linear: { title: "Average Yield by Crop - Linear Scale", scale: "linear", xlim: [0, 50], ticks: [0, 10, 20, 30, 40, 50], tickLabels: ["0", "10", "20", "30", "40", "50"] },
};

export default function EDA() {
  const d = useData();
  const [dim, setDim] = useState<Dim>("season");
  const recRef = useRef<HTMLDivElement>(null);
  const [recW, setRecW] = useState(0);
  useEffect(() => { const el = recRef.current; if (!el) return; setRecW(el.clientWidth); const ro = new ResizeObserver(() => setRecW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  const [hist, setHist] = useState<"all" | "nosc">("all");
  const [scale, setScale] = useState<"linear" | "log">("log");

  const counts = useMemo(() => {
    if (dim === "season") return d.countsBySeason.map((c) => ({ k: c.season, v: c.count, fill: NB_RECORDS_COLORS.season[c.season] }));
    if (dim === "crop") return d.countsByCrop.map((c) => ({ k: c.crop, v: c.count, fill: NB_RECORDS_COLORS.crop }));
    return d.countsByState.map((c) => ({ k: c.state, v: c.count, fill: NB_RECORDS_COLORS.state }));
  }, [d, dim]);

  const yd = d.yieldDescribe;

  return (
    <PageShell
      lede="Before comparing seasons directly, EDA shows the overall shape of the data: how records are spread across seasons, crops and states, how yield is distributed, and how the main variables correlate."
      question="What does the dataset look like overall, and what must be controlled for before comparing seasons?"
    >
      <ChartCard
        title="How records are distributed"
        subtitle="Number of farm records in each category."
        controls={<Seg label="Dimension" value={dim} onChange={setDim} options={[{ value: "season", label: "Season" }, { value: "crop", label: "Crop" }, { value: "state", label: "State" }]} />}
        footnote={dim === "season" ? "Zaid has far fewer records (594) than Kharif or Rabi." : dim === "crop" ? "Rice and Wheat are the most frequent crops." : "States are fairly balanced (484–529 records each)."}
      >
        <div ref={recRef} style={{ height: dim === "season" ? 260 : 320 }}>
          <ResponsiveContainer>
            <BarChart data={counts} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#ece8de" />
              <XAxis type="number" tickLine={false} axisLine={false} domain={[0, NB_RECORDS_AXES[dim].max]} ticks={[...NB_RECORDS_AXES[dim].ticks]} interval={recTickStep(dim, recW)} allowDecimals={false} tickFormatter={(v: number) => String(v)}
                height={NB_RECORDS_AXES[dim].label ? 44 : 30} label={NB_RECORDS_AXES[dim].label ? { value: NB_RECORDS_AXES[dim].label, position: "insideBottom", offset: 0, fontSize: 12, fill: "#5b6b61" } : undefined} />
              <YAxis type="category" dataKey="k" width={120} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(31,138,91,.06)" }} content={<Tip format={(v) => v.toLocaleString("en-US")} />} />
              <Bar dataKey="v" name="Records" radius={[0, 6, 6, 0]} barSize={dim === "season" ? 34 : 22} animationDuration={600}>
                {counts.map((c) => <Cell key={c.k} fill={c.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Crop composition by season" subtitle="Record count for each crop × season pair. The crop mix is not identical across seasons.">
        <CropSeasonHeatmap rows={d.cropSeasonCounts.map((r) => r.crop)} cols={[...SEASONS]} values={d.cropSeasonCounts.map((r) => SEASONS.map((s) => r[s]))} />
      </ChartCard>

      <div className="grid-4">
        <Kpi label="Mean yield (all crops)" value={`${fmt(yd.mean, 2)} t/ha`} />
        <Kpi label="Median yield" value={`${fmt(yd["50%"], 2)} t/ha`} note="Much lower than the mean, so the distribution is right-skewed" />
        <Kpi label="Std deviation" value={`${fmt(yd.std, 2)} t/ha`} />
        <Kpi label="Range" value={`${fmt(yd.min, 2)}–${fmt(yd.max, 2)} t/ha`} note="t/ha after cleaning" />
      </div>

      <div className="grid-2">
        <ChartCard
          title="Distribution of yield"
          subtitle={hist === "all" ? "All crops combined, 50 equal-width bins (t/ha)." : "Sugarcane excluded, 40 bins (t/ha)."}
          controls={<Seg label="Histogram filter" value={hist} onChange={setHist} options={[{ value: "all", label: "All crops" }, { value: "nosc", label: "Excl. sugarcane" }]} />}
          footnote="Hover a bar to see its bin range."
        >
          <NotebookHistogram height={280} bins={hist === "all" ? d.yieldHistogram : d.yieldHistogramNoSugarcane} spec={NB_HIST[hist]} />
        </ChartCard>

        <ChartCard
          title="Average yield by crop"
          subtitle="Mean t/ha per crop. A log scale makes the smaller crops readable alongside sugarcane."
          controls={<Seg label="Axis scale" value={scale} onChange={setScale} options={[{ value: "log", label: "Log" }, { value: "linear", label: "Linear" }]} />}
          footnote="Sugarcane (46.95 t/ha) is about 50× pulses (0.92 t/ha)."
        >
          <NotebookCropBars height={280} data={d.yieldByCrop} spec={NB_CROP_YIELD[scale]} />
        </ChartCard>
      </div>

      <Triad
        obs="Kharif and Rabi have similar numbers of records, while Zaid has far fewer. Rice and Wheat are the most common crops. Overall yield is strongly right-skewed, with a long tail well past 20 t/ha."
        int="The skew isn't a data-quality problem. Crops work on very different yield scales, and sugarcane alone produces the long tail. Excluding it gives a much tighter distribution."
        ins="Crop mix differs between seasons, so a raw comparison of yield across seasons partly reflects which crops each season grows. That is why later seasonal comparisons control for crop."
      />

      <BlockTitle sub="Pearson correlations among 15 key numerical variables. Hover a cell for the coefficient to 3 decimals.">Correlation structure</BlockTitle>
      <ChartCard title="Correlation matrix: key numerical variables" subtitle="Red is positive, blue is negative. Most pairs are close to zero.">
        <CorrelationHeatmap />
      </ChartCard>
      <Triad
        obs="Most numerical variables show weak linear relationships, while a few pairs display clearer positive or negative patterns. Overall, the correlation matrix highlights that relationships differ across environmental and resource factors."
        int="No single environmental or resource variable explains agricultural performance on its own. Yield and profitability are influenced by multiple interacting factors, and correlation indicates association rather than cause and effect."
        ins="Agricultural decisions should consider weather conditions, soil characteristics, water availability and farm management together. Understanding these combined factors provides a more balanced approach to improving farm performance."
      />
    </PageShell>
  );
}
