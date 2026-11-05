import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  useEffect(() => { document.title = "Page not found · AgriInsight"; }, []);
  return (
    <div className="state-screen">
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 88, color: "var(--emerald-500)", lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, marginTop: 12 }}>This field is empty</h1>
        <p style={{ color: "var(--muted)", marginTop: 10 }}>The page you're looking for doesn't exist. Use the menu or go back to the start.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Back to home <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
