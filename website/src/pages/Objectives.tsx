import { Link } from "react-router-dom";
import { BarChart3, CheckCircle2, ClipboardCheck, Database, FlaskConical, GitCompare, Lightbulb, LineChart, Search, Sparkles, Target } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { BlockTitle, Reveal } from "../components/ui";

const OBJECTIVES = [
  { t: "Explore and understand the dataset", icon: Search, path: "/dataset" },
  { t: "Clean and prepare the data for analysis", icon: Database, path: "/dataset" },
  { t: "Examine how agricultural performance varies across seasons", icon: BarChart3, path: "/seasonal" },
  { t: "Identify important seasonal patterns and trends", icon: LineChart, path: "/seasonal" },
  { t: "Investigate relationships between seasonal conditions and agricultural outcomes", icon: GitCompare, path: "/environment" },
  { t: "Compare relevant groups within different seasons", icon: GitCompare, path: "/economics" },
  { t: "Identify significant differences or unusual patterns", icon: Sparkles, path: "/statistics" },
  { t: "Apply appropriate statistical and visualization techniques", icon: FlaskConical, path: "/statistics" },
  { t: "Interpret findings based on evidence from the dataset", icon: ClipboardCheck, path: "/statistics" },
  { t: "Develop meaningful conclusions and data-driven recommendations", icon: Lightbulb, path: "/recommendations" },
];

const OUTCOMES = [
  "Demonstrate an understanding of seasonal agricultural data",
  "Perform appropriate data cleaning and preparation",
  "Identify important seasonal patterns",
  "Compare agricultural performance across seasons",
  "Discover relationships and variations within the dataset",
  "Select suitable analytical and visualization techniques independently",
  "Interpret analytical findings correctly",
  "Identify significant observations from the data",
  "Develop evidence-based insights",
  "Provide appropriate recommendations based on their findings",
  "Document the complete analysis in a Jupyter Notebook",
];

export default function Objectives() {
  return (
    <PageShell lede="The main objective is to analyse agricultural data from different seasons and identify meaningful patterns, trends, relationships and differences in agricultural performance.">
      <Reveal className="card card-lg" >
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pc-icon" style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--forest-800)", color: "var(--emerald-300)" }}><Target /></span>
          <p style={{ flex: 1, minWidth: 240, fontFamily: "var(--font-display)", fontSize: "clamp(18px, 2vw, 22px)", lineHeight: 1.45 }}>
            Analyse agricultural data from different seasons and identify meaningful patterns, trends, relationships and differences in agricultural performance.
          </p>
        </div>
      </Reveal>

      <BlockTitle sub="The ten objectives from the brief, each linked to the section that addresses it.">Project objectives</BlockTitle>
      <div className="grid-2">
        {OBJECTIVES.map((o, i) => {
          const Icon = o.icon;
          return (
            <Reveal key={o.t} delay={(i % 2) * 0.05}>
              <Link to={o.path} className="preview-card" style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: "18px 20px" }}>
                <span className="pc-icon" style={{ flexShrink: 0 }}><Icon size={19} /></span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: "var(--ink)", lineHeight: 1.45 }}>{o.t}</span>
                <span className="pc-num">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <BlockTitle sub="What the brief expects students to show by the end of the project.">Expected outcomes</BlockTitle>
      <Reveal className="card card-lg">
        <ul className="check-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "12px 28px" }}>
          {OUTCOMES.map((t) => <li key={t}><CheckCircle2 size={17} />{t}</li>)}
        </ul>
      </Reveal>

    </PageShell>
  );
}
