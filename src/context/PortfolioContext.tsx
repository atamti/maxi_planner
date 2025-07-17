import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useCalculations } from "../hooks/useCalculations";
import { useFormReset } from "../hooks/useFormReset";
import { CalculationResults, FormData } from "../types";

interface PortfolioContextType {
  // Form state
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  resetForm: () => void;

  // Calculated results
  calculationResults: CalculationResults;

  // UI state
  showUSD: boolean;
  setShowUSD: (show: boolean) => void;
  allocationError: string;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
);

interface PortfolioProviderProps {
  children: React.ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [showUSD, setShowUSD] = useState<boolean>(false);
  const [allocationError, setAllocationError] = useState<string>("");

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const { resetForm } = useFormReset(setFormData);

  // Calculate allocation error
  useEffect(() => {
    const total =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    setAllocationError(
      total !== 100 ? `Allocations must sum to 100% (current: ${total}%)` : "",
    );
  }, [formData.savingsPct, formData.investmentsPct, formData.speculationPct]);

  // Get calculation results
  const calculationResults = useCalculations(formData);

  const contextValue: PortfolioContextType = {
    formData,
    updateFormData,
    resetForm,
    calculationResults,
    showUSD,
    setShowUSD,
    allocationError,
  };

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
