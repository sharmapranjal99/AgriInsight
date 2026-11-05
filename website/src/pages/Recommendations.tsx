import { Link } from "react-router-dom";
import { Bug, Droplets, Layers, ShieldAlert } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Reveal } from "../components/ui";
import { SEASON_COLOR } from "../lib/format";

// Section 13 "Data-Driven Recommendations" of the notebook (cell [67]), transferred word for word in the notebook's order.
// The page intro is the notebook's own description of these recommendations in section 15 (cell [69]).
const recs = [
  {
    icon: ShieldAlert, c: SEASON_COLOR.Zaid,
    t: "Treat Zaid-season cultivation as higher financial risk and plan accordingly.",
    f: "Finding 3 (negative average and median profit in Zaid).",
    w: "Farmers and agricultural planners considering Zaid cultivation could benefit from closer cost control or crop selection review, since current Zaid outcomes in this dataset are, on average, loss-making.",
    l: "Profitability depends on many farm-specific factors not captured here (labor cost, local subsidies, storage/logistics); this is a dataset-level average, not a guarantee for any individual farm.",
    link: "/economics",
  },
  {
    icon: Droplets, c: "#3b6ea5",
    t: "Prioritize water-efficiency improvements specifically for the Zaid season.",
    f: "Finding 4 (Zaid has the highest water use but lowest efficiency).",
    w: "Since irrigation-method mix is similar across seasons, targeted interventions (irrigation scheduling, mulching to reduce evaporation, drought-tolerant varieties) in Zaid specifically may yield a larger efficiency improvement than the same intervention applied uniformly across all seasons.",
    l: "The dataset does not include irrigation timing or evaporation-loss data directly, so the specific mechanism behind lower Zaid efficiency cannot be confirmed from this data alone.",
    link: "/resources",
  },
  {
    icon: Layers, c: SEASON_COLOR.Kharif,
    t: "Use crop-specific, not just season-specific, planning.",
    f: "The crop-by-season yield heatmap (Section 6) and crop-by-season profit table (Section 10) show the best season is not identical for every crop.",
    w: "A blanket \"avoid Zaid\" recommendation could be suboptimal for crops that perform relatively well in Zaid compared to their own other seasons; recommendations are more useful when made at the crop x season level.",
    l: "Some crop x season groups have relatively small sample sizes in this dataset, so crop-specific averages for less common combinations should be treated with more caution than the overall seasonal averages.",
    link: "/economics",
  },
  {
    icon: Bug, c: "#8a6a45",
    t: "Continue monitoring pest/disease risk management specifically during Kharif.",
    f: "Environmental Analysis (Section 7) shows Kharif has the highest average disease/pest risk alongside its highest yield.",
    w: "Since Kharif is the most productive season, protecting that performance from disease/pest losses (through timely crop protection) may have an outsized positive effect on total output.",
    l: "Disease/pest risk here is a percentage indicator in the dataset, not a record of actual crop loss, so its real economic impact cannot be quantified directly from this data.",
    link: "/environment",
  },
];

export default function Recommendations() {
  return (
    <PageShell lede="The recommendations offered are data-driven starting points for further investigation and localized decision-making, not universal prescriptions.">
      {recs.map((r, i) => {
        const Icon = r.icon;
        return (
          <Reveal key={r.t} className="finding">
            <div>
              <span style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: `${r.c}18`, color: r.c }}><Icon size={24} /></span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>Recommendation {i + 1}</div>
              <h3 style={{ marginTop: 6 }}>{r.t}</h3>
              <dl>
                <dt>Supporting finding</dt><dd className="num">{r.f}</dd>
                <dt>Why it may be useful</dt><dd>{r.w}</dd>
                <dt>Limitation</dt><dd className="limit">{r.l}</dd>
              </dl>
              <Link to={r.link} className="pc-go" style={{ marginTop: 14, display: "inline-flex" }}>See the supporting analysis →</Link>
            </div>
          </Reveal>
        );
      })}
    </PageShell>
  );
}
