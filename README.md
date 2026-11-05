# AgriInsight: Seasonal Agriculture Performance Analysis

Interactive website for the **VOIS AICTE Batch 1 (2026–2027) Major Project, "Seasonal Agriculture Performance Analysis"**.

The site presents the project's full analysis of **4,000 farm records** (28 variables, 8 states, 8 crops) across the three Indian cropping seasons, **Kharif, Rabi and Zaid**. It covers the problem statement and objectives, data cleaning, exploratory analysis, the seasonal, environmental, resource, economic and regional analyses, the hypothesis tests (Shapiro–Wilk, Levene, ANOVA, Kruskal–Wallis), findings, recommendations and conclusion.

All figures come from the project's own CSV and notebook. No placeholder or invented data is used.

---

## 1. Technology stack

| Layer | Technology |
|---|---|
| Framework | **React 18** + **TypeScript** |
| Build tool / dev server | **Vite 5** |
| Routing | React Router 6 (one URL per section, e.g. `/seasonal`, `/statistics`) |
| Charts | Recharts, plus custom SVG boxplots and CSS-grid heatmaps |
| Animation | Framer Motion (page transitions, scroll reveals) |
| Icons | lucide-react |
| Styling | Plain CSS with design tokens (`website/src/styles/global.css`) |
| Fonts | Fraunces + Inter (Google Fonts) |
| Data pipeline | Python 3 with pandas, NumPy and SciPy (`website/scripts/build_data.py`) |

**Requirements:** Node.js **18 or newer** (tested with Node v24.13.0, npm 11.6.2). Python is needed only if you want to regenerate the data file (see §8).

---

## 2. Start the website locally (quick start)

Open **PowerShell** or **Command Prompt** and run:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm run dev
```

The browser opens automatically. If it doesn't, open:

### ➜ http://localhost:5173

> The first time on a new machine, or if the `node_modules` folder is missing, run `npm install` before `npm run dev` (see §7).

---

## 3. All commands (run inside the `website` folder)

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
```

| Command | What it does | URL |
|---|---|---|
| `npm install` | Installs dependencies into `node_modules` (one-time) | n/a |
| `npm run dev` | Starts the development server with live reload | http://localhost:5173 |
| `npm run build` | Type-checks and builds the production site into `dist/` | n/a |
| `npm run preview` | Serves the built `dist/` folder (run `npm run build` first) | http://localhost:4173 |
| `npm run data` | Regenerates `public/data/insights.json` from the CSV (needs Python) | n/a |

All of these were tested on this project. A fresh copy of the project went through `npm install`, `npm run build`, `npm run data` (its output was byte-identical to the shipped file) and `npm run dev`, all successfully.

---

## 4. Localhost URLs

| Page | URL |
|---|---|
| Home | http://localhost:5173/ |
| Problem Statement | http://localhost:5173/problem |
| Objectives | http://localhost:5173/objectives |
| Project Overview | http://localhost:5173/overview |
| Methodology | http://localhost:5173/methodology |
| Dataset & Preprocessing | http://localhost:5173/dataset |
| Exploratory Data Analysis | http://localhost:5173/eda |
| Seasonal Performance Analysis | http://localhost:5173/seasonal |
| Environmental Analysis | http://localhost:5173/environment |
| Resource Utilization | http://localhost:5173/resources |
| Economic & Regional Analysis | http://localhost:5173/economics |
| Statistical Findings | http://localhost:5173/statistics |
| Recommendations | http://localhost:5173/recommendations |
| Conclusion | http://localhost:5173/conclusion |

> If port 5173 is already in use, Vite automatically picks the next free port (5174, 5175, …). Always use the `Local:` URL that the terminal prints, for example:
> ```
>   VITE v5.4.11  ready in 442 ms
>   ➜  Local:   http://localhost:5173/
> ```

---

## 5. Stop the development server

**Normal way:** click the terminal window where `npm run dev` is running and press **`Ctrl + C`**. If you're asked `Terminate batch job (Y/N)?`, type **`Y`** and press Enter.

Closing that terminal window also stops the server.

