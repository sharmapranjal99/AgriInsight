import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Brand } from "./Brand";
import { GROUPS, SECTIONS, pad } from "../lib/sections";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => { setOpen(null); setDrawer(false); }, [pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setDrawer(false); } };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; }, [drawer]);

  const isHome = pathname === "/";

  return (
    <header className={`header ${scrolled || !isHome ? "scrolled" : ""}`} style={isHome && !scrolled ? { background: "transparent" } : undefined}>
      <div className="container header-inner">
        <Brand light={isHome && !scrolled} />
        <nav className="nav" ref={navRef} aria-label="Main">
          <NavLink to="/" end className="nav-link" style={isHome && !scrolled ? { color: "#e4efe8" } : undefined}>Home</NavLink>
          {GROUPS.map((g) => {
            const items = SECTIONS.filter((s) => s.group === g);
            const active = items.some((s) => s.path === pathname);
            return (
              <div className="nav-group" key={g}>
                <button
                  className={`nav-trigger ${active ? "active" : ""}`}
                  aria-expanded={open === g}
                  aria-haspopup="true"
                  onClick={() => setOpen(open === g ? null : g)}
                  onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(g)}
                  style={isHome && !scrolled && open !== g ? { color: "#e4efe8" } : undefined}
                >
                  {g} <ChevronDown size={15} style={{ transition: "transform .2s", transform: open === g ? "rotate(180deg)" : "none" }} />
                </button>
                <AnimatePresence>
                  {open === g && (
                    <motion.div
                      className="dropdown"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      onMouseLeave={() => setOpen(null)}
                    >
                      {items.map((s) => (
                        <NavLink key={s.path} to={s.path}>
                          <span className="dd-num">{pad(s.n)}</span>
                          <span>
                            <div className="dd-title">{s.title}</div>
                            <div className="dd-sub">{s.blurb}</div>
                          </span>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <Link to="/statistics" className={`btn btn-sm header-cta ${isHome && !scrolled ? "btn-light" : "btn-primary"}`}>
          Key findings <ArrowRight size={15} />
        </Link>
        <button className="menu-btn" aria-label="Open navigation menu" onClick={() => setDrawer(true)}>
          <Menu size={20} />
        </button>
      </div>

      {createPortal(
      <AnimatePresence>
          {drawer && (
            <>
              <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside
                className="drawer"
                role="dialog"
                aria-label="All sections"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="drawer-head">
                  <Brand sub={false} />
                  <button className="menu-btn" style={{ display: "inline-flex" }} aria-label="Close menu" onClick={() => setDrawer(false)}>
                    <X size={20} />
                  </button>
                </div>
                <NavLink to="/" end><span />Home</NavLink>
                {GROUPS.map((g) => (
                  <div key={g}>
                    <h6>{g}</h6>
                    {SECTIONS.filter((s) => s.group === g).map((s) => (
                      <NavLink key={s.path} to={s.path}><span>{pad(s.n)}</span>{s.title}</NavLink>
                    ))}
                  </div>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
}
