# AgriInsight: Project Progress & Checkpoint

**Checkpoint saved:** 5 November 2026, about 02:45 (end of the session that continued from 4 November)
**Last updated:** 5 November 2026, after the Zaid bar colour change (§5, "Completed 4–5 November")
**Build status at checkpoint:** ✅ `npm run build` passes (TypeScript check + Vite production build, 2,540 modules, no errors or warnings)
**QA at checkpoint:** all 14 sections and the 404 page render on desktop (1440 px) and mobile (390 px), with 0 console errors, 0 horizontal page overflow, no broken images, and Previous/Next on all 13 numbered sections
**Data integrity at checkpoint:**
- The 1,780 / 401 / 316 value checks from the 3–4 Nov audit still apply to `insights.json` (unchanged since 22:13 on 4 Nov, apart from the two additions listed in §5).
- The notebook-matched charts added on 4–5 Nov carry values read back from re-running the notebook's own cells. Each re-render was pixel-identical to the saved notebook output, and every chart was checked against it in the browser (§5).

---

## 1. Project name and purpose

**AgriInsight: Seasonal Agriculture Performance Analysis.** An interactive website presenting the major-project analysis of how agricultural performance (yield, production, resource use, profitability) differs across India's three cropping seasons, **Kharif, Rabi and Zaid**. It covers 4,000 farm records (28 variables, 8 states, 10 districts, 8 crops, 4 irrigation methods).

Sources of truth, all **read-only** and never edited by this work:

| File | Size | Status |
|---|---|---|
| `seasonal_agriculture_performance_dataset.csv` | 665,162 bytes, 2 Nov 2026 | ✅ Unchanged |
| `Major Project_Seasonal Agriculture Performance Analysis.pdf` | 205,569 bytes, 2 Nov 2026 | ✅ Unchanged |
| `Seasonal_Agriculture_Performance_Analysis.ipynb` | 917,240 bytes, 5 Nov 2026 01:50:42 | ⚠️ **Edited and re-run by you** on 4–5 Nov: added the crop × season heatmap, the Excluding-Sugarcane histogram, the Log/Linear crop-yield charts and the 3 × 2 seasonal figure, then ran Run All. Never edited by this work. Run All stopped with an error at cell [57] (see §10) |

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool / dev server | Vite 5 |
| Routing | React Router 6 (one URL per section) |
| Charts | Recharts; custom SVG boxplots and CSS-grid heatmaps; and (from 4–5 Nov) custom SVG charts that recreate specific notebook figures inside the existing cards |
| Animation | Framer Motion |
| Icons | lucide-react |
| Styling | Plain CSS with design tokens (`website/src/styles/global.css`) |
| Fonts | Fraunces + Inter (Google Fonts) |
| Data pipeline | Python 3 with pandas, NumPy, SciPy (`website/scripts/build_data.py` → `website/public/data/insights.json`) |

Tested with Node v24.13.0, npm 11.6.2, Python 3.13.9 (Anaconda), pandas 2.3.3, SciPy 1.16.3.

---

## 3. Folder structure

```
AgriInsight/
├── PROJECT_PROGRESS.md            ← this checkpoint
├── README.md                      ← setup / run instructions
├── DATA_PROVENANCE.md             ← data-accuracy audit and source traceability (revisions 1–3)
├── seasonal_agriculture_performance_dataset.csv     (source, read-only)
├── Seasonal_Agriculture_Performance_Analysis.ipynb  (source, read-only)
├── Major Project_Seasonal Agriculture Performance Analysis.pdf (source, read-only)
├── complete_workflow.png          ← your uploaded infographic (original copy)
├── workflow img.png               ← earlier infographic (original copy, no longer used)
└── website/
    ├── package.json, package-lock.json, vite.config.ts, tsconfig.json, index.html, README.md
    ├── scripts/build_data.py      ← CSV → insights.json (reproduces notebook cleaning and tests)
    ├── public/
    │   ├── favicon.svg
    │   ├── data/insights.json     ← every number on the site (generated; do not hand-edit)
    │   └── upload/                ← images served by the site (see §7)
    └── src/
        ├── main.tsx, App.tsx, vite-env.d.ts
        ├── styles/global.css
        ├── data/DataContext.tsx, types.ts
        ├── lib/sections.ts (section numbering and navigation), format.ts
        ├── components/Header, Footer, PageShell, ui, Heatmap, BoxPlot, Illustrations, Brand, States
        │     + notebook-matched charts (added 4–5 Nov): CropSeasonHeatmap, NotebookHistogram,
        │       NotebookCropBars, CorrelationHeatmap, NotebookSeasonal, RelativeYieldHeatmap
        └── pages/Home, Problem, Objectives, Overview, Methodology, Dataset, EDA, Seasonal,
                  Environment, Resources, Economics, Statistics, Recommendations, Conclusion, NotFound
```

