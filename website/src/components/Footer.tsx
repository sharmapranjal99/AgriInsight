import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { GROUPS, SECTIONS } from "../lib/sections";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand light />
            <p style={{ marginTop: 16, fontSize: 14, maxWidth: 340, lineHeight: 1.65 }}>
              A data-analytics study of how agricultural performance varies across the Kharif, Rabi and Zaid cropping seasons.
            </p>
          </div>
          {GROUPS.map((g) => (
            <div key={g}>
              <h6>{g}</h6>
              <ul>
                {SECTIONS.filter((s) => s.group === g).map((s) => (
                  <li key={s.path}><Link to={s.path}>{s.short}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom" />
      </div>
    </footer>
  );
}
