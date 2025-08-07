import { FormDataSubset } from "../types";

export interface LoanDetails {
  loanPrincipal: number;
  liquidationPrice: number;
  annualPayments: number;
  collateralBtc: number;
  btcStackAtActivation: number;
}

/**
 * Custom hook for calculating loan-related values
 * Consolidates loan calculation logic from multiple components
 */
export const useLoanCalculations = (
  formData: FormDataSubset,
  getBtcPriceAtYear: (year: number) => number,
) => {
  const calculateBtcStackAtActivation = (
    activationYear: number,
    initialBtcStack: number,
  ): number => {
    let btcStackAtActivation = initialBtcStack;

    for (let year = 0; year < activationYear; year++) {
      const investmentsYield =
        formData.investmentsStartYield -
        (formData.investmentsStartYield - formData.investmentsEndYield) *
          (year / formData.timeHorizon);
      const speculationYield =
        formData.speculationStartYield -
        (formData.speculationStartYield - formData.speculationEndYield) *
          (year / formData.timeHorizon);

      const savings = btcStackAtActivation * (formData.savingsPct / 100);
      const investments =
        btcStackAtActivation *
        (formData.investmentsPct / 100) *
        (1 + investmentsYield / 100);
      const speculation =
        btcStackAtActivation *
        (formData.speculationPct / 100) *
        (1 + speculationYield / 100);

      btcStackAtActivation = savings + investments + speculation;
    }

    return btcStackAtActivation;
  };

  const calculateLoanDetails = (activationYear: number): LoanDetails | null => {
    // No loan if no collateral or no LTV ratio
    if (formData.collateralPct === 0 || formData.ltvRatio === 0) return null;

    const btcStackAtActivation = calculateBtcStackAtActivation(
      activationYear,
      formData.btcStack,
    );
    const btcSavingsAtActivation =
      btcStackAtActivation * (formData.savingsPct / 100);
    const collateralBtc =
      btcSavingsAtActivation * (formData.collateralPct / 100);
    const btcPriceAtActivation = getBtcPriceAtYear(activationYear);

    const loanPrincipal =
      collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;
    const liquidationPrice = btcPriceAtActivation * (formData.ltvRatio / 80);

    const annualPayments = formData.interestOnly
      ? loanPrincipal * (formData.loanRate / 100)
      : (loanPrincipal *
          ((formData.loanRate / 100) *
            Math.pow(1 + formData.loanRate / 100, formData.loanTermYears))) /
        (Math.pow(1 + formData.loanRate / 100, formData.loanTermYears) - 1);

    return {
      loanPrincipal,
      liquidationPrice,
      annualPayments,
      collateralBtc,
      btcStackAtActivation,
    };
  };

  const calculateLiquidationBuffer = (
    activationYear: number,
    timeHorizon: number,
  ): number | null => {
    const loanDetails = calculateLoanDetails(activationYear);
    if (!loanDetails) return null;

    let minBtcPrice = Infinity;

    for (let year = activationYear; year <= timeHorizon; year++) {
      const btcPrice = getBtcPriceAtYear(year);
      minBtcPrice = Math.min(minBtcPrice, btcPrice);
    }

    if (minBtcPrice === Infinity) return null;

    return (
      ((minBtcPrice - loanDetails.liquidationPrice) /
        loanDetails.liquidationPrice) *
      100
    );
  };

  const calculateAdditionalCollateralPotential = (
    activationYear: number,
  ): { additionalBtc: number; improvedLiquidationPrice: number } | null => {
    const loanDetails = calculateLoanDetails(activationYear);
    if (!loanDetails) return null;

    const fullBtcSavings =
      loanDetails.btcStackAtActivation * (formData.savingsPct / 100);
    const currentCollateralBtc = loanDetails.collateralBtc;
    const additionalBtcAvailable = fullBtcSavings - currentCollateralBtc;

    if (formData.collateralPct >= 100 || additionalBtcAvailable <= 0) {
      return null;
    }

    const newTotalCollateralBtc = currentCollateralBtc + additionalBtcAvailable;
    const improvedLiquidationPrice =
      loanDetails.loanPrincipal / (newTotalCollateralBtc * 0.8);

    return {
      additionalBtc: additionalBtcAvailable,
      improvedLiquidationPrice,
    };
  };

  return {
    calculateLoanDetails,
    calculateLiquidationBuffer,
    calculateAdditionalCollateralPotential,
    calculateBtcStackAtActivation,
  };
};