**If you lost the terminal window** and the server is still running in the background:

```powershell
# 1. Find the process ID (last column) of whatever is using port 5173
netstat -ano | findstr :5173

# 2. Stop it, replacing 12345 with the PID shown above
taskkill /PID 12345 /F
```

(Tested: `taskkill` stopped the server and the page stopped loading.)

---

## 6. Restart after shutting down or restarting your laptop

The server does not survive a shutdown. Start it again with the same two commands:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm run dev
```

Then open http://localhost:5173. You don't need to reinstall anything as long as the `node_modules` folder still exists.

---

## 7. Reinstall dependencies (if `node_modules` is missing or broken)

`node_modules` isn't part of the source code. It may be missing on a new computer, after copying the project, after a OneDrive sync, or if you deleted it. Reinstall with:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm install
npm run dev
```

For a completely clean reinstall (if you see strange errors):

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
Remove-Item -Recurse -Force node_modules
npm install
```

`package-lock.json` pins exact versions, so `npm install` reproduces the same tested set of packages. `npm audit` may report warnings in development-only packages. These do not affect running the site locally, and you don't need to run `npm audit fix --force` (it can upgrade packages to incompatible major versions).

---

## 8. Environment variables and additional setup

**No environment variables, API keys, `.env` file or database are required.** The website is fully static and reads its data from `website/public/data/insights.json`.

**Optional: regenerating the data file.** Do this only if the CSV changes or you change the analysis in `scripts/build_data.py`:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
pip install pandas numpy scipy      # only if not already installed (Anaconda already includes them)
npm run data
```

The script reads `..\seasonal_agriculture_performance_dataset.csv` and reproduces the notebook's cleaning (season-median imputation for rainfall and soil moisture, crop-median imputation for yield) and statistical tests. It then writes `public/data/insights.json`. Tested with Python 3.13.9, pandas 2.3.3 and SciPy 1.16.3.

**Internet:** the site loads its two fonts from Google Fonts. Offline, it still works but falls back to system fonts.

### Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` | Install Node.js LTS from https://nodejs.org, then open a **new** terminal. |
| PowerShell says `running scripts is disabled on this system` | Use **Command Prompt** instead, or run `npm.cmd run dev`, or run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| `Cannot find module …` / `vite is not recognized` | `node_modules` is missing. Run `npm install` (§7). |
| Page shows **"Something went wrong – Could not load the analysis data"** | `public/data/insights.json` is missing. Run `npm run data`, or restore the file. |
| Site opens on 5174 instead of 5173 | Port 5173 was busy. Use the printed URL, or stop the old server (§5). |
| Opening `index.html` by double-clicking shows a blank page | The site must be served by `npm run dev` or `npm run preview`. It can't be opened as a file. |

---

## 9. Project folder structure

