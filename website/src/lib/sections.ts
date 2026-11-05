import {
  CalendarRange, CloudSun, Compass, Crosshair, Database, Droplets, Flag, Home, IndianRupee,
  Lightbulb, ScanSearch, Sigma, Target, Workflow, type LucideIcon,
} from "lucide-react";

export interface SectionMeta {
  /** Display number for content sections (1–13). Home is 0 and is not numbered. */
  n: number;
  path: string;
  title: string;
  short: string;
  group: "Start" | "Project" | "Analysis" | "Results";
  blurb: string;
  icon: LucideIcon;
}

export const SECTIONS: SectionMeta[] = [
  { n: 0, path: "/", title: "Home", short: "Home", group: "Start", blurb: "Landing page and headline numbers.", icon: Home },
  { n: 1, path: "/problem", title: "Problem Statement", short: "Problem", group: "Project", blurb: "Why seasonal variation in farm performance needs analysis.", icon: Crosshair },
  { n: 2, path: "/objectives", title: "Objectives", short: "Objectives", group: "Project", blurb: "What the project set out to do, and the expected outcomes.", icon: Target },
  { n: 3, path: "/overview", title: "Project Overview", short: "Overview", group: "Project", blurb: "The three cropping seasons, scope and variable groups.", icon: Compass },
  { n: 4, path: "/methodology", title: "Methodology", short: "Methodology", group: "Project", blurb: "The analytics workflow, from loading to hypothesis testing.", icon: Workflow },
  { n: 5, path: "/dataset", title: "Dataset & Preprocessing", short: "Dataset", group: "Analysis", blurb: "4,000 records, 28 variables, missing values and imputation.", icon: Database },
  { n: 6, path: "/eda", title: "Exploratory Data Analysis", short: "EDA", group: "Analysis", blurb: "Distributions, crop mix and the correlation structure.", icon: ScanSearch },
  { n: 7, path: "/seasonal", title: "Seasonal Performance Analysis", short: "Seasonal", group: "Analysis", blurb: "Yield, production and water efficiency by season.", icon: CalendarRange },
  { n: 8, path: "/environment", title: "Environmental Analysis", short: "Environmental", group: "Analysis", blurb: "Rainfall, temperature, humidity and soil by season.", icon: CloudSun },
  { n: 9, path: "/resources", title: "Resource Utilization", short: "Resources", group: "Analysis", blurb: "Water, irrigation, fertilizer and pesticide usage.", icon: Droplets },
  { n: 10, path: "/economics", title: "Economic & Regional Analysis", short: "Economic & Regional", group: "Analysis", blurb: "Revenue, cost and profit across seasons, states and crops.", icon: IndianRupee },
  { n: 11, path: "/statistics", title: "Statistical Findings", short: "Statistics", group: "Results", blurb: "Hypothesis testing and the six key findings.", icon: Sigma },
  { n: 12, path: "/recommendations", title: "Recommendations", short: "Recommendations", group: "Results", blurb: "Data-driven guidance for seasonal planning.", icon: Lightbulb },
  { n: 13, path: "/conclusion", title: "Conclusion", short: "Conclusion", group: "Results", blurb: "What can, and cannot, be concluded from the data.", icon: Flag },
];

/** The numbered content sections (everything except Home). */
export const NUMBERED = SECTIONS.filter((s) => s.n > 0);
export const GROUPS = ["Project", "Analysis", "Results"] as const;
export const bySlug = (path: string) => SECTIONS.find((s) => s.path === path);
export const pad = (n: number) => String(n).padStart(2, "0");