---

## 4. Current page and section structure

Home is unnumbered. The 13 content sections are numbered **01–13** from one place, `website/src/lib/sections.ts`. The numbering feeds the sidebar, Home overview cards, header dropdowns, mobile menu, page headers ("Section 07 / 13") and the Previous/Next links.

| # | Group | Section | URL |
|---|---|---|---|
| – | – | Home | `/` |
| 01 | Project | Problem Statement | `/problem` |
| 02 | Project | Objectives | `/objectives` |
| 03 | Project | Project Overview | `/overview` |
| 04 | Project | Methodology | `/methodology` |
| 05 | Analysis | Dataset & Preprocessing | `/dataset` |
| 06 | Analysis | Exploratory Data Analysis | `/eda` |
| 07 | Analysis | Seasonal Performance Analysis | `/seasonal` |
| 08 | Analysis | Environmental Analysis | `/environment` |
| 09 | Analysis | Resource Utilization | `/resources` |
| 10 | Analysis | Economic & Regional Analysis | `/economics` |
| 11 | Results | Statistical Findings | `/statistics` |
| 12 | Results | Recommendations | `/recommendations` |
| 13 | Results | Conclusion | `/conclusion` |

Unknown URLs show a 404 page ("This field is empty").

---

## 5. Changes completed so far (chronological)

### Build and first release
- Built the full 14-section website from the PDF, notebook and CSV, with every figure generated from the CSV by `build_data.py`, which reproduces the notebook's cleaning and tests exactly.
- Fixed the mobile drawer (rendered through a portal), container gutters, mobile header CTA, heatmap sizing and wrapping labels.
- Wrote `README.md` with verified run, stop, restart and reinstall instructions.

### Data-accuracy audit and corrections (`DATA_PROVENANCE.md`)
- **Revision 1:** full independent audit (1,780 data values, 401 notebook outputs, every rendered number). Verdict: pass with issues; 21 issues logged (A1–A3, B1–B6, C1–C7, D1–D5).
- **Revision 2:** all 21 fixed and re-tested:
  - correctly rounded correlation labels;
  - legend and percentage fixes;
  - crop-adjusted and within-season correlations with a Raw / Crop-adjusted toggle;
  - Dunn's post-hoc test and Welch's ANOVA;
  - supplementary tests and an imputation sensitivity check;
  - dataset-origin disclosure;
  - causal wording replaced with association wording;
  - external agronomy context labelled.
- **Revision 3 (at your request):** removed the website-added effect-size analysis (η² = 0.060, ε²) from all pages and from the data pipeline. Audit item C5 is recorded as reopened by owner decision.

### Display and content edits requested today (all verified in the browser)

