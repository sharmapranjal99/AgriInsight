import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, Info, Lightbulb, Sprout } from "lucide-react";
import { SEASON_COLOR, SEASONS } from "../lib/format";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ChartCard({ title, subtitle, children, footnote, controls, height }: {
  title: string; subtitle?: string; children: ReactNode; footnote?: ReactNode; controls?: ReactNode; height?: number;
}) {
  return (
    <Reveal className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {controls}
      </div>
      <div className="chart-body" style={height ? { height } : undefined}>{children}</div>
      {footnote && (
        <div className="chart-foot">
          <span>{footnote}</span>
        </div>
      )}
    </Reveal>
  );
}

export function Kpi({ label, value, note, icon, color }: { label: string; value: ReactNode; note?: ReactNode; icon?: ReactNode; color?: string }) {
  return (
    <Reveal className="kpi">
      <div className="k-l">{icon}{label}</div>
      <div className="k-v" style={color ? { color } : undefined}>{value}</div>
      {note && <div className="k-n">{note}</div>}
    </Reveal>
  );
}

export function Triad({ obs, int, ins }: { obs: ReactNode; int: ReactNode; ins: ReactNode }) {
  return (
    <Reveal className="triad">
      <div className="triad-item obs"><div className="t-h"><Eye size={14} /> Observation</div><p>{obs}</p></div>
      <div className="triad-item int"><div className="t-h"><Lightbulb size={14} /> Interpretation</div><p>{int}</p></div>
      <div className="triad-item ins"><div className="t-h"><Sprout size={14} /> Agricultural insight</div><p>{ins}</p></div>
    </Reveal>
  );
}

export function Note({ children, kind = "warn", title }: { children: ReactNode; kind?: "warn" | "info"; title?: string }) {
  return (
    <Reveal className={`note ${kind === "info" ? "info" : ""}`}>
      {kind === "info" ? <Info size={18} /> : <AlertTriangle size={18} />}
      <div>{title && <strong>{title} </strong>}{children}</div>
    </Reveal>
  );
}

export function SeasonLegend({ extra }: { extra?: { label: string; color: string }[] }) {
  const items = extra ?? SEASONS.map((s) => ({ label: s, color: SEASON_COLOR[s] }));
  return (
    <div className="legend" role="list">
      {items.map((i) => <span key={i.label} role="listitem"><i style={{ background: i.color }} />{i.label}</span>)}
    </div>
  );
}

export function Seg<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function BlockTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <Reveal><h2 className="block-title">{children}</h2></Reveal>
      {sub && <p className="block-sub">{sub}</p>}
    </>
  );
}

/** Tooltip used by all Recharts charts. */
export function Tip({ active, payload, label, format, title }: {
  active?: boolean; payload?: { name?: string; value?: number; color?: string; fill?: string; payload?: Record<string, unknown> }[];
  label?: string | number; format?: (v: number, name?: string) => string; title?: (label: string | number | undefined) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tip">
      <div className="tip-t">{title ? title(label) : label}</div>
      {payload.map((p, i) => (
        <div className="tip-r" key={i}>
          <span className="tip-k"><i style={{ background: p.color || p.fill || (p.payload?.fill as string) }} />{p.name}</span>
          <b>{typeof p.value === "number" ? (format ? format(p.value, p.name) : p.value.toLocaleString("en-IN")) : String(p.value)}</b>
        </div>
      ))}
    </div>
  );
}
