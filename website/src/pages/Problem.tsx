import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Quote } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { BlockTitle, Reveal } from "../components/ui";

const IMPORTANCE = [
  "Understand variations in agricultural performance",
  "Identify important seasonal trends",
  "Compare performance across different periods",
  "Understand changing environmental conditions",
  "Examine differences in resource usage",
  "Identify areas requiring further investigation",
  "Support evidence-based agricultural planning",
];

const BRIEF_QUESTIONS = [
  "How does agricultural performance vary across seasons?",
  "What major seasonal patterns can be observed?",
  "Which characteristics change between seasons?",
  "What differences exist between agricultural activities in different seasons?",
  "Are there noticeable variations in resource usage across seasons?",
  "Are there relationships between seasonal environmental conditions and agricultural performance?",
  "How do economic outcomes vary across seasons?",
  "Are some seasonal patterns consistent across different regions or categories?",
  "Are there unusual or unexpected seasonal patterns?",
  "What insights can be derived from the observed seasonal differences?",
  "What conclusions can reasonably be drawn from the available data?",
  "How could the findings support better seasonal agricultural planning?",
];

const PROJECT_QUESTIONS: [string, string, string][] = [
  ["How does agricultural performance (yield, production) vary across seasons?", "/seasonal", "Seasonal Performance"],
  ["How do environmental conditions (rainfall, temperature, humidity, soil moisture) differ between seasons, and how are they associated with yield?", "/environment", "Environmental Analysis"],
  ["Are there noticeable differences in resource usage (water, fertilizer, pesticide) across seasons?", "/resources", "Resource Utilization"],
  ["How does economic performance (revenue, cost, profit) vary across seasons?", "/economics", "Economic & Regional"],
  ["Is the seasonal difference in performance statistically significant, or could it be due to random variation?", "/statistics", "Statistical Findings"],
  ["Are seasonal patterns consistent across different states and crops?", "/economics", "Economic & Regional"],
];

export default function Problem() {
  return (
    <PageShell
      lede="Seasonal changes in weather, farming practice, resource availability and market conditions all affect how farms perform. Raw farm records don't show these effects on their own, so the data has to be analysed to bring them out."
      question="What patterns, trends, relationships and variations explain how agricultural performance differs between seasons?"
    >
      <Reveal className="card card-lg" >
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Quote size={34} style={{ color: "var(--emerald-300)", flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(19px, 2.2vw, 25px)", lineHeight: 1.45, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              The problem is to analyze the given agricultural dataset and investigate seasonal differences in agricultural performance
              by identifying meaningful patterns, trends, relationships and variations within the available data.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid-2">
        <Reveal className="card">
          <h3>Context</h3>
          <div className="prose" style={{ marginTop: 10, fontSize: 15.5 }}>
            <p>The dataset covers farming across different seasons, regions and growing conditions. For each farm it records farming practices, environmental conditions, crop production, resource use and economic results.</p>
            <p>The Indian agricultural calendar has three cropping seasons: <strong>Kharif</strong> (monsoon-sown), <strong>Rabi</strong> (winter-sown) and <strong>Zaid</strong> (short summer season). Each has its own typical rainfall, temperatures and cultivation pattern.</p>
          </div>
        </Reveal>
        <Reveal className="card">
          <h3>Why it matters</h3>
          <p className="card-sub">Understanding seasonal patterns through data analytics helps stakeholders:</p>
          <ul className="check-list" style={{ marginTop: 14 }}>
            {IMPORTANCE.map((t) => <li key={t}><CheckCircle2 size={17} />{t}</li>)}
          </ul>
        </Reveal>
      </div>

      <BlockTitle>Focused analytical questions</BlockTitle>
      <div className="grid-2">
        {PROJECT_QUESTIONS.map(([q, path, label], i) => (
          <Reveal key={i} delay={i * 0.04}>
            <Link to={path} className="preview-card" style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--emerald-500)", lineHeight: 1, minWidth: 34 }}>Q{i + 1}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15.5, color: "var(--ink)", lineHeight: 1.45 }}>{q}</span>
                <span className="pc-go" style={{ paddingTop: 0 }}>{label} <ArrowUpRight size={14} /></span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <BlockTitle sub="The brief asks students to develop their own questions. These are the areas it suggests investigating.">Key questions from the project brief</BlockTitle>
      <Reveal>
        <ol className="num-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
          {BRIEF_QUESTIONS.map((q) => <li key={q}>{q}</li>)}
        </ol>
      </Reveal>
    </PageShell>
  );
}