| Area | Change |
|---|---|
| Home season cards | Mean temperature and mean rainfall shown to 2 decimals (28.45 °C, 852.11 mm …) |
| Home headline band | Removed the η² tile; **H = 254.342** (3 decimals); p = 5.9 × 10⁻⁵⁶ unchanged; 8/8 card centred below the two upper cards (≈ 50% width, wider where needed to keep its label on one line; full width on phones) |
| Home hero | Removed the "Major Project · VOIS AICTE Batch 1 · 2026–27" badge (and its now-unused CSS rule) |
| Footer (all pages) | Removed "Major Project, VOIS AICTE Batch 1 (2026–2027)."; removed "Data: … · 4,000 records" and "All figures come from …"; divider kept |
| Section numbering | Content sections renumbered 01–13; Home unnumbered; page totals now "/ 13" |
| Problem Statement | Removed the "Official problem statement · Project PDF §2" badge; removed the subtitle under "Focused analytical questions" |
| Objectives | Removed the "Project PDF §4" badge; removed the green "The notebook states its expected outcome…" callout |
| Project Overview | Season cards show rainfall / temperature / humidity to 2 decimals; "Records per season" footnote now "Zaid has noticeably fewer records. Totals may vary due to rounding." with the "Notebook §5" badge removed; removed the paragraph under the technology badges |
| Methodology | Removed the "Analysis workflow" subtitle; removed all code tags and "Notebook §" labels from the 10 workflow steps; replaced the "How this website stays faithful…" callout with the workflow infographic, now **`upload/complete_workflow.png`**; **removed the "Analyses added on this website" and "Rounding" cards**, leaving the four notebook-supported cards in a 2 × 2 grid |

### Completed after the checkpoint (4 November 2026)

