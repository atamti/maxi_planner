// New centralized context provider
import React, { createContext, useContext } from "react";
import { CentralizedState, useCentralizedState } from "./useCentralizedState";

const CentralizedStateContext = createContext<CentralizedState | undefined>(
  undefined,
);

interface CentralizedStateProviderProps {
  children: React.ReactNode;
}

export const CentralizedStateProvider: React.FC<
  CentralizedStateProviderProps
> = ({ children }) => {
  const centralizedState = useCentralizedState();

  return (
    <CentralizedStateContext.Provider value={centralizedState}>
      {children}
    </CentralizedStateContext.Provider>
  );
};

export const useCentralizedStateContext = (): CentralizedState => {
  const context = useContext(CentralizedStateContext);
  if (context === undefined) {
    throw new Error(
      "useCentralizedStateContext must be used within a CentralizedStateProvider",
    );
  }
  return context;
};

// Backward compatibility hook that mimics the old usePortfolio interface
export const usePortfolioCompat = () => {
  const {
    formData,
    updateFormData,
    resetForm,
    calculationResults,
    allocationError,
    showUSD,
    setShowUSD,
  } = useCentralizedStateContext();

  return {
    formData,
    updateFormData,
    resetForm,
    calculationResults,
    allocationError,
    showUSD,
    setShowUSD,
  };
};
