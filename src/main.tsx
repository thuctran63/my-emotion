import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";
import Nav from "./components/Nav";
import PinGate from "./components/PinGate";
import TodayPage from "./pages/TodayPage";
import "./index.css";

// Code-split the heavier pages — Today stays in the critical bundle.
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <PinGate>
            <div className="min-h-dvh bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
              <Nav />
              <main>
                <Routes>
                  <Route path="/" element={<TodayPage />} />
                  <Route
                    path="/history"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <HistoryPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/stats"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <StatsPage />
                      </Suspense>
                    }
                  />
                </Routes>
              </main>
              <footer className="mx-auto max-w-3xl px-4 pb-8 pt-4 text-center text-xs text-slate-400 dark:text-slate-600">
                My Emotion · {new Date().getFullYear()}
              </footer>
            </div>
          </PinGate>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

function PageFallback() {
  return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">…</div>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);