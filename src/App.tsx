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
import { PortfolioProvider } from "./context/PortfolioContext";
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
    <CentralizedStateProvider>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </CentralizedStateProvider>
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
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <div className="bg-gray-300 p-2 text-center mb-4">
        This is for educational purposes only. Not financial advice. Consult a
        professional.
      </div>

      <h1 className="text-2xl font-bold text-orange-500 mb-4">
        BTC maxi portfolio planner
      </h1>
      <p className="text-gray-600 mb-4">
        Balance your stack with income requirments and risk tolerance.
      </p>

      <SaveLoadSection formData={formData} onLoad={handleLoadConfig} />

      <PortfolioForm />

      <ResultsSection
        results={calculationResults}
        formData={formData}
        showUSD={false}
        onUpdateFormData={updateFormData}
      />

      <div className="bg-gray-100 p-4 text-center mt-4">
        <div className="bg-gray-300 p-2 text-center mb-4">
          This is for educational purposes only. Not financial advice. Consult a
          professional.
        </div>
        <p>
          <a
            href="https://github.com/atamti/maxi_planner"
            className="text-blue-600 underline"
          >
            GitHub
          </a>{" "}
          |{" "}
          <a
            href="https://x.com/ChrisElamLearn"
            className="text-blue-600 underline"
          >
            Feedback on X
          </a>{" "}
          |{" "}
          <a
            href="mailto:chris.r.elam@protonmail.com"
            className="text-blue-600 underline"
          >
            Contact
          </a>
        </p>
        <p className="text-gray-600">Built by Chris Elam, 2025</p>
      </div>
    </div>
  );
};

export default App;
