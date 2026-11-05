# AgriInsight: Data Provenance & Accuracy Audit

**Audit date:** 3 November 2026
**Scope:** every KPI, chart, table, statistical result and major finding on all 14 sections of the AgriInsight website
**Sources of truth:** `seasonal_agriculture_performance_dataset.csv` (CSV), `Seasonal_Agriculture_Performance_Analysis.ipynb` (notebook), `Major Project_Seasonal Agriculture Performance Analysis.pdf` (PDF)
**Restrictions observed:** no website code, styling, calculation, data file or source file was modified. This document is the only file created. Every discrepancy is reported here and **none has been corrected**.

---

## 0. Final verdict

> ## ✅ PASS WITH ONE DOCUMENTED EXCEPTION (revision 3, 3 November 2026)
>
> **Revision 3 (current):** at the project owner's request, the website-added **effect-size analysis** (η² = 0.060, ε² = 0.064, the "≈ 6.0% of variation" explanation and the ε² column for the supplementary tests) has been **removed** from the website and the data pipeline. **η² and ε² were never notebook results.** They were extra calculations made by this audit and added to the website in revision 2. Their removal re-opens audit item **C5** (the site reports statistical significance without an effect size), which is recorded as an owner decision, not a resolved issue. All other results are unaffected. See **§9**.
>
> **Revision 2:** all 21 issues from the original audit (A1–A3, B1–B6, C1–C7, D1–D5) were corrected and **re-tested against independent calculations and the rendered website**. See **§8** for the correction log and the evidence for each fix.
>
> - The 1,780 original data values are unchanged and still match the independent recomputation.
> - The 401 notebook output values still match.
> - The new values added for the corrections match separately written implementations (321 at revision 2; 316 remain after the revision 3 removal of 5 effect-size values).
> - 113 of 113 post-fix display checks passed at revision 2. The 6 C5 checks no longer apply after revision 3.
>
> The four categories in §5 remain *inherently* unverifiable: hover tooltips are spot-checked rather than exhaustively rendered, unannotated notebook figures can't be compared numerically, external agronomic statements can't be checked against this data, and the dataset's real-world origin is undocumented. They are not defects, and each is disclosed on the website where relevant.
>
> **Source-file integrity (final verification):** the CSV and PDF are unchanged. The notebook **file** was re-saved outside this work after revision 2 (execution count of the first code cell cleared; 144 bytes smaller), but its cells, outputs and checked figures are identical. See §8.1.
>
> **Revision 1 verdict (original audit): PASS WITH ISSUES.** Sections 1–7 below are the original audit, kept unchanged as a record (except the D1 wording correction noted in §8). Items marked ⚠️ in those sections are resolved in §8, except C5 (see §9). Where η² or ε² appear in §§1–7, they are the audit's own independent calculations, not notebook results and no longer displayed on the website.

---

## 1. How the audit was done

| Layer | Method | Independence |
|---|---|---|
| **A. CSV → data file** | New Python code read the CSV with the standard-library `csv` module, re-implemented the notebook's cleaning with explicit loops, and recomputed **every** value in `website/public/data/insights.json` using NumPy aggregations, then compared them leaf by leaf. A value passes only if the site's number is a correct rounding of the true value. | Did not import, copy or call `website/scripts/build_data.py`. |
| **B. Notebook → data file** | Parsed the **saved outputs** of 19 notebook code cells (printed tables and test results) and compared every printed number with the website's data. | Uses the notebook's own stored outputs, not a re-run. |
| **C. Notebook figures** | Extracted embedded PNGs. The two figures with numbers on their cells (cell[30], cell[48]) were read and compared value by value. | Visual reading of the original figures. |
| **D. What the browser shows** | Headless Chrome rendered all 14 sections in **every toggle state** (25 page states). It captured page text, every SVG chart label, every table cell and every heatmap hover title. These were checked against the **independent** results from layer A using a separate Python re-implementation of the site's number formatting. A residual scan then pulled all 4,536 numeric tokens off the pages and traced each to a recomputed value or classified it (axis tick, year, ID, unit). | Compared against layer A, not against `insights.json`. |
| **E. Source-code review** | Read every page for hard-coded numbers, chart scales and domains, legend labels, units and interpretive text. | Manual. |
| **F. PDF text** | Extracted the PDF text (pypdf) and checked every bullet the site attributes to the brief. | Programmatic, normalised for whitespace and punctuation. |
| **G. Statistical review** | Re-ran all tests and added assumption checks, effect sizes, Welch's ANOVA, post-hoc pairwise tests, sensitivity to imputation, and crop-adjusted correlations. | Independent. These are **supplementary**: none of them is displayed on the website. |

**Notebook references** use `cell[i] In[n]`, where *i* is the 0-based cell index in the `.ipynb` file and *n* is the execution count shown in Jupyter.

**Cleaning applied before all analysis (notebook cell[17] In[11]), reproduced independently:**
- `Rainfall_mm`, `Soil_Moisture_pct`: missing values are replaced by the **median of the same `Season`**.
- `Yield_Tonnes_Ha`: missing values are replaced by the **median of the same `Crop`**.
- No rows or columns are dropped, giving 4,000 rows. "Cleaned data" below means this table.

---

## 2. Headline verification results

| Check | Compared | Matched | Mismatched | Notes |
|---|---:|---:|---:|---|
| A. Data file vs independent recomputation | 1,780 values | **1,780** | 0 | 2 apparent mismatches (−0.0 vs −0.00042) were a comparator artifact: −0.0 is the correct 3-decimal rounding. |
| B. Notebook printed outputs vs data file | 401 values (19 cells) | **401** | 0 | Compared at the coarser of the two printed precisions. |
| C. Annotated notebook figures | 24 values (cell[30]) + 24 (cell[48]) | **48** | 0 | cell[48] duplicates the cell[47] table. |
| D1. Rendered KPI and text strings | 80 | **80** | 0 | |
| D2. Rendered table rows and heatmap hover titles | 144 | **144** | 0 | 3 initial failures traced to the audit tool's own rounding rule (round-half-even vs the site's half-up) and to the "44 t/ha" format quirk (issue B1). Values are correct. |
| D3. Rendered chart data-label sequences | 29 charts or states | **29** | 0 | |
| D4. Correlation heatmap cell labels (2 decimals) | 225 cells | **215** | **10** | Issue A1 (double rounding). |
| D5. Residual scan of all numeric tokens | 4,536 | all traced | 2 | Issues A2 and A3. The rest are axis ticks, years, Farm IDs, units ("1000" in t/1000 m³) or derived percentages. |
| F. PDF-attributed text | 42 items | **41** verbatim | 1 paraphrase | Issue B5. |

**CSV dimensions (verified 3 ways):** 4,001 physical lines (1 header + 4,000 records), 28 header fields, pandas shape (4000, 28). The site shows **4,000 × 28** ✅.

**Derived columns in the CSV (formula checks on all 4,000 rows):**

| Formula | Rows satisfying it |
|---|---|
| `Production_Tonnes = Yield_Tonnes_Ha × Farm_Area_Hectares` (±0.011 t; 3,968 rows with yield present) | 100% |
| `Revenue_INR = Production_Tonnes × Market_Price_INR_Tonne` (within production rounding) | 100% |
| `Profit_INR = Revenue_INR − Total_Cost_INR` (exact) | 100% |
| `Water_Efficiency_t_per_1000m3 = Production_Tonnes ÷ Water_Used_m3 × 1000` (max abs diff 0.0005) | 100% |

---

## 3. Section-by-section source mapping

**Legend.** *NB* = reproduces a notebook analysis (cell cited). *CSV* = an additional calculation the website makes directly from the cleaned CSV; the notebook doesn't contain it. ✅ = verified exact or correct rounding. ⚠️ = issue (see §4).

