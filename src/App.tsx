import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { PortfolioForm } from "./components/PortfolioForm";
import { ResultsSection } from "./components/ResultsSection";
import { useCalculations } from "./hooks/useCalculations";
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
);

const DEFAULT_FORM_DATA: FormData = {
  btcStack: 1,
  savingsPct: 65,
  investmentsPct: 25,
  speculationPct: 10,
  collateralPct: 15,
  loanRate: 7,
  incomeYield: 12,
  incomeAllocationPct: 10,
  investmentsStartYield: 30,
  investmentsEndYield: 10,
  speculationStartYield: 40,
  speculationEndYield: 10,
  btcGrowth: 50,
  priceCrash: 0,
  exchangeRate: 100000,
  timeHorizon: 20,
  activationYear: 5,
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  const [showUSD, setShowUSD] = useState<boolean>(false);
  const [allocationError, setAllocationError] = useState<string>("");

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  useEffect(() => {
    const total =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    setAllocationError(
      total !== 100 ? `Allocations must sum to 100% (current: ${total}%)` : "",
    );
  }, [formData.savingsPct, formData.investmentsPct, formData.speculationPct]);

  const calculationResults = useCalculations(formData);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <div className="bg-red-600 text-white p-2 text-center mb-4">
        This is for educational purposes only. Not financial advice. Consult a
        professional.
      </div>

      <h1 className="text-2xl font-bold text-orange-500 mb-4">
        BTC maxi portfolio planner
      </h1>
      <p className="text-gray-600 mb-4">
        Balance your stack with income requirments and risk tolerance.
      </p>

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={showUSD}
          onChange={() => setShowUSD(!showUSD)}
          className="mr-2"
        />
        Show USD Equivalents
      </label>

      <PortfolioForm
        formData={formData}
        updateFormData={updateFormData}
        allocationError={allocationError}
        onReset={resetForm}
      />

      <ResultsSection
        results={calculationResults}
        formData={formData}
        showUSD={showUSD}
      />

      <div className="bg-gray-100 p-4 text-center mt-4">
        <p className="text-red-600">
          Educational only. Not financial advice. BTC volatile, borrowing risky,
          USD income decays.
        </p>
        <p>
          <a href="https://github.com" className="text-blue-600 underline">
            GitHub
          </a>{" "}
          |{" "}
          <a href="https://x.com" className="text-blue-600 underline">
            Feedback on X
          </a>{" "}
          |{" "}
          <a
            href="mailto:contact@example.com"
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
