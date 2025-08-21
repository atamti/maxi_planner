import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect } from "react";
import { PortfolioForm } from "./components/forms/PortfolioForm";
import { SaveLoadSection } from "./components/forms/SaveLoadSection";
import { ResultsSection } from "./components/sections/ResultsSection";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CentralizedStateProvider, usePortfolioCompat } from "./store";
import { FormData } from "./types";
import { logError, logUserAction } from "./utils/logger";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const App: React.FC = () => {
  useEffect(() => {
    logUserAction("App", "appMounted", {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Log any uncaught errors
    const handleError = (event: ErrorEvent) => {
      logError("App", "uncaughtError", new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(
        "App",
        "unhandledPromiseRejection",
        new Error(String(event.reason)),
        {
          reason: event.reason,
        },
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      logUserAction("App", "appUnmounted");
    };
  }, []);

  return (
    <ThemeProvider>
      <CentralizedStateProvider>
        <AppContent />
      </CentralizedStateProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const {
    formData,
    updateFormData,
    resetForm,
    calculationResults,
    allocationError,
  } = usePortfolioCompat();

  const handleLoadConfig = (data: FormData) => {
    logUserAction("App", "loadConfig", {
      hasCustomBtcRates: data.btcPriceCustomRates?.length > 0,
      timeHorizon: data.timeHorizon,
      activationYear: data.activationYear,
      btcStack: data.btcStack,
    });
    updateFormData(data);
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-secondary transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="bg-surface border-b-2 border-bitcoin-orange p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-bitcoin-orange rounded-none border border-bitcoin-orange flex items-center justify-center">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <div>
                <h1 className="font-poppins text-2xl font-bold text-bitcoin-orange uppercase tracking-wider">
                  BTC MAXI PORTFOLIO PLANNER
                </h1>
                <p className="text-xs text-secondary font-mono uppercase tracking-wide">
                  STACK SATS. MANAGE RISK. LASER EYES ACTIVATED.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-secondary bg-surface-alt px-3 py-2 border border-themed rounded-none uppercase font-mono tracking-wide">
                EDUCATIONAL ONLY • NOT FINANCIAL ADVICE
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          <SaveLoadSection formData={formData} onLoad={handleLoadConfig} />

          <PortfolioForm />

          <ResultsSection
            results={calculationResults}
            formData={formData}
            showUSD={false}
            onUpdateFormData={updateFormData}
          />

          {/* Footer */}
          <div className="mt-10 pt-6 border-t-2 border-bitcoin-orange/30 text-center text-xs text-secondary space-y-3">
            <div className="flex justify-center items-center space-x-4">
              <a
                href="https://github.com/atamti/maxi_planner"
                className="btn-secondary-navy px-4 py-2 text-xs uppercase tracking-wide hover:text-bitcoin-orange transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x.com/ChrisElamLearn"
                className="btn-secondary-navy px-4 py-2 text-xs uppercase tracking-wide hover:text-bitcoin-orange transition-colors"
              >
                Feedback on X
              </a>
              <a
                href="mailto:chris.r.elam@protonmail.com"
                className="btn-secondary-navy px-4 py-2 text-xs uppercase tracking-wide hover:text-bitcoin-orange transition-colors"
              >
                Contact
              </a>
            </div>
            <p className="font-mono text-xs text-secondary">
              Built by Chris Elam, 2025 • HODL RESPONSIBLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