```
AgriInsight/
├── README.md                                                  ← this file
├── Major Project_Seasonal Agriculture Performance Analysis.pdf ← official brief (source, read-only)
├── Seasonal_Agriculture_Performance_Analysis.ipynb            ← analysis notebook (source, read-only)
├── seasonal_agriculture_performance_dataset.csv               ← dataset (source, read-only)
└── website/                                                   ← the frontend project
    ├── package.json              scripts and dependency list
    ├── package-lock.json         exact pinned dependency versions
    ├── vite.config.ts            dev server config (port 5173, auto-open browser)
    ├── tsconfig.json             TypeScript config
    ├── index.html                HTML entry point (fonts, favicon, meta)
    ├── README.md                 short developer notes
    ├── scripts/
    │   └── build_data.py         CSV → insights.json (reproduces notebook cleaning + tests)
    ├── public/
    │   ├── favicon.svg
    │   └── data/insights.json    all numbers shown on the site (generated)
    ├── src/
    │   ├── main.tsx              app bootstrap (router + data provider)
    │   ├── App.tsx               routes, page transitions, loading/error boundaries
    │   ├── styles/global.css     design system: colours, typography, layout, components
    │   ├── data/
    │   │   ├── DataContext.tsx   loads insights.json, exposes loading/error/ready state
    │   │   └── types.ts          TypeScript types for the data file
    │   ├── lib/
    │   │   ├── sections.ts       the 14 sections: titles, URLs, groups, icons (drives all navigation)
    │   │   └── format.ts         number/₹/p-value formatting, season colours
    │   ├── components/
    │   │   ├── Header.tsx        top navigation, dropdowns, mobile drawer
    │   │   ├── Footer.tsx
    │   │   ├── PageShell.tsx     shared section layout: hero, side rail, prev/next pager
    │   │   ├── ui.tsx            ChartCard, Kpi, Triad, Note, Seg (toggle), Tip (tooltip), Reveal
    │   │   ├── Heatmap.tsx       sequential / diverging heatmap
    │   │   ├── BoxPlot.tsx       SVG boxplot (seaborn-style whiskers)
    │   │   ├── Illustrations.tsx hero landscape + section header artwork
    │   │   ├── Brand.tsx         logo
    │   │   └── States.tsx        loader, error screen, error boundary, data gate
    │   └── pages/                one file per section
    │       ├── Home.tsx  Problem.tsx  Objectives.tsx  Overview.tsx  Methodology.tsx
    │       ├── Dataset.tsx  EDA.tsx  Seasonal.tsx  Environment.tsx  Resources.tsx
    │       ├── Economics.tsx  Statistics.tsx  Recommendations.tsx  Conclusion.tsx
    │       └── NotFound.tsx
    ├── node_modules/             installed packages (generated by npm install, not source)
    └── dist/                     production build (generated by npm run build)
```

---

## 10. Notes for future development

- **Never hard-code statistics in pages.** Every number on the site is read from `insights.json`. To show a new figure, compute it in `scripts/build_data.py`, add its type in `src/data/types.ts`, run `npm run data`, then use it via `useData()` in the page.
- **Keep the source files untouched.** The PDF, notebook and CSV in the project root are only read, never modified.
- **Adding or renaming a section:** add an entry to `SECTIONS` in `src/lib/sections.ts` (this updates the header, mobile menu, side rail, footer and prev/next links automatically), create the page in `src/pages/`, and register its route in `src/App.tsx`.
- **Provenance badges:** charts use `<Source kind="nb" />` when they reproduce a notebook analysis and `<Source kind="data" />` when they are extra views computed from the same cleaned data. Keep this distinction for any new chart.
- **Notebook text vs. data:** four statements in the notebook's written text disagree with its computed outputs. The website shows the computed values and flags each one (see *Statistical Findings → Verification summary*):
  1. Finding 3 says Rabi's median profit is positive. It is actually −₹3,187.
  2. §7 calls rainfall and soil moisture the strongest yield correlates, based on correlations with **raw** yield. Against raw yield the ranking does not hold: all environmental |r| < 0.03, and soil moisture is only 4th of the 5 positive correlations (6th of 7 by strength). Against **crop-adjusted** yield it does hold (rainfall r = +0.215, soil moisture r = +0.179), although these associations mostly reflect differences between seasons. The website shows both.
  3. §6 and Recommendation 3 say the best season varies by crop. Kharif is best for every crop, on both yield and profit.
  4. Every one of the 10 districts appears under all 8 states, so regional analysis is done at state level only.

  Consider correcting these in the notebook before the final submission.
- **Design system:** colours, radii and shadows are CSS variables at the top of `global.css`. Season colours are Kharif `#1f8a5b`, Rabi `#3b6ea5` and Zaid `#d08a2e`, defined in `src/lib/format.ts`.
- **Run `npm run build` before demoing or submitting.** It type-checks the whole project and fails on errors, which catches mistakes the dev server may not show.
- **Deployment:** `npm run build` produces a static `dist/` folder that can be hosted on Netlify, Vercel, GitHub Pages and similar. Because the site uses clean URLs (`/seasonal`), configure the host to fall back to `index.html` for unknown paths, which is standard "SPA" mode.
- **Accessibility and motion:** animations respect the operating system's "reduce motion" setting. Heatmap cells are keyboard-focusable and show their value in the readout below the chart.
