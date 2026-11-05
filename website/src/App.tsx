import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DataGate, ErrorBoundary, Loader } from "./components/States";

const Home = lazy(() => import("./pages/Home"));
const Problem = lazy(() => import("./pages/Problem"));
const Objectives = lazy(() => import("./pages/Objectives"));
const Overview = lazy(() => import("./pages/Overview"));
const Methodology = lazy(() => import("./pages/Methodology"));
const Dataset = lazy(() => import("./pages/Dataset"));
const EDA = lazy(() => import("./pages/EDA"));
const Seasonal = lazy(() => import("./pages/Seasonal"));
const Environment = lazy(() => import("./pages/Environment"));
const Resources = lazy(() => import("./pages/Resources"));
const Economics = lazy(() => import("./pages/Economics"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Conclusion = lazy(() => import("./pages/Conclusion"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ROUTES = [
  ["/", Home], ["/problem", Problem], ["/objectives", Objectives], ["/overview", Overview],
  ["/methodology", Methodology], ["/dataset", Dataset], ["/eda", EDA], ["/seasonal", Seasonal],
  ["/environment", Environment], ["/resources", Resources], ["/economics", Economics],
  ["/statistics", Statistics], ["/recommendations", Recommendations], ["/conclusion", Conclusion],
] as const;

export default function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [location.pathname]);
  useEffect(() => { if (location.pathname === "/") document.title = "AgriInsight · Seasonal Agriculture Performance"; }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main id="main">
        <ErrorBoundary resetKey={location.pathname}>
          <DataGate>
            <Suspense fallback={<Loader label="Loading section…" />}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Routes location={location}>
                    {ROUTES.map(([path, C]) => <Route key={path} path={path} element={<C />} />)}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </DataGate>
        </ErrorBoundary>
      </main>
      <Footer />
    </MotionConfig>
  );
}
