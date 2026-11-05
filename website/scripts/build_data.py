"""
Builds website/public/data/insights.json from the original project CSV.

It reproduces the exact cleaning and analysis steps from
Seasonal_Agriculture_Performance_Analysis.ipynb, so every number shown on the
website comes from the dataset. The CSV, notebook and PDF are only read,
never modified.

Run from the website folder:  python scripts/build_data.py
"""
import json
from decimal import Decimal, ROUND_HALF_UP
import os
import sys

import numpy as np
import pandas as pd
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CSV = os.path.join(ROOT, "seasonal_agriculture_performance_dataset.csv")
OUT = os.path.join(HERE, "..", "public", "data", "insights.json")

SEASONS = ["Kharif", "Rabi", "Zaid"]


def r(x, n=2):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    return round(float(x), n)


def box(series):
    """Boxplot stats matching seaborn's default (whis=1.5, fliers hidden)."""
    s = series.dropna().sort_values()
    q1, med, q3 = s.quantile([0.25, 0.5, 0.75])
    iqr = q3 - q1
    lo = s[s >= q1 - 1.5 * iqr].min()
    hi = s[s <= q3 + 1.5 * iqr].max()
    return {"min": r(lo), "q1": r(q1), "median": r(med), "q3": r(q3), "max": r(hi),
            "mean": r(s.mean()), "n": int(s.size)}


