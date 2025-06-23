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
  Filler,
);

const DEFAULT_FORM_DATA: FormData = {
  btcStack: 5,
  savingsPct: 65,
  investmentsPct: 25,
  speculationPct: 10,
  collateralPct: 50,
  loanRate: 7,
  loanTermYears: 10,
  interestOnly: true,
  incomeYield: 20,
  incomeAllocationPct: 10,
  incomeReinvestmentPct: 5,
  investmentsStartYield: 30,
  investmentsEndYield: 10,
  speculationStartYield: 40,
  speculationEndYield: 10,
  btcGrowth: 50,
  priceCrash: 0,
  exchangeRate: 100000,
  timeHorizon: 20,
  activationYear: 5,

  // USD Inflation
  inflationMode: "simple",
  inflationInputType: "flat",
  inflationFlat: 8,
  inflationStart: 5,
  inflationEnd: 15,
  inflationPreset: "debasement",
  inflationCustomRates: Array(30).fill(8), // Default 8% for all years
  inflationManualMode: false,

  // BTC Price Appreciation
  btcPriceMode: "simple",
  btcPriceInputType: "preset",
  btcPriceFlat: 50,
  btcPriceStart: 30,
  btcPriceEnd: 70,
  btcPricePreset: "debasement",
  btcPriceCustomRates: Array(30).fill(50), // Default 50% for all years
  btcPriceManualMode: false,

  // Economic Scenario
  economicScenario: "debasement",
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,
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
        onUpdateFormData={updateFormData}
      />

      <div className="bg-gray-100 p-4 text-center mt-4">
        <p className="text-red-600">
          Educational only. Not financial advice. BTC volatile, borrowing risky,
          USD income decays.
        </p>
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
