import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useDataState } from "../data/DataContext";

export function Loader({ label = "Loading analysis…" }: { label?: string }) {
  return (
    <div className="state-screen" role="status" aria-live="polite">
      <div>
        <div className="spinner"><span /><span /></div>
        <p style={{ color: "var(--muted)", fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-screen" role="alert">
      <div style={{ maxWidth: 460 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "#fcf0ea", color: "var(--neg)", margin: "0 auto 18px" }}>
          <AlertTriangle />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28 }}>Something went wrong</h2>
        <p style={{ color: "var(--muted)", marginTop: 10 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
          {onRetry && <button className="btn btn-primary" onClick={onRetry}><RotateCcw size={16} /> Try again</button>}
          <Link to="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

/** Renders children only once the analysis JSON is loaded. */
export function DataGate({ children }: { children: ReactNode }) {
  const { state, retry } = useDataState();
  if (state.status === "loading") return <Loader />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={retry} />;
  return <>{children}</>;
}

export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info); }
  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) return <ErrorState message={`This section failed to render: ${this.state.error.message}`} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
