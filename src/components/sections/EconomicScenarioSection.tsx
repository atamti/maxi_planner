import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { EconomicScenariosSection } from "./EconomicScenariosSection";

export const EconomicScenarioSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        2. 🌍 Economic Scenario
      </h3>
      <EconomicScenariosSection
        formData={formData}
        updateFormData={updateFormData}
      />
    </div>
  );
};
