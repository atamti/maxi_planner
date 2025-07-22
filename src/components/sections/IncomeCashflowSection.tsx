import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { IncomeExpensesSection } from "./IncomeExpensesSection";

export const IncomeCashflowSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  // Create descriptive title
  const getSectionTitle = () => {
    const avgIncome = formData.incomeCustomRates
      ? (
          formData.incomeCustomRates.reduce((sum, rate) => sum + rate, 0) /
          formData.incomeCustomRates.length
        ).toFixed(1)
      : formData.incomeYield.toString();

    return `5. 💰 Income & Cashflow: ${avgIncome}% avg yield, ${formData.incomeAllocationPct}% allocation, $${(formData.startingExpenses / 1000).toFixed(0)}k expenses, ${formData.incomeReinvestmentPct}% reinvest`;
  };

  return (
    <CollapsibleSection title={getSectionTitle()}>
      <div className="col-span-2">
        <IncomeExpensesSection
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>
    </CollapsibleSection>
  );
};
