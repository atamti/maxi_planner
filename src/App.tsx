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
import React from "react";
import { PortfolioForm } from "./components/forms/PortfolioForm";
import { SaveLoadSection } from "./components/forms/SaveLoadSection";
import { ResultsSection } from "./components/sections/ResultsSection";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext";
import { FormData } from "./types";

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
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
};

const AppContent: React.FC = () => {
  const {
    formData,
    updateFormData,
    resetForm,
    calculationResults,
    allocationError,
  } = usePortfolio();

  const handleLoadConfig = (data: FormData) => {
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
