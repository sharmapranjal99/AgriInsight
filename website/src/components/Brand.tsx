import { Link } from "react-router-dom";

export function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#163a28" />
      <path d="M20 31c0-10 4-16.5 11.5-19-1.2 9-5.2 15-11.5 19Z" fill="#3fbf83" />
      <path d="M20 31c0-7.5-3.2-12.5-10-15 .6 7.6 4.4 12.6 10 15Z" fill="#a7e3c2" />
      <path d="M20 31V18" stroke="#0b2016" strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

export function Brand({ sub = true, light = false }: { sub?: boolean; light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? "light" : ""}`} aria-label="AgriInsight home">
      <BrandMark />
      <span>
        AgriInsight
        {sub && <small>Seasonal Analytics</small>}
      </span>
    </Link>
  );
}