### 3.1 Home (`/`, `src/pages/Home.tsx`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| Stat strip | 4,000 · 28 · 8 · 8 · 3 · 4 | row count; column count; `nunique` of `State`, `Crop`, `Season`, `Irrigation_Method` | NB cell[4] In[2], cell[9] In[6] | ✅ |
| Season cards: records | 1,779 · 1,627 · 594 | `count(Season = s)` | NB cell[27] In[16] | ✅ |
| Season cards: mean rainfall | 852 · 436 · 299 mm | `mean(Rainfall_mm \| Season)` (cleaned) | NB cell[33] In[19] | ✅ |
| Season cards: mean temperature | 28.5 · 23.5 · 31.0 °C | `mean(Avg_Temperature_C \| Season)` | NB cell[33] In[19] | ✅ |
| Season cards: water efficiency | 5.89 · 5.19 · 4.41 t/1000 m³ | `mean(Water_Efficiency_t_per_1000m3 \| Season)` | NB cell[27] In[16] | ✅ |
| Season cards: mean profit | ₹1.79L · ₹87.7K · −₹24.8K | `mean(Profit_INR \| Season)` | NB cell[43] In[24] | ✅ |
| Rank pills | Strongest / Middle / Weakest | ordering of the means above | NB cell[29] | ✅ |
| Headline: H | 254.3 | Kruskal–Wallis on `Yield_Z` (§3.12) | NB cell[55] In[30] (254.342) | ✅ |
| Headline: p | 5.9 × 10⁻⁵⁶ | same | NB cell[55] (5.894e-56) | ✅ |
| Headline: 8 / 8 | States where Zaid is least profitable | `argmin over seasons of mean(Profit_INR \| State, Season)` | NB cell[48] In[27] | ✅ |
| Headline: 64.5% | Zaid farms making a loss | `mean(Profit_INR < 0 \| Zaid) × 100` | CSV | ✅ |
| Hero cards | ₹1.79L / −₹24.8K | as season cards | NB cell[43] | ✅ |
| Headline text | "statistically significant", "rejects…" | test decision at α = 0.05 | NB cell[55], cell[56] | ✅ ⚠️ C5 (no effect size) |

### 3.2 Problem Statement (`/problem`)

| Element | Source | Result |
|---|---|---|
| Problem-statement quote | PDF §2 | ✅ verbatim |
| 7 "Why it matters" points | PDF §3 | ✅ 7/7 verbatim |
| 12 brief questions | PDF §6 | ✅ 12/12 verbatim |
| 6 focused analytical questions | Notebook cell[0], "Key Analytical Questions" | ⚠️ B6: condensed paraphrases, not verbatim |
| Season definitions (Kharif monsoon-sown, Rabi winter-sown, Zaid summer) | Notebook cell[0] introduction | ✅ |

### 3.3 Objectives (`/objectives`)

| Element | Source | Result |
|---|---|---|
| Objective quote | PDF §4 | ✅ verbatim |
| 10 objectives | PDF §4 | ✅ 10/10 verbatim |
| 11 expected outcomes | PDF §5 | ⚠️ 10/11 verbatim. B5: "based on findings" vs PDF "based on **their** findings" |
| Closing note on expected outcome | Notebook cell[0], "Expected Outcomes" | ✅ paraphrase, labelled as the notebook's |

### 3.4 Project Overview (`/overview`)

| Element | Displayed | Formula / source | Result |
|---|---|---|---|
| KPIs | 4,000 · 8 / 10 · 8 · 4 (+ lists) | counts and unique lists (NB cell[9] In[6]) | ✅ |
| "One row per farm (4,000 unique Farm IDs)" | | `nunique(Farm_ID) = 4000`, 0 duplicates (NB cell[14] In[9]) | ✅ |
| Season descriptions and env line | e.g. "Rainfall 852 mm · Temp 28.5 °C · Humidity 71.8%" | `mean(… \| Season)` (NB cell[33]) | ✅ |
| Donut chart: records per season | 1,779 / 1,627 / 594 | NB cell[20] In[12] | ✅ |
| Season shares | 44.5% · 40.7% · **14.8%** | `count ÷ 4000 × 100` | ⚠️ A3: 594/4000 = 14.85%, conventional rounding 14.9% |
| Variable groups (6) | | Notebook cell[11] markdown | ✅ same groups and columns |
| Tools | Python, Jupyter, pandas, NumPy, Matplotlib, seaborn, SciPy | Notebook cell[1], cell[2] In[1] | ✅ |

### 3.5 Methodology (`/methodology`)

| Element | Source | Result |
|---|---|---|
| 10 workflow stages and § references | Notebook headings §1–§15 (cells 1–60) | ✅ |
| "4,000 × 28" | cell[4] In[2] | ✅ |
| "Sugarcane ≈ 47 t/ha, pulses < 1 t/ha" | cell[23] In[14] (46.95, 0.92) | ✅ |
| "Shapiro–Wilk p ≈ 2.6 × 10⁻⁴" | cell[53] In[29] (2.62e-04) | ✅ |
| "ANOVA F = 127.383, Kruskal–Wallis H = 254.342" | cell[55] In[30] | ✅ |
| Pipeline description (`build_data.py`) | Verified by layers A and B | ✅ |

### 3.6 Dataset & Preprocessing (`/dataset`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| Rows × columns | 4,000 × 28; 6 categorical · 22 numerical | shape; dtype split | NB cell[4], cell[10] In[7] | ✅ |
| Missing values | 120, in 3 columns | `isnull().sum()` | NB cell[14] In[9] | ✅ |
| Duplicate rows / IDs | 0 / 0 | `duplicated()`; `Farm_ID.duplicated()` | NB cell[14] | ✅ |
| Missing after cleaning | 0 | after imputation | NB cell[17] In[11] | ✅ |
| Missing-values bar chart | 48 / 40 / 32 → 0 | `Rainfall_mm`, `Soil_Moisture_pct`, `Yield_Tonnes_Ha` | NB cell[14], cell[17] | ✅ |
| Strategy lines | "48 → 0 missing (1.2%)" etc. | count ÷ 4000 | NB cell[16], cell[17] | ✅ |
| Footnote | "No column is more than 1.2% missing." | max 48/4000 = 1.2% | CSV | ✅ |
| Plausibility checks table (8 rows) | all 0, Pass | range checks on `Humidity_pct`, `Soil_Moisture_pct`, `Disease_Pest_Risk_pct`, `Soil_pH`, `Rainfall_mm`, `Yield_Tonnes_Ha`, `Revenue_INR`, `Total_Cost_INR` | NB cell[15] In[10] | ✅ 8/8 |
| Sample rows table | first 10 raw records, 28 columns | `head(10)` of the raw CSV | CSV (notebook shows `head()` = 5, cell[5] In[3]) | ✅ 10/10 rows |
| Summary-stats table | 22 columns × 8 statistics (raw data) | `describe()` | NB cell[12] In[8] | ✅ 176/176 vs notebook; 22/22 rows rendered correctly |
| Production = Yield × Area | 100% | see §2 formula checks | CSV | ✅ |
| Profit = Revenue − Cost | 100% | | CSV | ✅ |
| Loss-making farms | 49.1% | `mean(Profit_INR < 0) × 100` (raw) | CSV | ✅ |
| District note | "Every one of the 10 districts appears under all 8 states" | `groupby(District).State.nunique()`: min = max = 8 | CSV | ✅ |