def main():
    raw = pd.read_csv(CSV)
    out = {}

    # ---------------- Dataset overview (raw) ----------------
    cat_cols = raw.select_dtypes(include=["object", "string"]).columns.tolist()
    num_cols = raw.select_dtypes(include=np.number).columns.tolist()
    missing = raw.isnull().sum()
    out["overview"] = {
        "rows": int(raw.shape[0]),
        "columns": int(raw.shape[1]),
        "states": sorted(raw["State"].unique().tolist()),
        "districts": sorted(raw["District"].unique().tolist()),
        "crops": sorted(raw["Crop"].unique().tolist()),
        "irrigation": sorted(raw["Irrigation_Method"].unique().tolist()),
        "seasons": SEASONS,
        "categorical": cat_cols,
        "numerical": num_cols,
        "missing": {k: int(v) for k, v in missing[missing > 0].sort_values(ascending=False).items()},
        "duplicateRows": int(raw.duplicated().sum()),
        "duplicateIds": int(raw["Farm_ID"].duplicated().sum()),
        "totalMissing": int(missing.sum()),
    }
    desc = raw.describe().T
    out["describe"] = [
        {"column": c, "count": int(desc.loc[c, "count"]), "mean": r(desc.loc[c, "mean"]),
         "std": r(desc.loc[c, "std"]), "min": r(desc.loc[c, "min"]), "q1": r(desc.loc[c, "25%"]),
         "median": r(desc.loc[c, "50%"]), "q3": r(desc.loc[c, "75%"]), "max": r(desc.loc[c, "max"])}
        for c in desc.index
    ]
    out["sampleRows"] = json.loads(raw.head(10).to_json(orient="records"))

    checks = {
        "Humidity_pct outside 0–100": int(((raw["Humidity_pct"] < 0) | (raw["Humidity_pct"] > 100)).sum()),
        "Soil_Moisture_pct outside 0–100": int(((raw["Soil_Moisture_pct"] < 0) | (raw["Soil_Moisture_pct"] > 100)).sum()),
        "Disease_Pest_Risk_pct outside 0–100": int(((raw["Disease_Pest_Risk_pct"] < 0) | (raw["Disease_Pest_Risk_pct"] > 100)).sum()),
        "Soil_pH outside 0–14": int(((raw["Soil_pH"] < 0) | (raw["Soil_pH"] > 14)).sum()),
        "Negative Rainfall_mm": int((raw["Rainfall_mm"] < 0).sum()),
        "Negative Yield_Tonnes_Ha": int((raw["Yield_Tonnes_Ha"] < 0).sum()),
        "Negative Revenue_INR": int((raw["Revenue_INR"] < 0).sum()),
        "Negative Total_Cost_INR": int((raw["Total_Cost_INR"] < 0).sum()),
    }
    out["plausibilityChecks"] = [{"check": k, "invalid": v} for k, v in checks.items()]

    # Extra dataset observations (computed here, not stated in the notebook)
    d2s = raw.groupby("District")["State"].nunique()
    full = raw.dropna(subset=["Yield_Tonnes_Ha"])
    out["datasetNotes"] = {
        "districtsInMultipleStates": int((d2s > 1).sum()),
        "maxStatesPerDistrict": int(d2s.max()),
        "productionMatchesYieldXArea": r(
            (np.isclose(full["Production_Tonnes"], full["Yield_Tonnes_Ha"] * full["Farm_Area_Hectares"], atol=0.011)).mean() * 100, 1),
        "profitMatchesRevenueMinusCost": r(
            ((raw["Revenue_INR"] - raw["Total_Cost_INR"]) == raw["Profit_INR"]).mean() * 100, 1),
        "lossMakingFarmsPct": r((raw["Profit_INR"] < 0).mean() * 100, 1),
    }

    # ---------------- Cleaning (exactly as notebook) ----------------
    df = raw.copy()
    before = {c: int(df[c].isnull().sum()) for c in ["Rainfall_mm", "Soil_Moisture_pct", "Yield_Tonnes_Ha"]}
    df["Rainfall_mm"] = df.groupby("Season")["Rainfall_mm"].transform(lambda s: s.fillna(s.median()))
    df["Soil_Moisture_pct"] = df.groupby("Season")["Soil_Moisture_pct"].transform(lambda s: s.fillna(s.median()))
    df["Yield_Tonnes_Ha"] = df.groupby("Crop")["Yield_Tonnes_Ha"].transform(lambda s: s.fillna(s.median()))
    out["cleaning"] = {
        "before": before,
        "after": {c: int(df[c].isnull().sum()) for c in before},
        "remainingMissing": int(df.isnull().sum().sum()),
        "strategy": {
            "Rainfall_mm": "Median of same Season",
            "Soil_Moisture_pct": "Median of same Season",
            "Yield_Tonnes_Ha": "Median of same Crop",
        },
    }

    # ---------------- EDA ----------------
    out["countsBySeason"] = [{"season": s, "count": int((df["Season"] == s).sum())} for s in SEASONS]
    out["countsByCrop"] = [{"crop": k, "count": int(v)} for k, v in df["Crop"].value_counts().items()]
    out["countsByState"] = [{"state": k, "count": int(v)} for k, v in df["State"].value_counts().items()]
    out["countsByIrrigation"] = [{"method": k, "count": int(v)} for k, v in df["Irrigation_Method"].value_counts().items()]
    ct = pd.crosstab(df["Crop"], df["Season"])[SEASONS]
    out["cropSeasonCounts"] = [{"crop": c, **{s: int(ct.loc[c, s]) for s in SEASONS}} for c in ct.index]

    counts, edges = np.histogram(df["Yield_Tonnes_Ha"], bins=50)
    out["yieldHistogram"] = [{"x0": r(edges[i]), "x1": r(edges[i + 1]), "count": int(counts[i])} for i in range(50)]
    ns = df.loc[df["Crop"] != "Sugarcane", "Yield_Tonnes_Ha"]
    counts2, edges2 = np.histogram(ns, bins=40)
    out["yieldHistogramNoSugarcane"] = [{"x0": r(edges2[i]), "x1": r(edges2[i + 1]), "count": int(counts2[i])} for i in range(40)]
    yd = df["Yield_Tonnes_Ha"].describe()
    out["yieldDescribe"] = {k: r(v, 3) for k, v in yd.items()}
    out["yieldByCrop"] = [{"crop": k, "yield": r(v)} for k, v in
                          df.groupby("Crop")["Yield_Tonnes_Ha"].mean().sort_values(ascending=False).items()]

    corr_cols = ["Yield_Tonnes_Ha", "Rainfall_mm", "Avg_Temperature_C", "Humidity_pct",
                 "Sunlight_Hours_Day", "Soil_pH", "Soil_Moisture_pct", "Nitrogen_kg_ha",
                 "Phosphorus_kg_ha", "Potassium_kg_ha", "Fertilizer_kg_ha",
                 "Pesticide_Litre_ha", "Water_Efficiency_t_per_1000m3",
                 "Disease_Pest_Risk_pct", "Profit_INR"]
    cm = df[corr_cols].corr()
    out["correlation"] = {"columns": corr_cols, "matrix": [[r(cm.iloc[i, j], 3) for j in range(len(corr_cols))] for i in range(len(corr_cols))]}

    # ---------------- Seasonal performance ----------------
    perf = []
    for s in SEASONS:
        g = df[df["Season"] == s]
        row = {"season": s, "count": int(len(g))}
        for col, key in [("Yield_Tonnes_Ha", "yield"), ("Production_Tonnes", "production"),
                         ("Water_Efficiency_t_per_1000m3", "waterEff")]:
            row[key] = {"mean": r(g[col].mean()), "median": r(g[col].median()), "std": r(g[col].std())}
        perf.append(row)
    out["seasonalPerformance"] = perf

    boxes = {}
    for col in ["Yield_Tonnes_Ha", "Production_Tonnes", "Water_Efficiency_t_per_1000m3", "Profit_INR",
                "Rainfall_mm", "Avg_Temperature_C", "Water_Used_m3"]:
        boxes[col] = [{"season": s, **box(df.loc[df["Season"] == s, col])} for s in SEASONS]
    out["boxes"] = boxes

    csy = df.groupby(["Crop", "Season"])["Yield_Tonnes_Ha"].mean().unstack()[SEASONS]
    norm = csy.div(csy.max(axis=1), axis=0)
    out["cropSeasonYield"] = [{"crop": c, **{s: r(csy.loc[c, s]) for s in SEASONS},
                               "norm": {s: r(norm.loc[c, s]) for s in SEASONS},
                               "best": csy.loc[c].idxmax()} for c in csy.index]

    # ---------------- Environmental ----------------
    env_cols = ["Rainfall_mm", "Avg_Temperature_C", "Humidity_pct", "Soil_Moisture_pct",
                "Soil_pH", "Sunlight_Hours_Day", "Disease_Pest_Risk_pct"]
    env = df.groupby("Season")[env_cols].mean().reindex(SEASONS)
    out["environmentBySeason"] = [{"season": s, **{c: r(env.loc[s, c]) for c in env_cols}} for s in SEASONS]
    ec = df[["Yield_Tonnes_Ha"] + env_cols].corr()["Yield_Tonnes_Ha"].drop("Yield_Tonnes_Ha").sort_values()
    out["envYieldCorr"] = [{"variable": k, "r": r(v, 3)} for k, v in ec.items()]

    # ---------------- Resources ----------------
    res_cols = ["Water_Used_m3", "Water_Efficiency_t_per_1000m3", "Fertilizer_kg_ha",
                "Pesticide_Litre_ha", "Seed_Quality_Score"]
    res = df.groupby("Season")[res_cols].mean().reindex(SEASONS)
    out["resourcesBySeason"] = [{"season": s, **{c: r(res.loc[s, c]) for c in res_cols}} for s in SEASONS]
    irr = pd.crosstab(df["Season"], df["Irrigation_Method"], normalize="index").reindex(SEASONS) * 100
    out["irrigationMix"] = [{"season": s, **{m: r(irr.loc[s, m], 1) for m in irr.columns}} for s in SEASONS]
    # Descriptive extras computed from the cleaned data (not in the notebook)
    irr_eff = df.groupby("Irrigation_Method")[["Water_Used_m3", "Water_Efficiency_t_per_1000m3"]].mean()
    out["irrigationEfficiency"] = [{"method": m, "water": r(irr_eff.loc[m, "Water_Used_m3"], 0),
                                    "eff": r(irr_eff.loc[m, "Water_Efficiency_t_per_1000m3"])} for m in irr_eff.index]
    fp = df.groupby("Crop")[["Fertilizer_kg_ha", "Pesticide_Litre_ha"]].mean()
    out["inputsByCrop"] = [{"crop": c, "fertilizer": r(fp.loc[c, "Fertilizer_kg_ha"], 1),
                            "pesticide": r(fp.loc[c, "Pesticide_Litre_ha"])} for c in fp.index]

    # ---------------- Economics ----------------
    econ_cols = ["Market_Price_INR_Tonne", "Revenue_INR", "Total_Cost_INR", "Profit_INR"]
    econ = df.groupby("Season")[econ_cols].mean().reindex(SEASONS)
    med = df.groupby("Season")["Profit_INR"].median().reindex(SEASONS)
    loss = df.groupby("Season")["Profit_INR"].apply(lambda s: (s < 0).mean() * 100).reindex(SEASONS)
    out["economicsBySeason"] = [{"season": s, **{c: r(econ.loc[s, c], 0) for c in econ_cols},
                                 "medianProfit": r(med.loc[s], 0), "lossPct": r(loss.loc[s], 1)} for s in SEASONS]

    ssp = df.groupby(["State", "Season"])["Profit_INR"].mean().unstack()[SEASONS]
    out["stateSeasonProfit"] = [{"state": st, **{s: r(ssp.loc[st, s], 0) for s in SEASONS},
                                 "best": ssp.loc[st].idxmax(), "worst": ssp.loc[st].idxmin()} for st in ssp.index]
    out["stateSummary"] = {"kharifBest": int((ssp.idxmax(axis=1) == "Kharif").sum()),
                           "zaidWorst": int((ssp.idxmin(axis=1) == "Zaid").sum()), "n": int(len(ssp))}
    csp = df.groupby(["Crop", "Season"])["Profit_INR"].mean().unstack()[SEASONS]
    out["cropSeasonProfit"] = [{"crop": c, **{s: r(csp.loc[c, s], 0) for s in SEASONS},
                                "best": csp.loc[c].idxmax(), "worst": csp.loc[c].idxmin()} for c in csp.index]
    out["cropSummary"] = {"kharifBest": int((csp.idxmax(axis=1) == "Kharif").sum()),
                          "zaidWorst": int((csp.idxmin(axis=1) == "Zaid").sum()), "n": int(len(csp))}
    st_tot = df.groupby("State")[["Revenue_INR", "Total_Cost_INR", "Profit_INR", "Yield_Tonnes_Ha"]].mean()
    out["stateEconomics"] = [{"state": s, "revenue": r(st_tot.loc[s, "Revenue_INR"], 0),
                              "cost": r(st_tot.loc[s, "Total_Cost_INR"], 0),
                              "profit": r(st_tot.loc[s, "Profit_INR"], 0)} for s in st_tot.index]
    cr_tot = df.groupby("Crop")[["Revenue_INR", "Total_Cost_INR", "Profit_INR", "Market_Price_INR_Tonne"]].mean()
    out["cropEconomics"] = [{"crop": c, "revenue": r(cr_tot.loc[c, "Revenue_INR"], 0),
                             "cost": r(cr_tot.loc[c, "Total_Cost_INR"], 0),
                             "profit": r(cr_tot.loc[c, "Profit_INR"], 0),
                             "price": r(cr_tot.loc[c, "Market_Price_INR_Tonne"], 0)} for c in cr_tot.index]

    # ---------------- Statistical testing (as notebook) ----------------
    df["Yield_Z"] = df.groupby("Crop")["Yield_Tonnes_Ha"].transform(lambda s: (s - s.mean()) / s.std())
    groups = [df.loc[df["Season"] == s, "Yield_Z"].dropna() for s in SEASONS]
    sample = df["Yield_Z"].dropna().sample(min(500, df["Yield_Z"].dropna().shape[0]), random_state=1)
    sh_stat, sh_p = stats.shapiro(sample)
    lv_stat, lv_p = stats.levene(*groups)
    an_stat, an_p = stats.f_oneway(*groups)
    kw_stat, kw_p = stats.kruskal(*groups)
    out["stats"] = {
        "alpha": 0.05,
        "shapiro": {"stat": r(sh_stat, 4), "p": float(f"{sh_p:.3e}"), "n": 500},
        "levene": {"stat": r(lv_stat, 4), "p": float(f"{lv_p:.3e}")},
        "anova": {"stat": r(an_stat, 3), "p": float(f"{an_p:.3e}")},
        "kruskal": {"stat": r(kw_stat, 3), "p": float(f"{kw_p:.3e}")},
        "decision": "Reject H0" if kw_p < 0.05 else "Fail to reject H0",
        "yieldZBySeason": [{"season": s, "mean": r(g.mean(), 3), "median": r(g.median(), 3), "n": int(g.size)}
                           for s, g in zip(SEASONS, groups)],
    }

    # =====================================================================
    # Website extensions added after the data-accuracy audit (DATA_PROVENANCE.md).
    # These are NEW keys only. Every value above this line is unchanged.
    # None of these analyses appear in the original notebook.
    # =====================================================================
    def hu(x, d):
        """Round half-up from the full-precision value (avoids double rounding in display labels)."""
        q = Decimal(1).scaleb(-d)
        return float(Decimal(repr(float(x))).quantize(q, rounding=ROUND_HALF_UP))

    # A1: correctly rounded 2-decimal correlation labels (from full precision, not from the 3-dp values)
    out["correlation"]["matrix2"] = [[hu(cm.iloc[i, j], 2) for j in range(len(corr_cols))] for i in range(len(corr_cols))]
    # A3: record shares rounded half-up from the exact count ratio
    for row in out["countsBySeason"]:
        row["sharePct"] = float((Decimal(row["count"] * 100) / Decimal(int(df.shape[0]))).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

    # Comparisons computed from unrounded values (previously derived in the browser from rounded means)
    K, Z = df[df["Season"] == "Kharif"], df[df["Season"] == "Zaid"]
    gap = lambda a, b: hu((a - b) / b * 100, 1)
    ns_ = df[df["Crop"] != "Sugarcane"]
    env_means = df.groupby("Season")[env_cols].mean()
    price = df.groupby("Season")["Market_Price_INR_Tonne"].mean()
    out["comparisons"] = {
        "yieldMeanGapPct": gap(K["Yield_Tonnes_Ha"].mean(), Z["Yield_Tonnes_Ha"].mean()),
        "yieldMedianGapPct": gap(K["Yield_Tonnes_Ha"].median(), Z["Yield_Tonnes_Ha"].median()),
        "waterEffGapPct": gap(K["Water_Efficiency_t_per_1000m3"].mean(), Z["Water_Efficiency_t_per_1000m3"].mean()),
        "yieldMeanGapExSugarcanePct": gap(ns_.loc[ns_["Season"] == "Kharif", "Yield_Tonnes_Ha"].mean(), ns_.loc[ns_["Season"] == "Zaid", "Yield_Tonnes_Ha"].mean()),
        "sugarcaneSharePct": {s: hu((df.loc[df["Season"] == s, "Crop"] == "Sugarcane").mean() * 100, 1) for s in SEASONS},
        "rainfallDropPct": hu((1 - env_means.loc["Zaid", "Rainfall_mm"] / env_means.loc["Kharif", "Rainfall_mm"]) * 100, 1),
        "priceSpreadPct": hu((price.max() - price.min()) / price.min() * 100, 2),
        # B4: highest season mean relative to lowest season mean, per environmental variable
        "envHighVsLowPct": {c: hu((env_means[c].max() - env_means[c].min()) / env_means[c].min() * 100, 1) for c in env_cols},
        # C3: interquartile range of yield by season
        "yieldIqr": {s: hu(df.loc[df["Season"] == s, "Yield_Tonnes_Ha"].quantile(0.75) - df.loc[df["Season"] == s, "Yield_Tonnes_Ha"].quantile(0.25), 2) for s in SEASONS},
        # C2: mean farm area by season
        "farmAreaMean": {s: hu(df.loc[df["Season"] == s, "Farm_Area_Hectares"].mean(), 2) for s in SEASONS},
    }

    # C1: environmental correlations with crop-adjusted yield (pooled, and within each season)
    out["envYieldZCorr"] = sorted([{"variable": c, "r": hu(df[c].corr(df["Yield_Z"]), 3)} for c in env_cols], key=lambda e: e["r"])
    out["envYieldZWithinSeason"] = [{"variable": c, **{s: hu(df.loc[df["Season"] == s, c].corr(df.loc[df["Season"] == s, "Yield_Z"]), 3) for s in SEASONS}} for c in env_cols]

    N, k = int(df.shape[0]), len(SEASONS)

    # D2: assumption-check details
    out["stats"]["shapiroBySeason"] = [{"season": s, "stat": hu(stats.shapiro(g).statistic, 4), "p": float(f"{stats.shapiro(g).pvalue:.3e}")} for s, g in zip(SEASONS, groups)]
    lvm = stats.levene(*groups, center="mean")
    out["stats"]["leveneMean"] = {"stat": hu(lvm.statistic, 2), "p": float(f"{lvm.pvalue:.3e}")}
    # Welch's ANOVA (does not assume equal variances)
    m_ = np.array([g.mean() for g in groups]); v_ = np.array([g.var(ddof=1) for g in groups]); n_ = np.array([g.size for g in groups])
    w_ = n_ / v_; mw = (w_ * m_).sum() / w_.sum(); tmp = ((1 - w_ / w_.sum()) ** 2 / (n_ - 1)).sum()
    fw = ((w_ * (m_ - mw) ** 2).sum() / (k - 1)) / (1 + 2 * (k - 2) / (k ** 2 - 1) * tmp)
    df2 = (k ** 2 - 1) / (3 * tmp)
    out["stats"]["welch"] = {"stat": hu(fw, 2), "df1": k - 1, "df2": hu(df2, 1), "p": float(f"{stats.f.sf(fw, k - 1, df2):.3e}")}

    # C6: Dunn's post-hoc test (pooled Kruskal–Wallis ranks, tie-corrected, Bonferroni-adjusted)
    allz = df["Yield_Z"].to_numpy(); seas = df["Season"].to_numpy()
    ranks = stats.rankdata(allz)
    _, tie_counts = np.unique(allz, return_counts=True)
    tie_term = (tie_counts ** 3 - tie_counts).sum() / (12 * (N - 1))
    mean_rank = {s: ranks[seas == s].mean() for s in SEASONS}
    size = {s: int((seas == s).sum()) for s in SEASONS}
    posthoc = []
    for a, b in [("Kharif", "Rabi"), ("Kharif", "Zaid"), ("Rabi", "Zaid")]:
        se = np.sqrt((N * (N + 1) / 12 - tie_term) * (1 / size[a] + 1 / size[b]))
        zval = (mean_rank[a] - mean_rank[b]) / se
        p = 2 * stats.norm.sf(abs(zval))
        posthoc.append({"a": a, "b": b, "z": hu(zval, 2), "p": float(f"{p:.3e}"), "pAdj": float(f"{min(1.0, p * 3):.3e}"),
                        "meanRankDiff": hu(mean_rank[a] - mean_rank[b], 1)})
    out["stats"]["posthoc"] = {"method": "Dunn", "adjust": "Bonferroni", "comparisons": posthoc}

    # D4: supplementary tests NOT run in the notebook (raw values, no crop adjustment)
    sup = {}
    for col, key in [("Profit_INR", "profit"), ("Water_Efficiency_t_per_1000m3", "waterEff")]:
        res = stats.kruskal(*[df.loc[df["Season"] == s, col] for s in SEASONS])
        sup[key] = {"column": col, "stat": hu(res.statistic, 1), "p": float(f"{res.pvalue:.3e}")}
    out["stats"]["supplementary"] = sup

    # D5: imputation sensitivity, re-running the main test without the rows whose yield was imputed
    keep = raw["Yield_Tonnes_Ha"].notna().to_numpy()
    d2 = df.loc[keep].copy()
    d2["Yield_Z2"] = d2.groupby("Crop")["Yield_Tonnes_Ha"].transform(lambda s: (s - s.mean()) / s.std())
    g2 = [d2.loc[d2["Season"] == s, "Yield_Z2"] for s in SEASONS]
    kw2 = stats.kruskal(*g2)
    out["stats"]["sensitivity"] = {"excludedRows": int((~keep).sum()), "n": int(keep.sum()), "kruskal": {"stat": hu(kw2.statistic, 2), "p": float(f"{kw2.pvalue:.3e}")},
                                   "yieldZMeans": {s: hu(g.mean(), 3) for s, g in zip(SEASONS, g2)}}

    # "Inspect the data" tables formatted exactly as the notebook prints them (cell[5] df.head(), cell[12] df.describe().T).
    # pandas prints each float column with the fewest decimals (max 6) that show every value in that column.
    def pandas_style(values):
        vals = [float(v) for v in values]
        dec = max(1, max(len(f"{v:.6f}".rstrip("0").split(".")[1]) for v in vals))
        return [f"{v:.{dec}f}" for v in vals]

    desc = raw.describe().T
    desc_cols = {c: pandas_style(desc[c].tolist()) for c in desc.columns}
    out["describeNotebook"] = {
        "headers": list(desc.columns),
        "rows": [{"column": col, "values": [desc_cols[c][i] for c in desc.columns]} for i, col in enumerate(desc.index)],
    }
    head = raw.head(5)
    head_cells = {}
    for c in head.columns:
        if pd.api.types.is_float_dtype(head[c]):
            head_cells[c] = pandas_style(head[c].tolist())
        elif pd.api.types.is_integer_dtype(head[c]):
            head_cells[c] = [str(int(v)) for v in head[c]]
        else:
            head_cells[c] = [str(v) for v in head[c]]
    out["sampleRowsNotebook"] = {
        "columns": list(head.columns),
        "numeric": [c for c in head.columns if pd.api.types.is_numeric_dtype(head[c])],
        "rows": [[head_cells[c][i] for c in head.columns] for i in range(len(head))],
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    sys.stdout.reconfigure(encoding="utf-8")
    print("Wrote", os.path.relpath(OUT), f"({os.path.getsize(OUT) // 1024} KB)")
    print("Stats:", out["stats"])
    print("Notes:", out["datasetNotes"])
    print("Econ:", out["economicsBySeason"])
    print("Crop summary:", out["cropSummary"])
    print("Irrigation eff:", out["irrigationEfficiency"])


if __name__ == "__main__":
    main()
