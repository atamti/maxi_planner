import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { IncomeExpensesSection } from "./IncomeExpensesSection";

export const IncomeCashflowSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  return (
    <CollapsibleSection title="4. 💰 Income & Cashflow">
      <div className="col-span-2">
        <IncomeExpensesSection
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>
    </CollapsibleSection>
  );
};
