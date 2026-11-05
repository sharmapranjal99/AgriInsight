import { useState } from "react";
import { IndianRupee, TrendingDown, TrendingUp } from "lucide-react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { BlockTitle, ChartCard, Kpi, Seg, Triad } from "../components/ui";
import { NotebookMeanProfit, NotebookRevenueCost } from "../components/NotebookEconBars";
import { NotebookProfitBox } from "../components/NotebookProfitBox";
import { NotebookProfitHeatmap } from "../components/NotebookProfitHeatmap";
import { NotebookFinancialComparison } from "../components/NotebookFinancialComparison";
import { fmt, inr, NEG, SEASON_COLOR, SEASONS } from "../lib/format";

// Summary-card amounts as in the notebook's seasonal table (cell [50], whole rupees): standard thousands grouping, no K/L abbreviation.
const inrExact = (v: number) => `${v < 0 ? "−" : ""}₹${Math.round(Math.abs(v)).toLocaleString("en-US")}`;

export default function Economics() {
  const d = useData();
  const [view, setView] = useState<"state" | "crop">("state");
  const [rank, setRank] = useState<"state" | "crop">("crop");
  const e = d.economicsBySeason;
  const E = Object.fromEntries(e.map((x) => [x.season, x]));
  const sum = view === "state" ? d.stateSummary : d.cropSummary;

  return (
    <PageShell
      lede="This section compares market price, revenue, cost and profit across the three seasons, then checks whether the seasonal profit pattern holds within each state and each crop."
      question="How do economic outcomes vary across seasons, and are the patterns consistent across regions and crops?"
    >
      <div className="grid-4">
        {SEASONS.map((s) => (
          <Kpi key={s} icon={E[s].Profit_INR >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} label={`Mean profit · ${s}`} value={inrExact(E[s].Profit_INR)} color={E[s].Profit_INR >= 0 ? SEASON_COLOR[s] : NEG} note={`Median ${inr(E[s].medianProfit)} · ${E[s].lossPct}% of farms lose money`} />
        ))}
        <Kpi icon={<IndianRupee size={14} />} label="Market price range" value={`${inrExact(Math.min(...SEASONS.map((x) => E[x].Market_Price_INR_Tonne)))}–${inrExact(Math.max(...SEASONS.map((x) => E[x].Market_Price_INR_Tonne)))}`} note={`Mean ₹/tonne. Highest season is only ${fmt(d.comparisons.priceSpreadPct, 2)}% above the lowest`} />
      </div>

      <div className="grid-2">
        <ChartCard title="Mean Revenue vs. Cost by Season">
          <NotebookRevenueCost height={300} />
        </ChartCard>
        <ChartCard title="Mean Profit by Season">
          <NotebookMeanProfit height={300} />
        </ChartCard>
      </div>

      <ChartCard title="Profit Distribution by Season">
        <NotebookProfitBox height={320} />
      </ChartCard>

      <Triad
        obs="Mean revenue falls from Kharif to Rabi to Zaid, while mean cost stays in a narrow band and is highest in Zaid, where it exceeds mean revenue. Mean profit is positive for Kharif (₹178,915) and Rabi (₹87,689) but negative for Zaid (−₹24,805). In the boxplot, the median profit is above break-even only for Kharif; it is just below zero for Rabi and clearly below zero for Zaid, whose box sits lowest of the three."
        int="Mean market price is nearly the same in every season (₹44,212–₹44,851 per tonne), so the seasonal profit gap is not a price difference. It comes from revenue declining while cost does not decline with it. Because the medians follow the same Kharif > Rabi > Zaid order as the means, the pattern is not produced only by a few extreme farms."
        ins="Every season's profit box spans both gains and losses, so the season alone does not decide whether a farm is profitable. Loss-making outcomes are most concentrated in Zaid, and since price is nearly constant, assessing a season's profitability depends on weighing its cost against its revenue rather than on market price."
      />

      <BlockTitle sub="Does Kharif > Rabi > Zaid hold inside each state and each crop, or is it driven by a few large groups?">Regional and crop consistency</BlockTitle>
      <ChartCard
        title={view === "state" ? "Mean Profit (INR) by State and Season" : "Mean Profit (INR) by Crop and Season"}
        controls={<Seg label="Breakdown" value={view} onChange={setView} options={[{ value: "state", label: "By state" }, { value: "crop", label: "By crop" }]} />}
        footnote={<span><b style={{ color: "var(--ink)" }}>Kharif most profitable in {sum.kharifBest} of {sum.n}</b> {view === "state" ? "states" : "crops"} · <b style={{ color: "var(--ink)" }}>Zaid least profitable in {sum.zaidWorst} of {sum.n}</b></span>}
      >
        <NotebookProfitHeatmap kind={view} height={380} />
      </ChartCard>
      <Triad
        obs={`Kharif is the most profitable season in ${d.stateSummary.kharifBest} of ${d.stateSummary.n} states (Punjab is the exception, with Rabi slightly ahead), and Zaid is the least profitable in all ${d.stateSummary.n}. By crop, the order Kharif > Rabi > Zaid holds for all ${d.cropSummary.n} crops.`}
        int="A pattern this consistent across states and crops points to a general seasonal effect, not something produced by one or two large groups dominating the averages."
        ins="Caution around Zaid profitability can reasonably be applied across states. The crop view adds that some crops (wheat, rice, maize) lose money on average in every season, while sugarcane and chilli stay profitable even in Zaid."
      />

      <ChartCard
        title={rank === "crop" ? "Mean Revenue, Cost and Profit by Crop" : "Mean Revenue, Cost and Profit by State"}
        subtitle="All seasons combined, sorted by mean profit."
        controls={<Seg label="Ranking" value={rank} onChange={setRank} options={[{ value: "crop", label: "By crop" }, { value: "state", label: "By state" }]} />}
      >
        <NotebookFinancialComparison kind={rank} height={360} />
      </ChartCard>
    </PageShell>
  );
}
