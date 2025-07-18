import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { EconomicScenarioSection } from "../sections/EconomicScenarioSection";
import { IncomeCashflowSection } from "../sections/IncomeCashflowSection";
import { MarketAssumptionsSection } from "../sections/MarketAssumptionsSection";
import { PortfolioSetupSection } from "../sections/PortfolioSetupSection";

export const PortfolioForm: React.FC = () => {
  const { resetForm } = usePortfolio();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-xl font-semibold mb-4">Portfolio Configuration</h2>

      {/* Section 1: Portfolio Setup */}
      <PortfolioSetupSection />

      {/* Section 2: Economic Scenario */}
      <EconomicScenarioSection />

      {/* Section 3: Market Assumptions */}
      <MarketAssumptionsSection />

      {/* Section 4: Income & Cashflow */}
      <IncomeCashflowSection />

      {/* Reset Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};