**✅ Home "Headline result" band: mobile responsiveness fixed** (was known issue #1)

- **Problem:** on phones the KPI values ("H = 254.342", "p = 5.9 × 10⁻⁵⁶") don't wrap, so the card row was wider than the band and content was cut off on the right (about 29 px at 390 px, more at 320 px). At 320 px the "See the statistical findings →" button was also too wide, and its arrow was cut off.
- **Fix:**
  - At **≤ 480 px**, the H, p and 8/8 cards stack as three full-width cards.
  - At **< 360 px**, the band's button uses 16 px side padding (was 20 px) and 14 px text (was 15 px).
  - Fonts, colours and card styling are unchanged, and layouts at 520 px and wider are exactly as before.
  - The Conclusion page's band is not affected (the stacking class is applied to the Home band only).
- **Files changed:**
  - `website/src/pages/Home.tsx`: added the class `hm-stack-mobile` to the Home band's `headline-metrics` grid.
  - `website/src/styles/global.css`: added `@media (max-width: 480px) { .headline-metrics.hm-stack-mobile { grid-template-columns: 1fr; } }` and `@media (max-width: 359px) { .headline-band .btn { padding-left: 16px; padding-right: 16px; font-size: 14px; } }`.
- **Responsive testing widths:** **320, 360, 390, 480, 520, 768, 1024, 1440 px**. All passed:
  - no clipping of any band content;
  - no horizontal page overflow;
  - every KPI value fits inside its card;
  - the 8/8 card is centred;
  - stacked at ≤ 480 px and side by side at ≥ 520 px;
  - the button and its arrow are fully visible at 320, 340 and 359 px;
  - the Conclusion band is unchanged at 390 px;
  - 0 console errors.
- **Build:** `npm run build` passes.

### Completed 4–5 November 2026 (second part of the session, all verified in the browser)

The principle throughout: **the notebook is the source of truth for data, labels and plotting settings, and the existing website is the source of truth for card size, layout and responsiveness.** Where a chart was matched to a notebook figure, I re-ran that cell on the cleaned data and confirmed the re-render was pixel-identical to the saved output. The website chart was then checked against it at 320–1440 px.

**Section 05: Dataset & Preprocessing** (`pages/Dataset.tsx`, `scripts/build_data.py`, `public/data/insights.json`, `data/types.ts`)
- Removed the "Sensitivity check" paragraph from "Cleaning strategy".
- Removed the "Notebook §4" badge (Missing values card) and the "Notebook §2–3" badge (Inspect card).
- "Inspect the data" tabs now show the notebook's own outputs:
  - **Sample rows** are `df.head()`: 5 rows with the notebook's column headers, Indian thousands separators on whole numbers, and decimals as printed.
  - **Summary stats** are `df.describe().T` exactly as printed.
  - These use two new data keys, `sampleRowsNotebook` and `describeNotebook`.
- Removed the whole "Additional dataset checks" section (3 validation cards + 2 caveat boxes).

**Section 06: EDA** (`pages/EDA.tsx` + new components)

| Element | Change | Notebook cell |
|---|---|---|
| "How records are distributed" | Irrigation tab removed. Labels, order, counts and colours from the notebook. Exact matplotlib axis limits and ticks: Season 0–1867.95 (ticks every 250, label "Count"), Crop 0–724.5, State 0–555.45. Bar-end numbers removed on all tabs, and the tooltip shows the category name only. **Zaid bar colour set to `#D08A2E` at your request** (Kharif `#2E7D32` and Rabi `#1565C0` unchanged) | [20] |
| Yield summary cards | Range shown as **0.30–101.44 t/ha** (mean 5.27, median 1.74, std 13.35 unchanged) | [23] |
| "Crop composition by season" | Recreated as the notebook's Greens heatmap (`CropSeasonHeatmap.tsx`): range 51–314, annotations, colour bar "Number of Records". Then reduced to **78% of the card width** (22% smaller on desktop; phones keep a 600 px minimum with sideways scroll inside the card) | [27] |
| "Distribution of yield" | Both tabs redrawn from the notebook (`NotebookHistogram.tsx`): **All crops**, 50 bins, 0.3–101.44; **Excl. sugarcane**, 40 bins, 0.3–6.08. Exact bin edges, axis limits, ticks, titles and colours, in the existing 280 px chart box | [21], [22] |
| "Average yield by crop" | Log and Linear views redrawn from the notebook's two figures (`NotebookCropBars.tsx`): exact values, limits, ticks, titles and value labels, toggle kept | [26] |
| Correlation matrix | Recreated from the notebook (`CorrelationHeatmap.tsx`): RdBu_r centred on 0, range −0.4652–1.0, full feature names, **no numbers in cells** (`annot=False`), exact coefficient on hover. Subtitle corrected to "Red is positive, blue is negative." The section note no longer mentions cell labels | [28] |
| Distribution cards (Obs / Int / Insight) | Audited. All statements are supported, so nothing changed | [24], [20], [21], [22], [25] |
| Correlation cards (Obs / Int / Insight) | First audited: removed "partly by construction…" and corrected "≈ 0.52" to "0.53 and 0.52". **Then replaced with your new text (5 Nov):** no numbers, association not causation | [28], [29] |

**All pages: source and provenance labels removed** (`components/ui.tsx`, `styles/global.css`, and the Dataset, EDA, Seasonal, Environment, Resources, Economics, Statistics and Overview pages)
- **Badges removed:** all 25 ("Notebook §5–§10", "Notebook §5 crosstab", "Computed from dataset", "Computed from the notebook's test groups"), plus their hover titles. The `Source` component and its `.src` styles are deleted.
- **Card footers:** `ChartCard` now renders its dashed footer only when there's a footnote. This removed the empty strip on the Dataset "Inspect the data" card.
- **Phrases removed from text:**
  - "(Notebook §9 output)" and ", and the notebook's own §9 output,";
  - "(as in the notebook)" and ", as in the notebook,";
  - "(§7)";
  - "(added on this website, not in the notebook)";
  - "taken from the notebook's introduction";
  - "the notebook's" before "recommendation";
  - the captions "Extends the notebook…" (Resources and Economics);
  - the Statistics note "Each finding is backed by values computed from the cleaned dataset."
- **Kept on purpose, as content rather than labels:**
  - text where the notebook is the subject, such as "The notebook says…";
  - project-description mentions (Jupyter Notebook, CSV);
  - the Statistics items "§7 calls…" and "§6 and Recommendation 3…".

**Section 07: Seasonal Performance Analysis** (`pages/Seasonal.tsx` + new components)

| Element | Change | Notebook cell |
|---|---|---|
| Yield / Production / Water efficiency card | Both charts on all three tabs redrawn from the notebook's 3 × 2 figure (`NotebookSeasonal.tsx`): exact mean and median bars (0.35 wide, notebook colours), seaborn boxplots (`whis=1.5`, `showfliers=False`), axis limits, ticks, titles and labels. **No legend**, following your In[41] edit. Tooltips show mean/median, and n, whiskers and quartiles. The old website-only mean marker and legend row are gone | [32] |
| Green "Crop composition affects raw comparisons" banner | Unsupported parts removed: sugarcane shares (7.0 / 7.9 / 8.6%), the "+37.3% rather than +21.3%" gap, "computed from unrounded means", and "slightly" | [24], [56] |
| Observation / Interpretation cards | Removed the IQR sentence, the "per-farm averages" reasoning and the farm-area comparison. Insight card unchanged | [33], [31], [57], [37] |
| Crop-normalised yield heatmap | Redrawn to match the notebook (`RelativeYieldHeatmap.tsx`): **YlGnBu**, range **0.6339–1.00**, title "Relative Seasonal Yield Performance by Crop (1.00 = that crop's best season)", axis labels Season and Crop, colour bar "Yield relative to that crop's best season" with ticks 0.65–1.00. Same 24 values, order and formula, and the same hover/focus detail line | [34] |
| Mean yield by crop and season table | Audited, unchanged. All 24 values and the Best column match the notebook's `crop_season_yield` calculation. The table itself is a website addition: the notebook calculates the values but never prints them | [34] |
| Amber "Verification note" | **Removed** (5 Nov) | – |

---

## 6. Corrections made to match the original notebook

The website shows the computed values and flags each place where the notebook's own written text disagrees with its outputs. **As of 5 Nov** these are flagged in the Economics and Environment verification notes and in the Statistics "corrections" list. The Seasonal page's verification note (item 3) was removed at your request, so item 3 now appears only in the Statistics list.

1. **Rabi median profit:** notebook Finding 3 says it is positive. The computed value (notebook cell [43] output) is **−₹3,187**.
2. **Environmental correlations:** §7 calls rainfall and soil moisture the strongest yield correlates. That holds against **crop-adjusted** yield (r = +0.215, +0.179) but not against **raw** yield, where every |r| is below 0.03. The site shows both, and notes the crop-adjusted associations mostly reflect differences between seasons.
3. **Best season per crop:** §6 and Recommendation 3 say it varies by crop. Kharif is best for yield and profit in **all 8 crops**.
4. **District labels:** every one of the 10 districts appears under all 8 states, so regional analysis uses state only.

Other notebook-text inconsistencies, documented but not displayed: cell [37] calls sunlight the mild negative correlate (soil pH is stronger); cell [25] mentions columns not in its heatmap.

All notebook statistics are shown exactly as printed. ⚠️ After your 5 Nov Run All, cell [57] (Shapiro–Wilk, Levene) holds only an error, and cell [59] (ANOVA, Kruskal–Wallis) was not re-run. Its output dates from an earlier run, so these values are currently not reproduced by the saved notebook (§10, item 9):
- Shapiro–Wilk W = 0.9874, p = 2.62 × 10⁻⁴
- Levene 58.16, p = 1.26 × 10⁻²⁵
- ANOVA F = 127.383, p = 2.34 × 10⁻⁵⁴
- Kruskal–Wallis H = 254.342, p = 5.89 × 10⁻⁵⁶
- decision: Reject H₀

---

## 7. Image files

| File | Location | Used by the site? |
|---|---|---|
| `complete_workflow.png` (2048 × 682, 1,153,247 bytes) | `website/public/upload/` (served as `upload/complete_workflow.png`); original copy in project root | ✅ **Yes**: Methodology workflow infographic |
| `workflow img.png` (2172 × 724, 1,534,765 bytes) | `website/public/upload/` and project root | ❌ No (superseded, still copied into the build) |
| `workflow-img-clean.png` (2172 × 724, 1,185,356 bytes) | `website/public/upload/` | ❌ No (heading-removed version of the above, superseded) |
| `favicon.svg` | `website/public/` | ✅ Yes: browser tab icon |

Verified at checkpoint: `Methodology.tsx` references only `upload/complete_workflow.png`; no source file references the two old images.

---

## 8. Pending tasks for tomorrow

- ✅ ~~Methodology cards~~: completed on 3 Nov. The two website-only cards ("Analyses added on this website" and "Rounding") were removed; the four notebook-supported cards remain (Group-wise median imputation, Crop-normalised yield, Assumption-driven test choice, Association is not causation).
- ✅ ~~Mobile clipping in the Home headline band~~: completed on 4 Nov (see §5, "Completed after the checkpoint").

- ✅ ~~4–5 Nov work~~: all items in §5, "Completed 4–5 November", are done.

### ▶ Exact next step for tomorrow

**Repair the notebook's Run All failure, then re-verify the two pages that depend on it.**

1. **You, in Jupyter:** in cell **[32]** (the 3 × 2 seasonal figure), rename the variable `stats` to `season_stats` in its three places:
   - `stats = (`
   - `stats.loc[season, 'mean']`
   - `stats.loc[season, 'median']`

   It currently overwrites the `scipy.stats` module imported in cell [2]. Then use **Kernel → Restart Kernel and Run All Cells**, and save.
2. **Then ask me to re-verify:**
   - that every code cell has run, in order from 1, with no errors;
   - that cell [57] prints Shapiro–Wilk and Levene again, and cell [59] has a fresh ANOVA / Kruskal–Wallis output;
   - that the Seasonal page's Observation sentence "Levene's test on crop-adjusted yield indicates unequal variances" and the Statistics page's test values still match;
   - that the EDA and Seasonal charts still match (re-running is expected to leave them unchanged).

**Decisions still open from this session** (offered, not yet answered; nothing changes until you decide):

1. **Records chart on phones (≤ 390 px):** the notebook-exact x-axis numbers overlap. Options:
   - (a) label every other tick on phones (recommended);
   - (b) smaller tick text;
   - (c) leave as is.
2. **Distribution of yield histograms on phones (320–390 px):** one title line runs up to about 16 px past the right edge. Same wrapping fix as applied to the crop-yield chart.
3. **Crop composition card:** the card heading and the figure's own title now say the same thing. Remove the card heading or subtitle? Also, lower the phone minimum width from 600 px to about 470 px (less sideways scrolling, but numbers drop to about 7 px)?
4. **Small wording items:**
   - histogram tooltip says "1 farms";
   - the Range card says "t/ha" twice (value and note);
   - Statistics items "§7 calls…" and "§6 and Recommendation 3 suggest…" could become "The environmental section calls…" and similar.
5. **Records chart Zaid colour** is now `#D08A2E` by your choice. The notebook uses `#EF6C00`, so this one colour intentionally differs from the notebook.

**Older pending items:**

1. **Unused images:** `workflow img.png` and `workflow-img-clean.png` in `website/public/upload/`. **Keep them, per your instruction of 4 Nov. Do not delete.** No action unless you decide otherwise.
2. Update `DATA_PROVENANCE.md` and `README.md`. The review proposals are still awaiting your decision:
   - README R1–R5 (R1: keep or remove the VOIS AICTE line);
   - DATA_PROVENANCE P1–P10.

   Both documents are now further out of date (§10, items 4, 5 and 13).
3. Optional polish raised during the session (only if wanted):
   - a "swipe to see all steps" hint for the infographic on phones;
   - a compressed copy of the 1.15 MB infographic;
   - removing the empty spacing under the footer divider;
   - a maximum line width for the Objectives statement;
   - keeping Overview's season figures on one line.

---

## 9. How to start the website locally

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm run dev
```
Open **http://localhost:5173**. If that port is busy, Vite prints the next free port, such as 5174.

| Task | Command (inside `website/`) |
|---|---|
| Install dependencies (first time, or if `node_modules` is missing) | `npm install` |
| Development server | `npm run dev` → http://localhost:5173 |
| Production build | `npm run build` |
| Preview the production build | `npm run preview` → http://localhost:4173 |
| Regenerate data from the CSV (needs Python with pandas and SciPy) | `npm run data` |
| Stop a server | `Ctrl + C` in its terminal (or `netstat -ano \| findstr :5173` then `taskkill /PID <pid> /F`) |

**Servers running at checkpoint (5 Nov):** a preview server on 4173 serving the latest build (`npm run preview`, started in this session). The 5173 dev server from earlier may no longer be running. Both stop when this session or your terminal closes, so restart with the commands above tomorrow. Run `npm run build` before `npm run preview` so the preview shows the latest code.

---

## 10. Known issues and unfinished work

1. ✅ ~~Home headline band clips on phones~~: **fixed on 4 Nov 2026** by stacking the cards at ≤ 480 px and slightly shrinking the button below 360 px. Tested at 320, 360, 390, 480, 520, 768, 1024 and 1440 px (see §5).
2. **Notebook file re-saved outside this work** at 21:00:56 on 3 Nov 2026 (the first code cell's execution count cleared; 144 bytes smaller). The cell content, all text outputs and the checked figures are identical, and all 401 printed values still match. The original bytes can be restored from OneDrive version history if needed.
3. **Audit item C5 reopened by owner decision:** the site reports statistical significance without an effect size (recorded in `DATA_PROVENANCE.md` §9).
4. **`DATA_PROVENANCE.md` doesn't yet record today's display and content edits** (badge and callout removals, renumbering, 2-decimal displays, infographic, card removals). A few of its statements now describe the earlier site. For example, it still lists the old footer text, and its §8 mentions the Methodology card "Analyses added on this website", which has now been removed. The data and statistics it verifies are unchanged and still correct.
5. **Root `README.md`** still opens with the "VOIS AICTE Batch 1 (2026–2027) Major Project" description, which was removed from the website. The run instructions in it remain correct.
6. **Unused images** (`workflow img.png`, `workflow-img-clean.png`) are still in `website/public/upload/` and are included in the build output. They are kept on purpose, per your instruction of 4 Nov.
7. **`website/package.json` timestamp changed (00:22:13, 4 Nov) without any content change.** The file's scripts and pinned dependency versions are identical to the original, and `package-lock.json` is untouched (3 Nov 19:12). This was likely OneDrive sync or an editor re-save. No action needed.
8. **No unsaved or half-finished edits (re-checked 5 Nov):**
   - Every change is written to disk, and today's four requested changes are confirmed in both the source and the built bundle.
   - The project isn't a git repository, and no commit was made.
   - No temporary or backup files exist in the project; working copies were kept outside it.
   - The build passes.
9. **Notebook Run All (5 Nov, 01:50) stopped at cell [57]** with `AttributeError: 'DataFrame' object has no attribute 'shapiro'`:
   - **Cause:** cell [32] assigns a DataFrame to `stats`, overwriting `scipy.stats`.
   - **Effect on cell [57]:** it holds only the error; the earlier Shapiro–Wilk (p = 2.62 × 10⁻⁴) and Levene (58.1611, p = 1.26 × 10⁻²⁵) outputs are gone.
   - **Effect on cell [59]:** it has no execution count, and its ANOVA / Kruskal–Wallis output is from an earlier run.
   - **Execution counts:** they start at 42, so the kernel was not restarted.
   - **EDA and seasonal outputs:** all verified unchanged and pixel-identical. The only exception is the records chart [20], which was re-rendered at 100 dpi instead of about 110 dpi; its content is identical.
   - **Fix:** see §8, "Exact next step".
10. **Zaid bar colour** in the EDA records chart (`#D08A2E`) intentionally differs from the notebook's `#EF6C00`.
11. **Records chart on phones:** at ≤ 390 px the notebook-exact x-axis tick numbers overlap (decision pending, §8).
12. **Histogram titles on phones:** at 320–390 px one wrapped title line extends up to about 16 px past the chart edge and is clipped (decision pending, §8).
13. **`DATA_PROVENANCE.md` and `README.md` don't yet record any of the 4–5 Nov changes** (§5): the notebook-matched charts, removal of all source badges, the Dataset and Seasonal text removals, and the new chart components.
14. **`insights.json` still contains four top-level fields that no page uses any more:**
    - `sampleRows` (replaced by `sampleRowsNotebook`);
    - `datasetNotes` (the removed "Additional dataset checks");
    - `countsByIrrigation` (the removed Irrigation tab);
    - `correlation` (the correlation heatmap now carries cell [28]'s full-precision matrix).

    They're harmless. They were left in place because regenerating the data was out of scope.
