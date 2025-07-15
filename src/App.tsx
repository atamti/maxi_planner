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
import { SaveLoadSection } from "./components/SaveLoadSection";
import { DEFAULT_FORM_DATA } from "./config/defaults";
import { useCalculations } from "./hooks/useCalculations";
import { useFormReset } from "./hooks/useFormReset";
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
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [showUSD, setShowUSD] = useState<boolean>(false);
  const [allocationError, setAllocationError] = useState<string>("");

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Use our new custom hook
  const { resetForm } = useFormReset(setFormData);

  useEffect(() => {
    const total =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    setAllocationError(
      total !== 100 ? `Allocations must sum to 100% (current: ${total}%)` : "",
    );
  }, [formData.savingsPct, formData.investmentsPct, formData.speculationPct]);

  const calculationResults = useCalculations(formData);

  const handleLoadConfig = (data: FormData) => {
    setFormData(data);
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
