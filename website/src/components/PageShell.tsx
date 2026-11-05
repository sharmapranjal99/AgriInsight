import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, HelpCircle } from "lucide-react";
import { FieldLines } from "./Illustrations";
import { GROUPS, NUMBERED, SECTIONS, pad } from "../lib/sections";

export function PageShell({ lede, question, children }: { lede: ReactNode; question?: ReactNode; children: ReactNode }) {
  const { pathname } = useLocation();
  const idx = SECTIONS.findIndex((s) => s.path === pathname);
  const meta = SECTIONS[idx];
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  useEffect(() => { document.title = `${meta.title} · AgriInsight`; }, [meta.title]);

  return (
    <>
      <section className="page-hero">
        <FieldLines />
        <div className="container page-hero-inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><ChevronRight size={13} /><span>{meta.group}</span><ChevronRight size={13} /><span style={{ color: "var(--ink)" }}>{meta.title}</span>
          </nav>
          <div className="chapter-no">Section {pad(meta.n)} <span style={{ color: "var(--muted)", fontWeight: 400 }}>/ {NUMBERED.length}</span></div>
          <h1>{meta.title}</h1>
          <p className="lede">{lede}</p>
          {question && <div className="question-chip"><HelpCircle size={18} /><span>{question}</span></div>}
        </div>
      </section>

      <div className="container page-layout">
        <aside className="rail" aria-label="Sections">
          <div className="rail-inner">
            {GROUPS.map((g) => (
              <div key={g}>
                <h6>{g}</h6>
                {SECTIONS.filter((s) => s.group === g).map((s) => (
                  <NavLink key={s.path} to={s.path}><span>{pad(s.n)}</span>{s.short}</NavLink>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <div className="content">
          {children}
          <nav className="pager" aria-label="Section navigation">
            {prev ? (
              <Link to={prev.path}><span className="p-l"><ArrowLeft size={14} /> Previous{prev.n > 0 ? ` · ${pad(prev.n)}` : ""}</span><span className="p-t">{prev.title}</span></Link>
            ) : <span />}
            {next ? (
              <Link to={next.path} className="next"><span className="p-l">Next · {pad(next.n)} <ArrowRight size={14} /></span><span className="p-t">{next.title}</span></Link>
            ) : (
              <Link to="/" className="next"><span className="p-l">Back to start <ArrowRight size={14} /></span><span className="p-t">Home</span></Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
