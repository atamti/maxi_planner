import React from "react";
import { usePortfolioCompat } from "../../store";
import { EconomicScenariosSection } from "../sections/EconomicScenariosSection";
import { IncomeCashflowSection } from "../sections/IncomeCashflowSection";
import { LeverageSection } from "../sections/LeverageSection";
import { MarketAssumptionsSection } from "../sections/MarketAssumptionsSection";
import { PortfolioSetupSection } from "../sections/PortfolioSetupSection";

export const PortfolioForm: React.FC = () => {
  const { formData, updateFormData, resetForm } = usePortfolioCompat();

  return (
    <div className="bg-surface border border-[var(--color-border)] p-4 mb-4 rounded-none shadow-inner-thin-orange">
      <h2 className="text-lg font-heading font-bold tracking-wide text-primary mb-4">
        PORTFOLIO CONFIGURATION
      </h2>

      {/* Section 1: Portfolio Setup */}
      <PortfolioSetupSection />

      {/* Section 2: Economic Scenario */}
      <EconomicScenariosSection />

      {/* Section 3: Market Assumptions */}
      <MarketAssumptionsSection />

      {/* Section 4: Leverage & Borrowing */}
      <LeverageSection />

      {/* Section 5: Income & Cashflow */}
      <IncomeCashflowSection />

      {/* Reset Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={resetForm}
          className="btn-secondary-navy dark:btn-gradient-orange px-5 py-2 text-xs font-heading tracking-wide"
        >
          🔄 RESET TO DEFAULTS
        </button>
      </div>
    </div>
  );
};
