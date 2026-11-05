export type Season = "Kharif" | "Rabi" | "Zaid";
export type BySeason<T> = { [K in Season]: T };

export interface BoxStat { season: Season; min: number; q1: number; median: number; q3: number; max: number; mean: number; n: number }
export interface MSD { mean: number; median: number; std: number }

export interface Insights {
  overview: {
    rows: number; columns: number; states: string[]; districts: string[]; crops: string[];
    irrigation: string[]; seasons: Season[]; categorical: string[]; numerical: string[];
    missing: Record<string, number>; duplicateRows: number; duplicateIds: number; totalMissing: number;
  };
  describe: { column: string; count: number; mean: number; std: number; min: number; q1: number; median: number; q3: number; max: number }[];
  sampleRows: Record<string, string | number | null>[];
  /** df.head() exactly as the notebook prints it (cell 5): values are pre-formatted strings. */
  sampleRowsNotebook: { columns: string[]; numeric: string[]; rows: string[][] };
  /** df.describe().T exactly as the notebook prints it (cell 12): values are pre-formatted strings. */
  describeNotebook: { headers: string[]; rows: { column: string; values: string[] }[] };
  plausibilityChecks: { check: string; invalid: number }[];
  datasetNotes: { districtsInMultipleStates: number; maxStatesPerDistrict: number; productionMatchesYieldXArea: number; profitMatchesRevenueMinusCost: number; lossMakingFarmsPct: number };
  cleaning: { before: Record<string, number>; after: Record<string, number>; remainingMissing: number; strategy: Record<string, string> };
  countsBySeason: { season: Season; count: number; sharePct: number }[];
  countsByCrop: { crop: string; count: number }[];
  countsByState: { state: string; count: number }[];
  countsByIrrigation: { method: string; count: number }[];
  cropSeasonCounts: ({ crop: string } & BySeason<number>)[];
  yieldHistogram: { x0: number; x1: number; count: number }[];
  yieldHistogramNoSugarcane: { x0: number; x1: number; count: number }[];
  yieldDescribe: Record<string, number>;
  yieldByCrop: { crop: string; yield: number }[];
  correlation: { columns: string[]; matrix: number[][]; matrix2: number[][] };
  comparisons: {
    yieldMeanGapPct: number; yieldMedianGapPct: number; waterEffGapPct: number; yieldMeanGapExSugarcanePct: number;
    sugarcaneSharePct: BySeason<number>; rainfallDropPct: number; priceSpreadPct: number;
    envHighVsLowPct: Record<string, number>; yieldIqr: BySeason<number>; farmAreaMean: BySeason<number>;
  };
  envYieldZCorr: { variable: string; r: number }[];
  envYieldZWithinSeason: ({ variable: string } & BySeason<number>)[];
  seasonalPerformance: { season: Season; count: number; yield: MSD; production: MSD; waterEff: MSD }[];
  boxes: Record<string, BoxStat[]>;
  cropSeasonYield: ({ crop: string; norm: BySeason<number>; best: Season } & BySeason<number>)[];
  environmentBySeason: ({ season: Season } & Record<string, number>)[];
  envYieldCorr: { variable: string; r: number }[];
  resourcesBySeason: ({ season: Season } & Record<string, number>)[];
  irrigationMix: ({ season: Season } & Record<string, number>)[];
  irrigationEfficiency: { method: string; water: number; eff: number }[];
  inputsByCrop: { crop: string; fertilizer: number; pesticide: number }[];
  economicsBySeason: { season: Season; Market_Price_INR_Tonne: number; Revenue_INR: number; Total_Cost_INR: number; Profit_INR: number; medianProfit: number; lossPct: number }[];
  stateSeasonProfit: ({ state: string; best: Season; worst: Season } & BySeason<number>)[];
  stateSummary: { kharifBest: number; zaidWorst: number; n: number };
  cropSeasonProfit: ({ crop: string; best: Season; worst: Season } & BySeason<number>)[];
  cropSummary: { kharifBest: number; zaidWorst: number; n: number };
  stateEconomics: { state: string; revenue: number; cost: number; profit: number }[];
  cropEconomics: { crop: string; revenue: number; cost: number; profit: number; price: number }[];
  stats: {
    alpha: number;
    shapiro: { stat: number; p: number; n: number };
    levene: { stat: number; p: number };
    anova: { stat: number; p: number };
    kruskal: { stat: number; p: number };
    decision: string;
    yieldZBySeason: { season: Season; mean: number; median: number; n: number }[];
    shapiroBySeason: { season: Season; stat: number; p: number }[];
    leveneMean: { stat: number; p: number };
    welch: { stat: number; df1: number; df2: number; p: number };
    posthoc: { method: string; adjust: string; comparisons: { a: Season; b: Season; z: number; p: number; pAdj: number; meanRankDiff: number }[] };
    supplementary: Record<"profit" | "waterEff", { column: string; stat: number; p: number }>;
    sensitivity: { excludedRows: number; n: number; kruskal: { stat: number; p: number }; yieldZMeans: BySeason<number> };
  };
}
