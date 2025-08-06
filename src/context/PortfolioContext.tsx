import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useCalculations } from "../hooks/useCalculations";
import { useFormReset } from "../hooks/useFormReset";
import { CalculationResults, FormData } from "../types";
import { logError, logFormUpdate, logUserAction } from "../utils/logger";

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
    const updatedFields = Object.keys(updates);
    logFormUpdate(
      "PortfolioContext",
      `fields: ${updatedFields.join(", ")}`,
      formData,
      updates,
    );

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const { resetForm } = useFormReset(setFormData);

  const handleResetForm = () => {
    logUserAction("PortfolioContext", "resetForm");
    resetForm();
  };

  // Calculate allocation error
  useEffect(() => {
    const total =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    const errorMessage =
      total !== 100 ? `Allocations must sum to 100% (current: ${total}%)` : "";

    if (errorMessage !== allocationError) {
      logFormUpdate(
        "PortfolioContext",
        "allocationError",
        allocationError,
        errorMessage,
      );
    }

    setAllocationError(errorMessage);
  }, [
    formData.savingsPct,
    formData.investmentsPct,
    formData.speculationPct,
    allocationError,
  ]);

  // Get calculation results
  const calculationResults = useCalculations(formData);

  const contextValue: PortfolioContextType = {
    formData,
    updateFormData,
    resetForm: handleResetForm,
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
    logError(
      "PortfolioContext",
      "usePortfolio",
      new Error("usePortfolio hook used outside provider"),
      {
        stack: new Error().stack,
      },
    );
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
