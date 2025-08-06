// Loan business logic service
import { FormDataSubset } from "../types";
import { LoanService } from "./types";

export const createLoanService = (): LoanService => {
  const calculateLoanDetails = (
    formData: FormDataSubset,
    getBtcPriceAtYear: (year: number) => number,
    activationYear: number,
  ) => {
    const {
      exchangeRate,
      collateralPct,
      loanRate,
      loanTermYears,
      interestOnly,
      ltvRatio,
    } = formData;

    if (collateralPct === 0) {
      return {
        loanAmount: 0,
        monthlyPayment: 0,
        liquidationPrice: 0,
        totalInterest: 0,
        riskLevel: "low" as const,
      };
    }

    // Calculate collateral value
    const collateralBtc = (formData.btcStack * collateralPct) / 100;
    const btcPriceAtActivation = getBtcPriceAtYear(activationYear);
    const collateralValueUSD =
      collateralBtc * btcPriceAtActivation * exchangeRate;

    // Calculate loan amount based on LTV ratio
    const loanAmount = collateralValueUSD * (ltvRatio / 100);

    // Calculate monthly payment
    const monthlyRate = loanRate / 100 / 12;
    const totalPayments = loanTermYears * 12;

    let monthlyPayment: number;
    let totalInterest: number;

    if (interestOnly) {
      monthlyPayment = loanAmount * monthlyRate;
      totalInterest = monthlyPayment * totalPayments;
    } else {
      // Standard amortizing loan
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / totalPayments;
        totalInterest = 0;
      } else {
        monthlyPayment =
          (loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1);
        totalInterest = monthlyPayment * totalPayments - loanAmount;
      }
    }

    // Calculate liquidation price (price at which LTV becomes 100%)
    const liquidationPrice = loanAmount / collateralBtc / exchangeRate;

    // Calculate risk level based on current price vs liquidation price
    const currentBuffer =
      ((btcPriceAtActivation - liquidationPrice) / liquidationPrice) * 100;
    let riskLevel: "low" | "moderate" | "high" | "extreme";

    if (currentBuffer > 100) riskLevel = "low";
    else if (currentBuffer > 50) riskLevel = "moderate";
    else if (currentBuffer > 25) riskLevel = "high";
    else riskLevel = "extreme";

    return {
      loanAmount,
      monthlyPayment,
      liquidationPrice,
      totalInterest,
      riskLevel,
    };
  };

  const validateLoanConfiguration = (formData: FormDataSubset) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Validate LTV ratio
    if (formData.ltvRatio > 50) {
      warnings.push(
        "LTV ratio above 50% increases liquidation risk significantly",
      );
    }

    if (formData.ltvRatio < 10 && formData.collateralPct > 0) {
      warnings.push(
        "Very low LTV ratio may limit the effectiveness of leverage",
      );
    }

    // Validate loan rate
    if (formData.loanRate < 1) {
      warnings.push("Unusually low loan rate - verify this is realistic");
    }

    if (formData.loanRate > 20) {
      warnings.push("High loan rate significantly increases cost of leverage");
    }

    // Validate loan term
    if (formData.loanTermYears < 1) {
      errors.push("Loan term must be at least 1 year");
    }

    if (formData.loanTermYears > 30) {
      warnings.push("Very long loan terms increase exposure to rate changes");
    }

    // Validate collateral percentage
    if (formData.collateralPct > 80) {
      warnings.push("Using most of your stack as collateral increases risk");
    }

    const isValid = errors.length === 0;

    return { isValid, warnings, errors };
  };

  return {
    calculateLoanDetails,
    validateLoanConfiguration,
  };
};
