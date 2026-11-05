import { BarChart3, Brush, CalendarRange, CloudSun, Coins, Database, FileInput, Flag, MapPin, Sigma } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { BlockTitle, Reveal } from "../components/ui";

const STEPS = [
  { icon: FileInput, t: "Setup & data loading", d: "Load the supplied CSV as the only data source, with no external or simulated data, and confirm the shape (4,000 × 28)." },
  { icon: Database, t: "Dataset description", d: "List the seasons, states, districts, crops and irrigation methods. Split columns into categorical and numerical, sort the numerical ones into meaningful groups, and compute summary statistics." },
  { icon: Brush, t: "Data cleaning", d: "Check for missing values, duplicates and implausible values. Fill missing rainfall and soil moisture with the median for that season, and missing yield with the median for that crop." },
  { icon: BarChart3, t: "Exploratory data analysis", d: "Plot record counts by season, crop and state, the yield distribution, mean yield per crop, the crop × season crosstab and a correlation matrix of 15 key variables." },
  { icon: CalendarRange, t: "Seasonal performance", d: "Compare yield, production and water efficiency by season (count, mean, median, std), with boxplots and a crop-normalised yield heatmap." },
  { icon: CloudSun, t: "Environmental analysis", d: "Compare seasonal means of rainfall, temperature, humidity, soil moisture, pH, sunlight and pest risk, and correlate each with yield." },
  { icon: Coins, t: "Resource & economic analysis", d: "Compare water use, water efficiency, fertilizer, pesticide, seed quality and irrigation mix, then market price, revenue, cost and profit (mean and median) by season." },
  { icon: MapPin, t: "Regional & crop analysis", d: "Check whether the seasonal profit order holds within each state and each crop, using state × season and crop × season tables." },
  { icon: Sigma, t: "Hypothesis testing", d: "Standardise yield within each crop (z-score), check assumptions with Shapiro–Wilk and Levene, then run Kruskal–Wallis (primary test) and one-way ANOVA (for reference)." },
  { icon: Flag, t: "Findings, recommendations & limitations", d: "Turn the results into six evidence-backed findings and four recommendations, each with its limitations, and close with what can and cannot be concluded." },
];

const CHOICES = [
  { t: "Group-wise median imputation", d: "Rainfall and soil moisture depend heavily on the season, so they are filled with the season median. Yield varies by about an order of magnitude between crops, so it is filled with the crop median. No rows or columns are dropped." },
  { t: "Crop-normalised yield", d: "Sugarcane averages about 47 t/ha while pulses average under 1 t/ha. Comparing raw yield across seasons would mostly reflect which crops each season grows, so yields are compared relative to each crop's best season, or as a within-crop z-score." },
  { t: "Assumption-driven test choice", d: "Shapiro–Wilk (p ≈ 2.6 × 10⁻⁴) rejects normality and Levene's test (SciPy's median-centred, Brown–Forsythe variant) rejects equal variances. That makes the non-parametric Kruskal–Wallis test the main test, with ANOVA reported alongside it." },
  { t: "Association is not causation", d: "The data is observational and cross-sectional. Correlations and group differences are reported as associations, not causes." },
];

export default function Methodology() {
  return (
    <PageShell lede="The project follows a ten-stage analytics workflow. Each stage builds on the one before, and every analysis is tied back to the central question about seasons.">
      <BlockTitle>Analysis workflow</BlockTitle>
      <div className="pipeline">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.t} delay={Math.min(i, 4) * 0.03} className="pipe-step">
              <span className="pipe-dot"><Icon size={21} /></span>
              <div className="pipe-body">
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <BlockTitle>Key methodological choices</BlockTitle>
      <div className="grid-2">
        {CHOICES.map((c, i) => (
          <Reveal key={c.t} delay={i * 0.05} className="card">
            <h3>{c.t}</h3>
            <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.65 }}>{c.d}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="workflow-figure">
        <img
          src={`${import.meta.env.BASE_URL}upload/complete_workflow.png`}
          alt="Data Analysis Workflow: Agricultural Dataset (CSV, 4,000 records, 28 variables) → Data Loading & Understanding → Data Cleaning & Preprocessing → Exploratory Data Analysis (EDA) → Agricultural Performance Analysis (seasonal, environmental, resource, economic, regional & crop) → Statistical Hypothesis Testing (Shapiro–Wilk, Levene, Kruskal–Wallis, one-way ANOVA) → Findings & Recommendations → Final Conclusion"
          width={2048}
          height={682}
          loading="lazy"
        />
      </Reveal>
    </PageShell>
  );
}