### 3.7 Exploratory Data Analysis (`/eda`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| Records chart (Season / Crop / State) | e.g. Rice 690 … Sugarcane 305; states 484–529 | `value_counts()` of `Season`, `Crop`, `State` | NB cell[20] In[12] | ✅ all labels |
| Records chart (Irrigation) | Flood 1,310 · Rainfed 1,041 · Drip 915 · Sprinkler 734 | `value_counts(Irrigation_Method)` | CSV | ✅ |
| Crop × season count heatmap | 24 cells | `crosstab(Crop, Season)` | NB cell[23] In[14] | ✅ 24/24 |
| Yield KPIs | 5.27 t/ha · 1.74 t/ha · 13.35 · 0.3 – 101.4 | `describe(Yield_Tonnes_Ha)` (cleaned) | NB cell[21] In[13] | ✅ ⚠️ B3 (std shown without unit) |
| Yield histogram (all crops) | 50 equal-width bins | `np.histogram(Yield_Tonnes_Ha, 50)` | NB cell[21] (figure) | ✅ 150 values recomputed |
| Yield histogram (excl. sugarcane) | 40 bins | same, `Crop ≠ Sugarcane` | CSV | ✅ 120 values |
| Average yield by crop (log or linear) | 46.95 … 0.92 | `mean(Yield_Tonnes_Ha \| Crop)`, sorted | NB cell[23] | ✅ 8/8 + order |
| "Sugarcane ≈ 50× pulses" | 46.95 / 0.92 = 51 | | derived | ✅ |
| Correlation matrix heatmap | 15 × 15 Pearson r | `corr()` of the 15 columns in NB cell[24] | NB cell[24] In[15] (unannotated figure) | ✅ 225/225 hover values. ⚠️ A1: 10 cell labels off by 0.01 |
| Correlation observation text | r = 0.92, 0.62, 0.55, ≈ 0.52, −0.47 | from the matrix | CSV | ✅ |
| Triad text ("sugarcane alone produces the long tail") | max non-sugarcane yield = 6.08 t/ha | | CSV | ✅ |

### 3.8 Seasonal Performance Analysis (`/seasonal`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| Season cards (9 values) | mean yield, production, water efficiency | `mean(… \| Season)` | NB cell[27] In[16] | ✅ |
| Mean / median bar chart (3 metric toggles) | e.g. 5.63 / 1.95 | `mean`, `median` of `Yield_Tonnes_Ha`, `Production_Tonnes`, `Water_Efficiency_t_per_1000m3` | NB cell[27] | ✅ 18/18 labels |
| Boxplots (3 metric toggles) | Q1, median, Q3, whiskers, mean | Linear quartiles; whiskers = furthest point within 1.5 × IQR; outliers hidden (seaborn default, `showfliers=False`) | NB cell[28] In[17] (figure). Mean marker added by site | ✅ 63 values (hover only, see §5) |
| Summary table | count, mean, median, std × 3 metrics | as above | NB cell[27] | ✅ 36/36 vs notebook; 3/3 rows rendered |
| KPI: mean yield Kharif vs Zaid | +21% | `(5.63 − 4.64) ÷ 4.64` | derived | ✅ ⚠️ D3 (raw yield mixes crops) |
| KPI: median yield Kharif vs Zaid | +34% | `(1.95 − 1.46) ÷ 1.46` | derived | ✅ |
| KPI: water efficiency Kharif vs Zaid | +34% | `(5.89 − 4.41) ÷ 4.41` | derived | ✅ |
| Crop-normalised heatmap | 24 cells, 1.00 = best season | `mean(Yield \| Crop, Season) ÷ max over seasons` | NB cell[30] In[18] | ✅ 24/24 vs notebook figure. ⚠️ A2 (legend), B1 ("44 t/ha") |
| Mean yield by crop and season table | 24 values + best season | `mean(Yield_Tonnes_Ha \| Crop, Season)` | CSV (the notebook only plots the normalised version) | ✅ 8/8 rows |
| Verification note | Kharif best in 8/8 crops; Rabi 0.82–0.91, Zaid 0.63–0.78 | | CSV | ✅ |
| Triad text | "similar spread"; "total production … scale" | | NB cell[29] | ⚠️ C3, C2 |

### 3.9 Environmental Analysis (`/environment`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| 7 small-multiple panels (21 values) | e.g. Rainfall 852 / 436 / 299 mm | `mean(var \| Season)` for `Rainfall_mm`, `Avg_Temperature_C`, `Humidity_pct`, `Soil_Moisture_pct`, `Soil_pH`, `Sunlight_Hours_Day`, `Disease_Pest_Risk_pct` | NB cell[33] In[19], cell[34] In[20] | ✅ 21/21. ⚠️ B4 ("range N%" label) |
| "Rainfall falls by 65%" | `1 − 299.12 ÷ 852.11` | | derived | ✅ |
| Rainfall / temperature boxplots | | as §3.8 boxplot method | CSV | ✅ 42 values |
| Environment–yield correlation bar chart | 7 Pearson r, −0.022 … 0.027 | `corr(var, Yield_Tonnes_Ha)` (raw yield) | NB cell[36] In[21] | ✅ 7/7 + order |
| "Largest \|r\| = 0.027" | | | derived | ✅ |
| Verification note and triads | "negligible", "no meaningful linear relationship with raw yield" | | site interpretation | ✅ numerically. ⚠️ C1, C7 |

### 3.10 Resource Utilization (`/resources`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| KPIs | Zaid 6,420 m³; 4.41 vs 5.89; fertilizer 184.6–187.1 kg/ha; seed 0.82–0.83 | `mean(… \| Season)` of `Water_Used_m3`, `Water_Efficiency_t_per_1000m3`, `Fertilizer_kg_ha`, `Seed_Quality_Score` | NB cell[39] In[22] | ✅ |
| Water used vs efficiency (bars + line) | 6,102 / 5,847 / 6,420 m³; 5.89 / 5.19 / 4.41 | as above | NB cell[40] In[23] | ✅ |
| Water efficiency boxplot | | | NB cell[40] | ✅ |
| Irrigation mix (100% stacked) | e.g. Kharif Flood 33% | `crosstab(Season, Irrigation_Method, normalize='index') × 100` | NB cell[40] (figure) | ✅ 12/12 |
| Fertilizer and pesticide by season | 187.1 / 185.4 / 184.6; 5.08 / 5.02 / 5.17 | `Fertilizer_kg_ha`, `Pesticide_Litre_ha` | NB cell[39] | ✅ (y-axes start at 0, as claimed) |
| Input intensity by crop (toggle) | 8 crops | `mean(Fertilizer_kg_ha \| Crop)`, `mean(Pesticide_Litre_ha \| Crop)` | CSV | ✅ 16/16 + order |
| Water use and efficiency by irrigation method | Drip 5,919 / 6.27 · Flood 8,026 / 3.44 · Rainfed 3,550 / 7.56 · Sprinkler 6,208 / 4.67 | `mean(… \| Irrigation_Method)` | CSV | ✅ 8/8 |
| Triad text | "more is lost to evaporation" | | NB cell[41] | ⚠️ C4 |

### 3.11 Economic & Regional Analysis (`/economics`)

