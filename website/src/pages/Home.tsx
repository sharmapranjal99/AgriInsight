import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useData } from "../data/DataContext";
import { HeroLandscape } from "../components/Illustrations";
import { Reveal } from "../components/ui";
import { GROUPS, SECTIONS, pad } from "../lib/sections";
import { fmt, inrShort, sci, SEASON_COLOR, SEASON_DESC, SEASONS } from "../lib/format";

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref} className="num">{fmt(v, decimals)}</span>;
}

export default function Home() {
  const d = useData();
  const o = d.overview;
  const econ = Object.fromEntries(d.economicsBySeason.map((e) => [e.season, e]));
  const env = Object.fromEntries(d.environmentBySeason.map((e) => [e.season, e]));
  const perf = Object.fromEntries(d.seasonalPerformance.map((p) => [p.season, p]));
  const ranks = { Kharif: "Strongest", Rabi: "Middle", Zaid: "Weakest" } as const;

  const stats = [
    { v: o.rows, l: "Farm-level records" },
    { v: o.columns, l: "Variables per record" },
    { v: o.states.length, l: "States covered" },
    { v: o.crops.length, l: "Crop types" },
    { v: o.seasons.length, l: "Cropping seasons" },
    { v: o.irrigation.length, l: "Irrigation methods" },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
              Seasonal Agriculture <em>Performance</em> Analysis
            </motion.h1>
            <motion.p className="hero-lede" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
              How do yield, resource use and profitability change between the Kharif, Rabi and Zaid seasons?
              This project analyses {fmt(o.rows)} farm records across {o.states.length} Indian states and {o.crops.length} crops,
              from data cleaning to formal hypothesis testing.
            </motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }}>
              <Link to="/problem" className="btn btn-light">Explore the analysis <ArrowRight size={16} /></Link>
              <Link to="/seasonal" className="btn btn-ghost-dark">Seasonal results</Link>
            </motion.div>
          </div>
          <motion.div className="hero-art" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <HeroLandscape />
            <motion.div className="hero-card" style={{ left: -6, bottom: 64 }} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
              <span className="lbl">Mean profit · Kharif</span>
              <b style={{ color: SEASON_COLOR.Kharif }}>{inrShort(econ.Kharif.Profit_INR)}</b>
            </motion.div>
            <motion.div className="hero-card" style={{ right: -4, top: 54 }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
              <span className="lbl">Mean profit · Zaid</span>
              <b style={{ color: "var(--neg)" }}>{inrShort(econ.Zaid.Profit_INR)}</b>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container stat-strip">
        <Reveal className="stat-strip-inner">
          {stats.map((s) => (
            <div className="stat-cell" key={s.l}>
              <div className="v"><CountUp to={s.v} /></div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </Reveal>
      </div>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Three seasons at a glance</span>
            <h2>Three seasons, three very different outcomes</h2>
            <p>Mean values per season from the cleaned dataset. Kharif ranks highest on yield, water efficiency and profit, and Zaid ranks lowest on all three.</p>
          </Reveal>
          <div className="season-trio">
            {SEASONS.map((s, i) => (
              <Reveal key={s} delay={i * 0.08} className="season-card">
                <div className="season-stripe" style={{ background: SEASON_COLOR[s] }} />
                <div>
                  <div className="s-name">
                    <h3>{s}</h3>
                    <span className="rank-pill" style={{ ["--c" as string]: SEASON_COLOR[s] }}>{ranks[s]}</span>
                  </div>
                  <div className="s-sub">{SEASON_DESC[s]} · {fmt(perf[s].count)} records</div>
                  <dl>
                    <div><dt>Mean rainfall</dt><dd>{fmt(env[s].Rainfall_mm, 2)} mm</dd></div>
                    <div><dt>Mean temperature</dt><dd>{fmt(env[s].Avg_Temperature_C, 2)} °C</dd></div>
                    <div><dt>Water efficiency</dt><dd>{fmt(perf[s].waterEff.mean, 2)} t/1000m³</dd></div>
                    <div><dt>Mean profit</dt><dd style={{ color: econ[s].Profit_INR < 0 ? "var(--neg)" : undefined }}>{inrShort(econ[s].Profit_INR)}</dd></div>
                  </dl>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <Reveal className="headline-band">
            <div>
              <span className="eyebrow" style={{ color: "var(--emerald-300)" }}>Headline result</span>
              <h2 style={{ marginTop: 12 }}>The seasonal gap in yield is statistically significant</h2>
              <p>
                Yield was standardised within each crop, so differences in crop mix between seasons don't drive the result.
                A Kruskal–Wallis test then rejects the hypothesis that the three seasons perform the same (α = {d.stats.alpha}).
              </p>
              <Link to="/statistics" className="btn btn-light" style={{ marginTop: 24 }}>See the statistical findings <ArrowRight size={16} /></Link>
            </div>
            <div className="headline-metrics hm-stack-mobile">
              <div className="hm"><div className="v">H = {fmt(d.stats.kruskal.stat, 3)}</div><div className="l">Kruskal–Wallis statistic</div></div>
              <div className="hm"><div className="v">p = {sci(d.stats.kruskal.p, 1)}</div><div className="l">Far below 0.05</div></div>
              <div className="hm hm-centered"><div className="v">{d.stateSummary.zaidWorst} / {d.stateSummary.n}</div><div className="l">States where Zaid is least profitable</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Explore the project</span>
            <h2>Thirteen sections, one connected story</h2>
            <p>The website follows the project from problem definition, through the data and each analysis, to the conclusions.</p>
          </Reveal>
          {GROUPS.map((g) => (
            <div className="preview-group" key={g}>
              <h3>{g}</h3>
              <div className="preview-grid">
                {SECTIONS.filter((s) => s.group === g).map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Reveal key={s.path} delay={i * 0.04}>
                      <Link to={s.path} className="preview-card">
                        <div className="pc-top"><span className="pc-icon"><Icon size={19} /></span><span className="pc-num">{pad(s.n)}</span></div>
                        <h4>{s.title}</h4>
                        <p>{s.blurb}</p>
                        <span className="pc-go">Open section <ArrowUpRight size={14} /></span>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
