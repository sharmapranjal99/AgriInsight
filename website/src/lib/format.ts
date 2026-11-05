import type { Season } from "../data/types";

export const SEASONS: Season[] = ["Kharif", "Rabi", "Zaid"];
export const SEASON_COLOR: Record<Season, string> = { Kharif: "#1f8a5b", Rabi: "#3b6ea5", Zaid: "#d08a2e" };
export const SEASON_DESC: Record<Season, string> = {
  Kharif: "Monsoon-sown season",
  Rabi: "Winter-sown season",
  Zaid: "Short summer season",
};
export const IRRIGATION_COLOR: Record<string, string> = {
  Drip: "#1f8a5b", Flood: "#3b6ea5", Rainfed: "#8a6a45", Sprinkler: "#d08a2e",
};
export const POS = "#1f8a5b";
export const NEG = "#b5483a";

const nf = (d = 0) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmt = (v: number, d = 0) => nf(d).format(v);
export const inr = (v: number) => `${v < 0 ? "−" : ""}₹${nf(0).format(Math.abs(v))}`;

/** Compact INR using Indian units: K (thousand), L (lakh = 1e5), Cr (crore = 1e7). */
export function inrShort(v: number, d = 2): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(d)}Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(d)}L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(d > 1 ? 1 : d)}K`;
  return `${sign}₹${a.toFixed(0)}`;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
/** 5.894e-56 → "5.89 × 10⁻⁵⁶" */
export function sci(v: number, d = 2): string {
  if (v === 0) return "0";
  const [m, e] = v.toExponential(d).split("e");
  const exp = String(parseInt(e, 10)).split("").map((c) => SUP[c] ?? c).join("");
  return `${m} × 10${exp}`;
}

export const pretty = (col: string) =>
  col
    .replace("Water_Efficiency_t_per_1000m3", "Water efficiency (t/1000 m³)")
    .replace("Avg_Temperature_C", "Avg temperature (°C)")
    .replace("Disease_Pest_Risk_pct", "Disease/pest risk (%)")
    .replace("Market_Price_INR_Tonne", "Market price (₹/t)")
    .replace(/_pct$/, " (%)")
    .replace(/_mm$/, " (mm)")
    .replace(/_kg_ha$/, " (kg/ha)")
    .replace(/_Litre_ha$/, " (L/ha)")
    .replace(/_Tonnes_Ha$/, " (t/ha)")
    .replace(/_Tonnes$/, " (t)")
    .replace(/_Hectares$/, " (ha)")
    .replace(/_Hours_Day$/, " (h/day)")
    .replace(/_INR$/, " (₹)")
    .replace(/_m3$/, " (m³)")
    .replace(/_/g, " ");

/** Short label without units, for dense charts. */
export const short = (col: string) => pretty(col).replace(/\s*\(.*\)$/, "");
