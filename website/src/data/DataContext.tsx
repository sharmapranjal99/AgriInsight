import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Insights } from "./types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Insights };

const Ctx = createContext<{ state: State; retry: () => void }>({ state: { status: "loading" }, retry: () => {} });

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    setState({ status: "loading" });
    fetch(`${import.meta.env.BASE_URL}data/insights.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load analysis data (HTTP ${r.status}).`);
        return r.json();
      })
      .then((data: Insights) => setState({ status: "ready", data }))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setState({ status: "error", message: msg.startsWith("Could not") ? msg : "Could not load the analysis data. Check that the site is running (npm run dev) and that public/data/insights.json exists." });
      });
  }, []);

  useEffect(load, [load]);
  return <Ctx.Provider value={{ state, retry: load }}>{children}</Ctx.Provider>;
}

export const useDataState = () => useContext(Ctx);

/** Use only inside pages rendered after DataGate confirms data is ready. */
export function useData(): Insights {
  const { state } = useContext(Ctx);
  if (state.status !== "ready") throw new Error("Data not ready");
  return state.data;
}
