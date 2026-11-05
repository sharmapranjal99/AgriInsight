import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarRange, CloudSun, Droplets, FlaskConical, IndianRupee, ListChecks, MapPin } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Reveal } from "../components/ui";

// The notebook's "## 15. Conclusion" cell, word for word: the opening paragraph is the page intro, each "**Heading:** text" paragraph is one
// card (heading + text), and the closing "Overall, ..." sentence is the band at the end.
const INTRO = "This project analyzed the supplied farm-level agricultural dataset of 4,000 records, covering three cropping seasons (Kharif, Rabi and Zaid), eight states and eight crops, to investigate how agricultural performance differs across seasons. The analysis followed a structured workflow of dataset exploration, data cleaning, exploratory data analysis, seasonal, environmental, resource, economic and regional/crop analysis, and hypothesis testing. Missing values in Rainfall_mm, Soil_Moisture_pct and Yield_Tonnes_Ha were imputed using season-group and crop-group medians, and no rows or columns were removed.";
const SECTIONS = [
  { icon: CalendarRange, t: "Seasonal performance", d: "Kharif showed the highest mean yield, production and water efficiency among the three seasons, followed by Rabi, with Zaid the lowest on all three measures." },
  { icon: FlaskConical, t: "Statistical analysis", d: "Because crop mix is not identical across seasons, the seasonal yield difference was tested on crop-standardized yield (Yield_Z) at a significance level of α = 0.05. The Shapiro-Wilk test showed that the normality assumption was not satisfied, so the Kruskal-Wallis test was used as the primary test, with the one-way ANOVA reported for reference. Both produced p-values far below 0.05, and the null hypothesis was rejected: there is a statistically significant difference in crop-adjusted yield performance across the three seasons in this dataset. This test does not, on its own, prove which specific environmental or resource mechanism causes the difference." },
  { icon: CloudSun, t: "Environmental conditions", d: "Rainfall dropped sharply from Kharif to Rabi to Zaid, with humidity and soil moisture following the same declining pattern. Average temperature was lowest in Rabi and highest in Zaid, and disease/pest risk was highest in Kharif and lowest in Zaid. The correlations between the environmental variables and raw yield were modest in magnitude, and they are associations rather than proof of causation." },
  { icon: Droplets, t: "Resource usage", d: "Zaid used the most water on average but achieved the lowest water efficiency, while Kharif used somewhat less water yet achieved the highest efficiency. The mix of irrigation methods was very similar across all three seasons." },
  { icon: IndianRupee, t: "Economic performance", d: "Average market price was very similar across the three seasons. Mean revenue declined from Kharif to Rabi to Zaid while mean cost was fairly similar, so mean profit fell sharply across the seasons: Kharif was strongly profitable on average, Rabi was modestly profitable, and Zaid showed a negative average profit." },
  { icon: MapPin, t: "Regional and crop patterns", d: "The Kharif-strong / Zaid-weak pattern was broadly consistent across states and crops rather than being driven by one outlier group, and the seasonal profitability pattern was also visible within individual crops." },
  { icon: ListChecks, t: "Recommendations", d: "The data-driven recommendations of this project are to treat Zaid-season cultivation as higher financial risk and plan accordingly, prioritize water-efficiency improvements specifically for the Zaid season, use crop-specific, not just season-specific, planning, and continue monitoring pest/disease risk management specifically during Kharif." },
  { icon: AlertTriangle, t: "Limitations", d: "The dataset is cross-sectional and observational, so relationships between environment, resources and yield are associations, not proven causes. Zaid has fewer records than Kharif or Rabi, some values in Rainfall_mm, Soil_Moisture_pct and Yield_Tonnes_Ha were imputed, and only 8 states, 10 districts and 8 crops are represented, so findings may not generalize beyond the dataset. The hypothesis test addressed yield differences across seasons only; profit, water efficiency and other measures were compared descriptively but not formally tested." },
];
const OVERALL = "Overall, within this dataset, agricultural performance differs across the three cropping seasons, with Kharif the strongest-performing season and Zaid the weakest.";

export default function Conclusion() {
  return (
    <PageShell lede={INTRO}>
      <div className="grid-2">
        {SECTIONS.map((t, i) => {
          const Icon = t.icon;
          return (
            <Reveal key={t.t} delay={(i % 2) * 0.05} className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--emerald-50)", color: "var(--emerald-600)" }}><Icon size={18} /></span>
                <h3>{t.t}</h3>
              </div>
              <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.65 }}>{t.d}</p>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="headline-band">
        <h2 style={{ gridColumn: "1 / -1" }}>{OVERALL}</h2>
      </Reveal>

      <Reveal className="card card-lg" >
        <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24 }}>Want to retrace the analysis?</h3>
            <p className="card-sub" style={{ marginTop: 6 }}>Start from the dataset, or jump straight to the seasonal comparison.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/dataset" className="btn btn-ghost">Dataset</Link>
            <Link to="/seasonal" className="btn btn-primary">Seasonal analysis <ArrowRight size={16} /></Link>
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}
