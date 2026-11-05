import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useData } from "../data/DataContext";
import { PageShell } from "../components/PageShell";
import { BlockTitle, Reveal } from "../components/ui";
import { sci } from "../lib/format";

// Everything on this page is taken from the notebook: section 11 (cells [61]-[65]), the Key Findings in section 12 (cell [66])
// and the "Statistical testing scope" limitation in section 14 (cell [68]). Test results are cell [62] (In[82]) and cell [64] (In[83]),
// shown at the precision the notebook prints them.
export default function Statistics() {
  const s = useData().stats;

  const tests = [
    { name: "Shapiro-Wilk normality test", purpose: "Normality check, run on a random sample of n = 500 since Shapiro is sensitive to large n.", stat: `statistic = ${s.shapiro.stat.toFixed(4)}`, p: sci(s.shapiro.p, 2), verdict: "Normality assumption not satisfied", tone: "no" },
    { name: "Levene's test", purpose: "Equal-variance check across the three seasons.", stat: `statistic = ${s.levene.stat.toFixed(4)}`, p: sci(s.levene.p, 2), verdict: null, tone: "none" },
    { name: "Kruskal-Wallis test", purpose: "Non-parametric test that compares rank distributions across groups and does not require normality. The primary, assumption-appropriate test.", stat: `H-statistic = ${s.kruskal.stat.toFixed(3)}`, p: sci(s.kruskal.p, 3), verdict: "Far below 0.05", tone: "yes" },
    { name: "One-way ANOVA", purpose: "Parametric mean comparison, reported alongside for completeness.", stat: `F-statistic = ${s.anova.stat.toFixed(3)}`, p: sci(s.anova.p, 3), verdict: "Far below 0.05", tone: "yes" },
  ] as const;

  const findings = [
    { t: "Kharif is the strongest-performing season overall, and Zaid the weakest.", ev: "Kharif has the highest mean yield, production, water efficiency and profit of the three seasons; Zaid has the lowest on every one of these measures.", m: "Seasonal conditions are associated with meaningful, consistent differences in agricultural outcomes in this dataset, not just isolated differences in one metric." },
    { t: "The seasonal difference in crop-adjusted yield is statistically significant.", ev: "Kruskal-Wallis test on crop-standardized yield (Yield_Z) across the three seasons produced a p-value far below 0.05.", m: "The observed seasonal gap is unlikely to be explained by random variation alone, even after controlling for differing crop mixes between seasons." },
    { t: "Zaid-season farms show, on average, a negative profit.", ev: "Mean and median Profit_INR are negative for Zaid, while both are positive for Kharif and Rabi; average market price is nearly identical across all three seasons.", m: "The profit gap is driven by lower output and efficiency in Zaid, not by farmers receiving a lower price for their produce." },
    { t: "Zaid is also the least water-efficient season.", ev: "Zaid has the highest mean Water_Used_m3 but the lowest mean Water_Efficiency_t_per_1000m3 among the three seasons, despite a similar irrigation-method mix to Kharif and Rabi.", m: "More water is being used to produce comparatively less output in Zaid, consistent with its hotter, drier environmental profile." },
    { t: "Rainfall and soil moisture are positively associated with yield; the pattern is consistent with, but does not prove, a causal water-availability effect.", ev: "Rainfall and soil moisture show the strongest positive correlations with yield among the environmental variables studied.", m: "Water availability is a plausible contributing factor to the observed seasonal yield gap, though this is an association from observational data, not a controlled experiment." },
    { t: "The Kharif-strong / Zaid-weak pattern is broadly consistent across states and crops, not driven by one outlier group.", ev: "The state-by-season and crop-by-season profit tables (Section 10) show the same general ordering repeated across most states and crops.", m: "This supports treating the seasonal pattern as a general feature of the dataset rather than an artifact of a specific region or crop." },
  ];

  return (
    <PageShell
      lede={<>The descriptive and visual analysis above suggests that Kharif, Rabi and Zaid differ in yield and profitability. This section formally tests whether that difference is <strong>statistically significant</strong> or could plausibly be explained by random variation.</>}
    >
      <BlockTitle sub="Raw yield values are on very different scales for different crops (e.g. Sugarcane vs. Pulses). Testing the raw values directly would confound “season effect” with “which crops happen to be more common in each season”. To isolate the seasonal effect, yield is first standardized within each crop (z-score: subtracting that crop's mean and dividing by that crop's standard deviation), producing a crop-adjusted performance measure, Yield_Z, that is comparable across crops.">Hypotheses</BlockTitle>
      <div className="hyp">
        <Reveal className="hyp-card"><div className="h-l">H₀ · Null</div><p>There is no statistically significant difference in crop-adjusted yield performance across the three seasons.</p></Reveal>
        <Reveal className="hyp-card" delay={0.05}><div className="h-l">H₁ · Alternative</div><p>There is a statistically significant difference in crop-adjusted yield performance across at least one pair of seasons.</p></Reveal>
      </div>
      <p className="block-sub" style={{ marginTop: -12 }}><strong>Significance level:</strong> α = {s.alpha}</p>

      <BlockTitle sub="Since there are three independent groups (Kharif, Rabi, Zaid), a one-way ANOVA (mean comparison) or its non-parametric equivalent, the Kruskal-Wallis test (comparing rank distributions) is appropriate. The choice between them depends on whether the crop-adjusted yield is approximately normally distributed and has equal variance across groups. Both are checked below before selecting the test.">Assumption checks and test results</BlockTitle>
      <Reveal className="table-wrap">
        <table className="data">
          <thead><tr><th>Test</th><th className="l">Purpose</th><th>Statistic</th><th>p-value</th><th>Result</th></tr></thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.name}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td className="l" style={{ whiteSpace: "normal", minWidth: 220, color: "var(--muted)" }}>{t.purpose}</td>
                <td>{t.stat}</td>
                <td style={{ fontWeight: 600 }}>{t.p}</td>
                <td style={{ whiteSpace: "normal", minWidth: 150 }}>
                  {t.verdict ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, color: t.tone === "yes" ? "var(--emerald-600)" : "var(--clay)" }}>{t.tone === "yes" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{t.verdict}</span>
                  ) : <span style={{ color: "var(--muted)" }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <div className="prose">
        <p>
          The Shapiro-Wilk p-value is well below 0.05, so the normality assumption required for a standard ANOVA is <strong>not satisfied</strong> (crop-adjusted yield is not normally distributed,
          which is expected given it is still bounded and skewed within crops). Given this, the <strong>Kruskal-Wallis test</strong>, a non-parametric test that compares rank distributions
          across groups and does not require normality, is the more appropriate choice here. For completeness, the parametric one-way ANOVA is also reported alongside it.
        </p>
      </div>

      <Reveal className="card" >
        <div className="test-flow">
          {["Shapiro-Wilk: normality not satisfied", "Use non-parametric Kruskal-Wallis", "Report one-way ANOVA for completeness"].map((x, i, a) => (
            <span key={x} className="test-flow-step">
              <span className="tag" style={{ background: i === 1 ? "var(--emerald-100)" : undefined, fontWeight: i === 1 ? 700 : 500 }}>{x}</span>
              {i < a.length - 1 && <ArrowRight size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal className="decision">
        <span className="d-badge">{s.decision.toUpperCase()}</span>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="d-v">Kruskal-Wallis p-value = {sci(s.kruskal.p, 3)}</div>
          <p style={{ marginTop: 6, color: "#a9c4b4", fontSize: 15 }}>
            Decision at α = {s.alpha}. The null hypothesis is rejected: there is a statistically significant difference in crop-adjusted yield performance across the three seasons in this dataset.
          </p>
        </div>
      </Reveal>

      <BlockTitle>Result and interpretation</BlockTitle>
      <div className="prose">
        <p>
          Both the Kruskal-Wallis test (the primary, assumption-appropriate test) and the one-way ANOVA (reported for reference) produce p-values far below the 0.05 significance level.{" "}
          <strong>The null hypothesis is rejected</strong>: there is a statistically significant difference in crop-adjusted yield performance across the three seasons in this dataset.
        </p>
        <p>
          <strong>Meaning in context:</strong> this confirms, with formal statistical support rather than visual impression alone, that the seasonal differences observed throughout
          this notebook (Kharif performing best, Zaid performing worst) are unlikely to be due to random sampling variation, even after adjusting for the fact that different crops are grown in
          different seasons. It does <strong>not</strong>, on its own, prove which specific environmental or resource mechanism causes the difference. That requires the association-based
          evidence discussed in the Environmental and Resource Analysis sections, interpreted with appropriate caution about causality.
        </p>
      </div>

      <BlockTitle>Statistical testing scope</BlockTitle>
      <div className="prose">
        <p>
          The hypothesis test in this notebook addresses yield differences across seasons only; profit, water efficiency and other measures were compared descriptively but not formally tested,
          and could be the subject of further analysis.
        </p>
      </div>

      <BlockTitle>Key findings</BlockTitle>
      {findings.map((f, i) => (
        <Reveal key={f.t} delay={0.02} className="finding">
          <div className="f-n">{String(i + 1).padStart(2, "0")}</div>
          <div>
            <h3>{f.t}</h3>
            <dl>
              <dt>Evidence</dt><dd className="num">{f.ev}</dd>
              <dt>Meaning</dt><dd>{f.m}</dd>
            </dl>
          </div>
        </Reveal>
      ))}
    </PageShell>
  );
}
