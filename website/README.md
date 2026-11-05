# AgriInsight: Seasonal Agriculture Performance Analysis

Interactive project website for the VOIS AICTE Major Project.

## Run

```bash
cd website
npm install        # first time only
npm run dev        # http://localhost:5173
```

Production build: `npm run build`, then `npm run preview` (http://localhost:4173).

## Data

Every number on the site comes from `public/data/insights.json`, which is generated from the original
`../seasonal_agriculture_performance_dataset.csv` by `scripts/build_data.py`. The script repeats the
notebook's cleaning steps (season/crop median imputation) and statistical tests (Shapiro–Wilk, Levene,
ANOVA, Kruskal–Wallis). To regenerate it (needs Python with pandas and scipy):

```bash
npm run data
```

The original PDF, notebook and CSV are only read, never modified.

## Stack

Vite + React 18 + TypeScript, React Router (one route per section), Recharts and custom SVG/CSS
heatmaps and boxplots, Framer Motion transitions, lucide-react icons.

## Structure

```
src/
  components/   Header, Footer, PageShell (section layout + rail + pager), charts (Heatmap, BoxPlot), ui primitives
  pages/        Home + 13 section pages + NotFound
  data/         DataContext (loading / error states), types
  lib/          formatting, season colours, section metadata
scripts/build_data.py   CSV → insights.json
```