| Element | Displayed | CSV columns · formula | Origin | Result |
|---|---|---|---|---|
| Mean-profit KPIs | ₹1.79L · ₹87.7K · −₹24.8K | `mean(Profit_INR \| Season)` | NB cell[43] In[24] | ✅ |
| Median profit | ₹38,808 · −₹3,187 · −₹62,144 | `median(Profit_INR \| Season)` | NB cell[43] | ✅ |
| Loss share | 42.2% · 51.1% · 64.5% | `mean(Profit_INR < 0 \| Season) × 100` | CSV | ✅ |
| Market price range | ₹44.2K–₹44.9K; "1.4% spread" | `mean(Market_Price_INR_Tonne \| Season)`; (44,851 − 44,212) ÷ 44,212 = 1.45% | NB cell[43]; derived | ✅ |
| Revenue vs cost chart | ₹7.1L / ₹6.0L / ₹5.2L vs ₹5.3L / ₹5.1L / ₹5.4L | `mean(Revenue_INR)`, `mean(Total_Cost_INR)` | NB cell[43], cell[44] In[25] | ✅ |
| Mean and median profit chart | | as above | NB cell[44] | ✅ |
| Profit boxplot | Zaid Q1 −₹2.55L, median −₹62.1K, Q3 ₹62.7K | `Profit_INR` | NB cell[44] | ✅ |
| State × season profit heatmap | 24 cells | `mean(Profit_INR \| State, Season)` | NB cell[47] In[26], cell[48] In[27] | ✅ 24/24 |
| Crop × season profit heatmap | 24 cells | `mean(Profit_INR \| Crop, Season)` | NB cell[50] In[28] | ✅ 24/24 |
| State summary | Kharif best 7/8 · Zaid worst 8/8 | argmax / argmin | NB cell[48] | ✅ |
| Crop summary | Kharif best 8/8 · Zaid worst 8/8 | argmax / argmin | CSV (the notebook doesn't print crop counts) | ✅ |
| Revenue, cost and profit by crop or state | 16 groups × 3 | `mean(… \| Crop)`, `mean(… \| State)` | CSV | ✅ 72 values (hover only) |
| Observation text | ₹44,200–44,900/t; ₹1.79L → ₹0.88L → −₹0.25L | | NB cell[45] | ✅ |
| Verification note (Rabi median) | −₹3,187 | | NB cell[43] vs cell[57] | ✅ |
| Insight text | "leads directly to weaker … profit" | | NB cell[45] | ⚠️ C4 |

### 3.12 Statistical Findings (`/statistics`)

**Standardisation used (NB cell[53] In[29]):** `Yield_Z = (Yield_Tonnes_Ha − mean_crop) ÷ sd_crop`, where the mean and the sample SD (ddof = 1) are computed **within each crop across all seasons**. The tests compare `Yield_Z` between `Season` groups.

| Result | Displayed | Notebook | Independent | Result |
|---|---|---|---|---|
| Shapiro–Wilk (pooled `Yield_Z`, seeded sample n = 500, `random_state=1`) | W = 0.9874, p = 2.62 × 10⁻⁴ | cell[53] | 0.98740, 2.623e-04 | ✅ |
| Levene (SciPy default `center='median'`) | W = 58.16, p = 1.26 × 10⁻²⁵ | cell[53] | 58.1611, 1.263e-25 | ✅ ⚠️ D2 |
| One-way ANOVA | F = 127.383, p = 2.34 × 10⁻⁵⁴ | cell[55] In[30] | 127.383, 2.344e-54 | ✅ |
| Kruskal–Wallis | H = 254.342, p = 5.89 × 10⁻⁵⁶ | cell[55] | 254.342, 5.894e-56 | ✅ |
| Decision at α = 0.05 | Reject H₀ | cell[55] | p < α | ✅ |
| Mean Yield_Z by season (chart) | +0.239 · −0.095 · −0.455 | not printed | recomputed | ✅ (CSV) |
| "About 0.69 SD above Zaid" | 0.239 − (−0.455) | | 0.694 | ✅ (CSV) |
| Findings 1–6 (evidence numbers) | | adapted from cell[57] | all values recomputed | ✅ numerically. Finding 3 corrects the notebook (see §6). ⚠️ C1 (Finding 5 title) |
| Verification summary 1–4 | | | | ✅ (note 2: see C1) |

**Do the conclusions follow?** Yes, for the claim actually tested: crop-adjusted yield differs across seasons.
- Normality is rejected in each season separately as well (Kharif p = 4.3e-15, Rabi 4.1e-12, Zaid 1.1e-5) and in 5 other random samples. Choosing Kruskal–Wallis as the main test is therefore justified.
- Welch's ANOVA, which does not assume equal variances, agrees: F = 152.15, p = 6.6e-62.
- Bonferroni-adjusted pairwise Mann–Whitney tests show **all three pairs differ** (Kharif–Rabi p = 8.1e-23, Kharif–Zaid p = 1.6e-48, Rabi–Zaid p = 9.5e-18). The ordering Kharif > Rabi > Zaid is therefore supported, but the website doesn't show a post-hoc test (C6).
- The result is unchanged if the 32 imputed yields are dropped (H = 253.68).
- The **effect is small to moderate**: η² = 0.060 and ε² = 0.064, so season explains about 6% of the variance in crop-adjusted yield (C5).

### 3.13 Recommendations (`/recommendations`)

| Element | Displayed | Source | Result |
|---|---|---|---|
| Rec 1 evidence | −₹24,805 · −₹62,144 · 64.5% | NB cell[43]; CSV (loss %) | ✅ |
| Rec 2 evidence | 6,419.89 m³ · 4.41 t/1000 m³ | NB cell[39] | ✅ ⚠️ B2 (precision) |
| Rec 3 evidence | Chilli and Sugarcane profitable in Zaid; Maize, Rice, Wheat loss-making in every season | NB cell[50] | ✅. Note: the rationale differs from the notebook's Rec 3 (cell[58]), which says the best season varies by crop. The site deliberately rewrote it (§6, item 3). |
| Rec 3 limitation | 51 Sugarcane and 54 Groundnut Zaid records | `crosstab` (NB cell[23]) | ✅ |
| Rec 4 evidence | 54.47% vs 38.22% | NB cell[33] | ✅ |
| Recommendation wording and limitations | | adapted from NB cell[58] | ✅ |

### 3.14 Conclusion (`/conclusion`)

| Element | Displayed | Source | Result |
|---|---|---|---|
| Headline tiles | ₹1.79L · −₹24.8K · 8/8 · p < 0.05 | NB cell[43], cell[48], cell[55] | ✅ |
| Five summary themes | p = 5.9 × 10⁻⁵⁶; 7/8 states; 8/8 crops | NB cell[60] (adapted) | ✅ numerically. ⚠️ C4 ("likely driver"), C5 ("economically important" but no effect size) |
| Can / cannot conclude | | NB cell[60] | ✅ |
| Limitations table (7 rows) | 594 vs 1,779 / 1,627; 120 imputed; 8 states, 10 districts, 8 crops | NB cell[59] | ✅ |

### 3.15 Shared elements

| Element | Displayed | Result |
|---|---|---|
| Footer | "4,000 records"; "VOIS AICTE Batch 1 (2026–2027)" | ✅ |
| Season labels and order | Kharif, Rabi, Zaid; colours consistent on every chart | ✅ (matches the notebook's `SEASON_ORDER`) |
| Currency | `₹` with Indian grouping (e.g. ₹1,78,915); short forms K = 10³, L = 10⁵ (lakh), Cr = 10⁷ | ✅ consistent |
| Units | mm, °C, %, h/day, kg/ha, L/ha, t/ha, t, m³, t/1000 m³, ₹/t, ₹ per farm | ✅, except B3 |

---

## 4. Issues found (none corrected)

### A. Numeric display mismatches (12 displayed values in total)

| ID | Location | What is shown | What it should be | Cause | Impact |
|---|---|---|---|---|---|
| **A1** | EDA → correlation heatmap. `website/src/pages/EDA.tsx:137` (label format) and `website/scripts/build_data.py:142` (stores r to 3 decimals) | 10 cells (5 symmetric pairs): Rainfall × Fertilizer **.03**, Humidity × Fertilizer **.03**, Sunlight × Profit **−.06**, Nitrogen × Water efficiency **.06**, Potassium × Pesticide **−.01** | .02, .02, −.05, .05, −.00 (true r = 0.02459, 0.02462, −0.05482, 0.05490, −0.00468) | Double rounding: r is rounded to 3 decimals, then rounded again to 2 for the label | Low. Hover text shows the correct 3-decimal r. No finding depends on these cells. |
| **A2** | Seasonal → crop-normalised heatmap legend. `website/src/pages/Seasonal.tsx:119` (scale) and `:123` (labels) | Left legend label **"0.60"** | The colour scale actually starts at **0.55** (`(v − 0.55) / 0.45`); the lowest data value is 0.63 | Hard-coded legend label doesn't match the scale | Low. Cell values are correct; only the legend endpoint is mislabelled. |
| **A3** | Overview → records-per-season share. `website/src/pages/Overview.tsx:75` (and tooltip `:66`) | Zaid **14.8%** | 594 / 4000 = 14.85% exactly, **14.9%** with standard half-up rounding | JavaScript `toFixed(1)` works on the binary value 14.8499… | Low. The three shares still sum to 100.0%. |

### B. Formatting, unit and wording issues

| ID | Location | Issue | Suggested correction |
|---|---|---|---|
| **B1** | `Seasonal.tsx:121`, crop heatmap hover | "Sugarcane · Rabi: **44 t/ha**". Every other cell shows 2 decimals (true value 44.00) | Format with 2 decimals |
| **B2** | `Recommendations.tsx:28`, Rec 2 | "**6,419.89 m³**" while Resources and Statistics show "6,420 m³" for the same value | Use whole m³ consistently |
| **B3** | `EDA.tsx:74`, KPI "Std deviation" | "13.35" has no unit | "13.35 t/ha" |
| **B4** | `Environment.tsx:45`, small-multiple badge | "range 185%" (Rainfall) is ambiguous. The formula is (max season mean − min) ÷ min season mean | Relabel, e.g. "highest season is 185% above lowest" |
| **B5** | `Objectives.tsx:29` | "Provide appropriate recommendations based on findings" | PDF wording is "…based on **their** findings" |
| **B6** | `Problem.tsx`, "Focused analytical questions" | Q1–Q6 are condensed paraphrases of notebook cell[0] (e.g. Q2 drops "(rainfall, temperature, humidity, soil moisture)") but are presented without a paraphrase note | Quote verbatim or mark as paraphrased |

### C. Interpretation issues

| ID | Location | Issue | Evidence | Severity |
|---|---|---|---|---|
| **C1** | `Environment.tsx:111` triad ("the associations are negligible"); `Statistics.tsx:29` Finding 5 title ("farm-level environmental correlations with yield are negligible"); `Statistics.tsx:125` verification note 2; root `README.md:234` | The framing is correct only for **raw** yield, which crop type dominates. Once crop is controlled for (using the same `Yield_Z` as the hypothesis test), environmental variables show **modest, non-negligible** associations, and the notebook's original ranking (rainfall and soil moisture strongest) is actually **supported** on that basis. The site's correction of the notebook is valid for raw-yield numbers but may lead visitors to conclude that environment doesn't matter. | Pearson r with `Yield_Z`: Rainfall +0.215, Soil moisture +0.179, Humidity +0.156, Disease/pest risk +0.130, Sunlight −0.114, pH −0.008, Temperature +0.006. Within season, r(Rainfall, Yield_Z) is −0.157 (Kharif), +0.257 (Rabi), +0.322 (Zaid). | **Medium** |
| **C2** | `Seasonal.tsx:107` triad | "Zaid also has far fewer records (594), so its total production is lower partly because of scale." The chart shows **mean production per farm**, which the number of records doesn't affect. Mean farm area is actually *largest* in Zaid (8.09 ha). The statement is about totals the page doesn't display. Inherited from notebook cell[29]. | Totals: Kharif 82,388 t, Rabi 67,499 t, Zaid 23,098 t. Means 46.31 / 41.49 / 38.89 t per farm. | Low–medium |
| **C3** | `Seasonal.tsx:106` triad | "The boxplots show similar spread in each season", but Levene's test on crop-adjusted yield rejects equal variances (p = 1.26e-25) and Zaid's interquartile range is visibly narrower. | Yield IQR: Kharif ≈ 1.9, Zaid ≈ 1.4 t/ha | Low |
| **C4** | `Economics.tsx:85` ("leads directly to weaker … profit"); `Resources.tsx:77` ("more is lost to evaporation"); `Conclusion.tsx:15` ("Climate … is the likely driver") | Causal or mechanistic language from observational data. The dataset has no evaporation, irrigation-timing or causal-design variables. Inherited from notebook cells [41], [45], [60]. | n/a | Low–medium |
| **C5** | Home headline band; `/statistics`; `Conclusion.tsx:45` ("significant, consistent and economically important") | Only significance is reported. With n = 4,000, significance is easy to reach. **Effect size is not disclosed**: season explains about 6% of the variance in crop-adjusted yield. "Economically important" is supported by the profit gap, not by the yield test. | η² = 0.060, ε² = 0.064 | **Medium** |
| **C6** | `/statistics`, `/seasonal`, `/conclusion` | The full ordering Kharif > Rabi > Zaid is stated after an omnibus test, which only shows that *some* seasons differ. No post-hoc test is shown. The claim **is** supported by an independent post-hoc test, but the website doesn't show that evidence. | Bonferroni Mann–Whitney: all 3 pairs p < 1e-17 | Low |
| **C7** | `Environment.tsx:80` | "Higher pest risk in Kharif fits the greater pest and fungal pressure seen in warm, humid conditions" is external agronomic knowledge, not a finding from this dataset, and isn't marked as such. | n/a | Low |

### D. Assumptions and limitations that should be disclosed to visitors

| ID | Topic | Detail |
|---|---|---|
| **D1** | Dataset origin and realism | The brief doesn't document where the data came from. The data has internal oddities: every one of the 10 districts appears under all 8 states, and **Wheat** (a Rabi crop) has more records in **Kharif** (292) than in Rabi (237), plus its highest yields in Kharif. *(Revision 2 corrected an earlier wording here: 292 of 614 is Wheat's largest season group, not a majority.)* Findings describe **this dataset** and may not reflect real Indian agronomy. |
| **D2** | Test details | Shapiro–Wilk was run on one seeded random sample of 500 pooled `Yield_Z` values. Every alternative sample and every per-season test also rejects normality, so the conclusion is robust. "Levene" is SciPy's default **median-centred** variant (Brown–Forsythe). The classic mean-centred Levene gives W = 62.62, p = 1.7e-27, the same conclusion. |
| **D3** | Raw-yield comparisons | Raw means mix crops on very different scales. "Mean yield +21% (Kharif vs Zaid)" becomes **+37%** when sugarcane is excluded, partly because Zaid has the largest sugarcane share (8.6% vs 7.0% in Kharif). The crop-adjusted test is the reliable comparison. |
| **D4** | Untested differences | Profit and water efficiency were compared only descriptively (the site's Conclusion discloses this). Supplementary Kruskal–Wallis tests, **not shown on the site**, would support both: profit H = 101.9, p = 7.4e-23; water efficiency H = 56.8, p = 4.6e-13. |
| **D5** | Imputation | 120 values (1% of the 12,000 cells in those three columns; at most 1.2% of any one column) were filled with group medians. Sensitivity check: dropping the 32 imputed yields leaves the test essentially unchanged (H = 253.68, p = 8.2e-56; Yield_Z means +0.239 / −0.096 / −0.457). |
| Already disclosed on site | Observational and cross-sectional data, no causal claims, unequal season sizes, 8 states and 8 crops only, risk score ≠ realised loss | ✅ Conclusion → Limitations (from notebook cell[59]) |

---

## 5. Items that could not be fully verified

| Item | What was done | Why not fully verified |
|---|---|---|
| Recharts hover tooltips (all bar, line and pie charts) and boxplot hover panels | The underlying values (all 1,780) were verified, and the tooltip formatting code was reviewed | Tooltips exist only while hovering and weren't rendered individually for every bar. A spot check of one tooltip (Seasonal, Kharif: "Mean 5.63 t/ha, Median 1.95 t/ha") matched. |
| Notebook figures without numeric annotations (cells [20], [21], [28], [34], [40], [44]) | Their underlying aggregates were verified through printed outputs and recomputation | No pixel-level comparison of bar heights was made. |
| External or agronomic statements (season definitions, pest pressure in humid conditions, evaporation) | Checked for consistency with the data | They can't be verified from the dataset (see C7, C4). |
| Real-world validity of the CSV | Internal consistency verified (§2 formula checks) | The data's provenance isn't documented (see D1). |

---

## 6. Status of the four discrepancies listed in the README

| # | Claim | Re-verification |
|---|---|---|
| 1 | Notebook Finding 3 (cell[57]) says Rabi's median profit is positive | ✅ **Confirmed.** The notebook's own cell[43] output gives −3,187. |
| 2 | Notebook §7 (cell[37]) calls rainfall and soil moisture the strongest yield correlates | ✅ **Confirmed for raw yield** (all \|r\| < 0.03; soil moisture 4th of 5 positive, 6th of 7 by magnitude). ⚠️ **Needs qualification (C1):** against crop-adjusted yield, rainfall (+0.215) and soil moisture (+0.179) *are* the two strongest positive correlates. |
| 3 | Notebook §6 (cell[31]) and Rec 3 (cell[58]) say the best season varies by crop | ✅ **Confirmed.** Kharif is the best season for both yield and profit in 8/8 crops, and Zaid the worst in 8/8. |
| 4 | District labels don't map to consistent states | ✅ **Confirmed.** All 10 districts appear under all 8 states (min = max = 8). |

**Additional notebook text inconsistencies found (the website does not repeat these):**
- cell[37] says sunlight "shows a mild negative correlation". Soil pH (−0.022) is the stronger negative; sunlight is −0.015.
- cell[25] refers to `Production_Tonnes` and `Revenue_INR` as related variables in the correlation heatmap, but neither column is among the 15 variables plotted in cell[24].

---

## 7. Summary counts

| Measure | Count |
|---|---|
| **KPIs and headline values audited** | **70** (Home 27, Overview 7, Dataset 7, EDA 4, Seasonal 12, Resources 4, Economics 4, Statistics 1, Conclusion 4) |
| **Charts audited** | **33** distinct visualisations (46 chart states including toggles), across 25 rendered page states |
| **Tables audited** | **7** (plausibility, sample rows, summary statistics, seasonal summary, crop × season yield, test results, limitations) |
| **Statistical results audited** | **245** (4 test statistics + 4 p-values + 1 decision + 3 Yield_Z means + 1 effect-size statement + 225 correlation cells + 7 environment–yield correlations) |
| **Data-file values independently recomputed** | 1,780 → **1,780 match** |
| **Notebook printed values compared** | 401 → **401 match** (+ 48 annotated figure values, all match) |
| **Rendered checks** | 80/80 KPI strings · 144/144 table rows and heatmap titles · 29/29 chart label sequences · 215/225 correlation labels |
| **PDF-attributed text** | 41/42 verbatim (1 paraphrase) |
| **Numeric mismatches** | **3 issues affecting 12 displayed values** (A1: 10, A2: 1, A3: 1). **0** in the data file, **0** against the notebook, **0** affecting any finding |
| **Other issues** | 6 formatting or wording (B1–B6) · 7 interpretation (C1–C7) · 5 disclosure gaps (D1–D5) |
| **Could not be fully verified** | 4 categories (§5) |
| **Fabricated or illustrative values presented as results** | **0** found. The hero illustration and section artwork are decorative and contain no data. |

## Revision 1 verdict: **PASS WITH ISSUES** (superseded by §8)

All data shown on the AgriInsight website is genuinely derived from the CSV and agrees with the notebook. The issues are a few display-rounding defects, wording and formatting inconsistencies, some interpretive statements that go beyond the observational data, and missing disclosures. The two most important for academic reliability are the missing effect size (C5) and the incomplete environmental-correlation framing (C1).

---

## 8. Revision 2: corrections and re-verification

### 8.1 How the corrections were made

- **No existing value or calculation was changed.** New statistics were added to `website/scripts/build_data.py` as **new keys only**, in a clearly marked block. After regeneration, all **1,780** pre-existing values in `insights.json` were compared with a backup taken before the fixes: **1,780 identical, 0 changed, 0 removed**.
- **New keys:** `correlation.matrix2`, `countsBySeason[].sharePct`, `comparisons`, `envYieldZCorr`, `envYieldZWithinSeason`, and `stats.effect` *(removed in revision 3, see §9)*, `stats.shapiroBySeason`, `stats.leveneMean`, `stats.welch`, `stats.posthoc`, `stats.supplementary`, `stats.sensitivity`. None of these analyses is in the notebook, and each is labelled "Computed from dataset" or "added on this website" where it appears.
- **No new number is hard-coded** in page code. Displayed values are read from the data file, and derived percentages are computed from **unrounded** values in Python, then rounded once (half-up).
- No step of this work wrote to the original CSV, notebook or PDF; every script opens them read-only. At the end of revision 2 all three were unchanged (665,162 / 831,564 / 205,569 bytes, dated 2 November 2026).
- **Final verification note (later on 3 November 2026):** the CSV and PDF are still unchanged (665,162 and 205,569 bytes, dated 2 November 2026), but the **notebook file was re-saved outside this work** at 21:00:56 on 3 November 2026. It is now 831,420 bytes, and the first code cell's execution count is blank instead of `In[1]`. Its **content is unchanged**:
  - every cell's source and every text output matches a text extract taken at the start of the project;
  - the three figures compared (cells [24], [30], [48]) are byte-identical;
  - all 401 printed values still match the website.

  The original file bytes can't be restored from this work, because no binary backup was taken. OneDrive version history should still hold the 2 November copy.

### 8.2 Correction log

| ID | Correction | Files changed | Re-test evidence | Status |
|---|---|---|---|---|
| **A1** | Correlation cell labels now use `matrix2`, which rounds the **full-precision** r to 2 decimals (half-up) instead of re-rounding the 3-decimal value. Hover still shows 3 decimals. The subtitle now explains both. | `build_data.py`, `EDA.tsx` | All **225/225** rendered cell labels equal the correct 2-decimal rounding of the true r. The 5 previously wrong pairs now show .02, .02, −.05, .05, .00. | ✅ Resolved |
| **A2** | Seasonal heatmap: the colour scale and legend now come from one constant (`NORM_LO = 0.6`), and the legend reads "0.60 (relative yield)". The EDA count heatmap legend now shows its true numeric range ("0" to "314 records", with the scale set to the actual maximum) instead of "Fewer / More records". | `Seasonal.tsx`, `EDA.tsx` | Rendered legend text verified; source check confirms scale and label share the constant | ✅ Resolved |
| **A3** | Season shares are computed as exact count ratios rounded half-up in Python (`sharePct`): 44.5% / 40.7% / **14.9%**. A footnote notes the shares may not total exactly 100%. | `build_data.py`, `Overview.tsx` | Rendered "Zaid · 14.9%" (3/3 shares checked against exact fractions) | ✅ Resolved |
| **B1** | Heatmap hover yields are always formatted to 2 decimals ("44.00 t/ha"). | `Seasonal.tsx` | 24/24 hover titles verified | ✅ Resolved |
| **B2** | Rec 2 shows "6,420 m³", consistent with other pages. Rec 4 risk percentages are formatted consistently too. | `Recommendations.tsx` | Rendered "6,420 m³"; "6,419.89" absent | ✅ Resolved |
| **B3** | Std deviation KPI shows "13.35 t/ha". | `EDA.tsx` | Rendered | ✅ Resolved |
| **B4** | Badge now reads "highest season +184.9% vs lowest" (or "seasons differ by < 1%" for soil pH), computed from unrounded means. The section subtitle explains the measure. | `build_data.py`, `Environment.tsx` | 7/7 badges verified against independent values; "range 185%" absent | ✅ Resolved |
| **B5** | "…based on **their** findings" (PDF wording). | `Objectives.tsx` | PDF fidelity re-run: **42/42** items verbatim | ✅ Resolved |
| **B6** | The six questions are now quoted verbatim from notebook cell[0] and labelled as quotations. | `Problem.tsx` | 6/6 questions extracted from cell[0] and found verbatim on the page | ✅ Resolved |
| **C1** | Environment: new **Raw yield / Crop-adjusted yield** toggle on the correlation chart, plus a new **within-season** correlation table. The verification note, triad, Statistics Finding 5 and verification note 2, the Conclusion theme and root `README.md` now separate the two bases: raw-yield correlations are negligible; crop-adjusted ones are modest (rainfall +0.215, soil moisture +0.179) and **mostly reflect differences between seasons** (within-season soil moisture −0.019 to +0.058; rainfall −0.157 to +0.322). | `build_data.py`, `Environment.tsx`, `Statistics.tsx`, `Conclusion.tsx`, `README.md` | Crop-adjusted chart labels, all 7 within-season rows and the note figures verified; 7 + 21 values independently recomputed; old "negligible" wording absent | ✅ Resolved |
| **C2** | The total-production/scale claim was removed. The page now explains that these are per-farm averages, which Zaid's record count does not affect, and that Zaid farms are not smaller (mean area 8.09 ha vs 7.94 ha in Kharif). | `build_data.py`, `Seasonal.tsx` | Old phrase absent; farm-area figures verified | ✅ Resolved |
| **C3** | "Similar spread" replaced with the actual IQRs (Kharif 1.92, Rabi 1.73, Zaid 1.43 t/ha) and a reference to Levene's result. | `build_data.py`, `Seasonal.tsx` | IQRs independently recomputed; rendered | ✅ Resolved |
| **C4** | Causal or mechanistic wording replaced with association or accounting language in Economics ("leads directly"), Resources ("lost to evaporation"), Conclusion ("likely driver", "strongly shapes"), the Seasonal insight ("limiting factor"), EDA ("driven by"), Dataset ("what drives"), Recommendations ("outsized") and Environment ("higher-risk, higher-reward"). Revenue statements now say the gap *arithmetically* reflects production, because revenue = production × price in the data. | `Economics.tsx`, `Resources.tsx`, `Conclusion.tsx`, `Seasonal.tsx`, `EDA.tsx`, `Dataset.tsx`, `Recommendations.tsx`, `Environment.tsx` | 8/8 old phrases confirmed absent from rendered pages, plus a source-wide grep for causal terms | ✅ Resolved |
| **C5** | Effect size added: **η² = 0.060** (≈ 6.0% of variance) and ε² = 0.064. A new "How large is the seasonal effect?" block explains that significance ≠ a large effect, with benchmarks (0.01 / 0.06 / 0.14). The value appears on Home (it replaces the loss-share tile, which remains on Economics), on Statistics (KPIs and Finding 2), in the Conclusion headline (now "significant and consistent but modest in size") and in a new Effect-size limitation row. | `build_data.py`, `Statistics.tsx`, `Home.tsx`, `Conclusion.tsx` | η² recomputed independently from statsmodels OLS sums of squares; ε² recomputed; rendered on 3 pages; "economically important" absent | ↩️ **Reverted in revision 3** at the project owner's request (see §9) |
| **C6** | New post-hoc section: **Dunn's test** (tie-corrected, Bonferroni ×3). Kharif–Rabi z = 9.68, p_adj = 1.11 × 10⁻²¹; Kharif–Zaid z = 15.24, p_adj = 5.75 × 10⁻⁵²; Rabi–Zaid z = 8.14, p_adj = 1.20 × 10⁻¹⁵. It explains the method and its limitations (compares rank distributions, not means; unequal shapes; Bonferroni conservative; not in the notebook). Welch's ANOVA was added to the test table. | `build_data.py`, `Statistics.tsx` | Dunn's test re-implemented separately (pandas ranks, explicit tie formula): all z, p, p_adj and rank differences match. Bonferroni Mann–Whitney cross-check: all 3 pairs significant. Welch's ANOVA matches statsmodels `anova_oneway` (F = 152.15, df₂ = 1,851.6) | ✅ Resolved |
| **C7** | External agronomic context is now explicitly labelled on Environment ("External agronomic context (not tested here)"), on Overview (season definitions marked as context from the notebook introduction) and in Recommendations 2 and 4 (practices marked as general agronomic advice, not tested in this dataset). | `Environment.tsx`, `Overview.tsx`, `Recommendations.tsx` | 3/3 labels rendered | ✅ Resolved |
| **D1** | Dataset-origin disclosure added to Dataset (new note) and Conclusion (new limitation row). It says the brief doesn't document the source, lists the district and Wheat anomalies, and states that findings describe this dataset only, not real farms. No real-world origin is claimed. | `Dataset.tsx`, `Conclusion.tsx` | Rendered; Wheat counts (292 vs 237) verified | ✅ Resolved |
| **D2** | The test table now says Levene is **median-centred (Brown–Forsythe)** and reports the classic mean-centred result (W = 62.62, p = 1.67 × 10⁻²⁷). Shapiro–Wilk notes the seeded sample and reports per-season results (all p < 2 × 10⁻⁵). Methodology was updated too. | `build_data.py`, `Statistics.tsx`, `Methodology.tsx` | Per-season Shapiro and mean-centred Levene independently recomputed; rendered | ✅ Resolved |
| **D3** | New note on Seasonal: sugarcane share by season (7.0 / 7.9 / 8.6%), the ex-sugarcane gap **+37.3%** vs the raw +21.3%, and a pointer to the crop-adjusted test. The KPIs are labelled "raw yield, all crops" and computed from unrounded means. | `build_data.py`, `Seasonal.tsx` | All values independently recomputed and rendered | ✅ Resolved |
| **D4** | New "Supplementary tests and sensitivity" table: Kruskal–Wallis on profit (H = 101.9, p = 7.36 × 10⁻²³) and on water efficiency (H = 56.8, p = 4.61 × 10⁻¹³). *(Revision 2 also showed ε² = 0.025 and 0.014; that column was removed in revision 3.)* Both are labelled not crop-adjusted and not in the notebook. The Conclusion "Testing scope" row was updated and the Economics profit chart footnote now points to the test. | `build_data.py`, `Statistics.tsx`, `Conclusion.tsx`, `Economics.tsx` | Independently recomputed; rendered | ✅ Resolved |
| **D5** | Imputation sensitivity reported on Statistics (table row), Dataset (cleaning card) and in the Conclusion limitation: without the 32 imputed yields, H = 253.68, p = 8.19 × 10⁻⁵⁶, with Yield_Z means essentially unchanged. | `build_data.py`, `Statistics.tsx`, `Dataset.tsx`, `Conclusion.tsx` | Independently recomputed; rendered | ✅ Resolved |

**Other consistency fixes made during revision 2:**
- Price spread computed from data ("1.45%"; previously a hard-coded "1.4%").
- Rainfall drop computed from unrounded means ("64.9%").
- Seasonal KPI percentages shown to 1 decimal (+21.3%, +34.0%, +33.5%). Showing the unrounded 33.46% water-efficiency gap as a whole number would round it twice.
- Even ticks on the Yield_Z axis (−0.6 to 0.4 in steps of 0.2).
- Explicit 2-decimal formatters on chart labels that relied on default number printing.
- Economics heatmap legend labelled "mean profit".
- Methodology lists all website-added analyses.

### 8.3 Re-verification results (after all changes)

| Check | Result |
|---|---|
| Original 1,780 data values vs independent recomputation | **1,780/1,780** (the 2 flags are the −0.0 comparator artifact described in §2) |
| Original 1,780 values vs pre-fix backup | **1,780 identical**, 0 changed |
| Notebook printed outputs (19 cells) | **401/401** |
| New fields vs separately written implementations | **321/321** at revision 2 (statsmodels for Welch's ANOVA and η²; separate Dunn's test; exact fractions for shares). The 5 effect-size values among them (η², ε², variance %, two supplementary ε²) were removed in revision 3 |
| Post-fix rendered checks (every correction A1–D5) | **113/113** |
| Chart data-label sequences | 29/29 |
| Residual scan of every number on every page (5,016 tokens) | All traced to recomputed values or classified (axis ticks, units, IDs, years, legend constants, p-value mantissas whose full strings are verified separately) |
| PDF-attributed text | **42/42** verbatim |
| Production build (`npm run build`, including the TypeScript check) | ✅ No errors |
| Functional QA, desktop 1440 px and mobile 390 px | All 14 sections and the 404 page render. **0** console errors or warnings, **0** horizontal page overflow. Header dropdowns, mobile drawer, prev/next pager, every toggle (including the new Raw / Crop-adjusted toggle) and the data-loading error state all work. Tooltips verified on 3 charts at both sizes. |

### 8.4 Items that remain unverifiable (disclosed, not defects)

1. **Hover tooltips:** the underlying values are 100% verified and tooltips were rendered on 4 charts across QA runs, but not exhaustively for every bar.
2. **Unannotated notebook figures** (cells [20], [21], [28], [34], [40], [44]): their aggregates are verified, but there was no pixel-level comparison.
3. **External agronomic context** (season definitions, pest pressure in humid conditions, evaporation, suggested farm practices): these can't be tested against this dataset and are now labelled as such on the site.
4. **The dataset's real-world origin** is undocumented; the website now discloses this (D1) and makes no claim about actual farms.

## Final overall verdict (revision 2): **PASS** *(superseded by revision 3, see §9)*

Every issue reported in the original audit has been corrected and re-tested against independent calculations and the rendered pages. No verified value or calculation was changed. The remaining unverifiable items are inherent to the source material and are disclosed to visitors.

---

## 9. Revision 3: removal of the effect-size analysis (owner decision)

### 9.1 What was removed

The project owner asked for the website-added effect-size analysis to be removed. **η² and ε² do not come from the notebook:** the notebook reports Shapiro–Wilk, Levene, one-way ANOVA and Kruskal–Wallis only (cells [53] and [55]). The effect sizes were calculated by this audit and added to the website in revision 2 (item C5).

| Location | Removed |
|---|---|
| Home, headline result band | The "η² = 0.060 · Effect size: about 6.0% of variation" tile, and the sentence "The effect is modest: season accounts for about 6.0% of the variation in crop-adjusted yield (η² = 0.060)". The remaining three tiles are unchanged; the 8/8 tile now spans the second row so the 2-column grid has no gap. |
| Statistical Findings | The whole "How large is the seasonal effect?" block: the η² KPI, the ε² KPI, the "Kharif vs Zaid, mean Yield_Z" KPI that sat in that block, and the "Statistically significant does not mean large" note. Also: "and how large it is" in the lede and question; the η² sentence and "the effect is real but modest" meaning in Finding 2 (its title is back to "…is statistically significant."); "The effect is modest in size (η² = 0.060)" in *Meaning in context*; the "Effect size" (ε²) column of the supplementary-tests table; "but their effect sizes are small" beneath it. |
| Conclusion | The η² headline tile (the 8/8 tile now spans its row); "but modest in size" in the headline sentence; "although it explains only a modest share…" in the lede; the η² sentence in the Seasonal-differences theme; the "Effect size" limitations row; "with small effect sizes" in the Testing-scope row (now "without crop adjustment"). |
| Methodology | "effect sizes (η², ε²)" removed from the list of website-added analyses. |
| Data pipeline | `stats.effect` (`eta2`, `epsilon2`, `variancePct`) and `stats.supplementary.*.epsilon2` are no longer computed or written. The corresponding TypeScript types were removed. |

**Not removed:** the Yield_Z chart footnote "Kharif farms sit about 0.69 standard deviations above Zaid farms of the same crop." It predates revision 2 (it was part of the original site) and states the difference between the two bars plotted on that chart; it is not the η² analysis. No replacement metric or new calculation was introduced.

### 9.2 Preserved

- Notebook results, unchanged on the website:
  - Shapiro–Wilk W = 0.9874, p = 2.62 × 10⁻⁴
  - Levene W = 58.16, p = 1.26 × 10⁻²⁵
  - One-way ANOVA F = 127.383, p = 2.34 × 10⁻⁵⁴
  - Kruskal–Wallis H = 254.342, p = 5.89 × 10⁻⁵⁶
  - decision "Reject H₀"
- Home headline: **H = 254.3**, **p = 5.9 × 10⁻⁵⁶**, **8 / 8** states.
- All other revision-2 additions remain, each labelled as added on this website: Welch's ANOVA, Dunn's post-hoc test, crop-adjusted and within-season correlations, supplementary Kruskal–Wallis tests (statistics and p-values), the imputation sensitivity check, and all disclosures.

### 9.3 Verification

| Check | Result |
|---|---|
| Data file before vs after | Only `stats.effect` and the two `supplementary.*.epsilon2` fields removed. **2,120** other values identical, 0 changed, 0 added |
| Rendered text, all 14 sections and every toggle state | No "η²", "ε²", "eta/epsilon squared", "effect size", "6.0% of", "94.0%", "How large", "modest in size" or "modest share" remains |
| Protected results on the rendered pages | Home 4/4 (H = 254.3, p = 5.9 × 10⁻⁵⁶, 8 / 8 and its label); Statistics 11/11 (all four notebook tests' statistics, p-values, verdicts and the decision); Conclusion 2/2 |
| `npm run build` | ✅ No errors |
| Route QA, desktop 1440 px and mobile 390 px | All 14 sections and the 404 page work. 0 console errors, 0 horizontal overflow. The Home and Conclusion headline bands render as a 2 + 1 tile grid |
| CSV, notebook, PDF | Not modified by this change (CSV 665,162 bytes and PDF 205,569 bytes, both dated 2 Nov; notebook still at the 831,420-byte outside re-save recorded in §8.1) |

### 9.4 Effect on the audit verdict

Audit item **C5** found that the website reported statistical significance without an effect size. With the effect size removed at the owner's request, **C5 is open again**. It is recorded here as an owner decision. Every other audit item remains resolved as documented in §8. For context only (not displayed on the website), the audit's own calculation gave η² = 0.060, meaning season accounts for about 6% of the variance in crop-adjusted yield.

## Final overall verdict (revision 3): **PASS WITH ONE DOCUMENTED EXCEPTION (C5, owner decision)**

