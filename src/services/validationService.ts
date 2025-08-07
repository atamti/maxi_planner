// Validation business logic service
import { FormDataSubset } from "../types";
import { ValidationService } from "./types";

export const createValidationService = (): ValidationService => {
  const validateFormData = (formData: FormDataSubset) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Validate time horizon
    const timeHorizonValidation = validateTimeHorizon(formData.timeHorizon);
    if (!timeHorizonValidation.isValid) {
      errors.timeHorizon = timeHorizonValidation.message!;
    }

    // Validate BTC stack
    const btcStackValidation = validateBtcStack(formData.btcStack);
    if (!btcStackValidation.isValid) {
      errors.btcStack = btcStackValidation.message!;
    }

    // Validate yield rates
    const investmentYieldValidation = validateYieldRates(
      formData.investmentsStartYield,
      formData.investmentsEndYield,
    );
    if (!investmentYieldValidation.isValid) {
      errors.investmentYield = investmentYieldValidation.message!;
    }

    const speculationYieldValidation = validateYieldRates(
      formData.speculationStartYield,
      formData.speculationEndYield,
    );
    if (!speculationYieldValidation.isValid) {
      errors.speculationYield = speculationYieldValidation.message!;
    }

    // Validate allocation percentages (sum AND individual bounds)
    const totalAllocation =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    if (totalAllocation !== 100) {
      errors.allocation = `Allocations must sum to 100% (current: ${totalAllocation}%)`;
    }

    // Validate individual allocation bounds
    if (formData.savingsPct < 0 || formData.savingsPct > 100) {
      errors.savingsPct = "Savings percentage must be between 0% and 100%";
    }
    if (formData.investmentsPct < 0 || formData.investmentsPct > 100) {
      errors.investmentsPct =
        "Investments percentage must be between 0% and 100%";
    }
    if (formData.speculationPct < 0 || formData.speculationPct > 100) {
      errors.speculationPct =
        "Speculation percentage must be between 0% and 100%";
    }

    // Validate exchange rate
    if (formData.exchangeRate < 0) {
      warnings.exchangeRate = "Exchange rate should be greater than 0";
    } else if (formData.exchangeRate === 0) {
      errors.exchangeRate = "Exchange rate must be greater than 0";
    }
    if (formData.exchangeRate > 10000000) {
      errors.exchangeRate = "Exchange rate cannot exceed $10,000,000";
    }

    // Validate price crash
    if (formData.priceCrash < 0) {
      errors.priceCrash = "Price crash cannot be negative";
    }
    if (formData.priceCrash > 1) {
      errors.priceCrash = "Price crash cannot exceed 100%";
    }

    // Validate LTV ratio (likely stored as percentage value, not decimal)
    if (formData.ltvRatio < 0) {
      errors.ltvRatio = "LTV ratio cannot be negative";
    }
    if (formData.ltvRatio > 100) {
      errors.ltvRatio = "LTV ratio cannot exceed 100%";
    }

    // Validate loan rate
    if (formData.loanRate < 0) {
      errors.loanRate = "Loan rate cannot be negative";
    }
    if (formData.loanRate > 100) {
      errors.loanRate = "Loan rate cannot exceed 100%";
    }

    // Validate loan term
    if (formData.loanTermYears <= 0) {
      errors.loanTermYears = "Loan term must be greater than 0 years";
    }
    if (formData.loanTermYears > 100) {
      errors.loanTermYears = "Loan term cannot exceed 100 years";
    }

    // Validate collateral percentage
    if (formData.collateralPct < 0 || formData.collateralPct > 100) {
      errors.collateralPct =
        "Collateral percentage must be between 0% and 100%";
    }

    // Validate income allocation percentage
    if (
      formData.incomeAllocationPct < 0 ||
      formData.incomeAllocationPct > 100
    ) {
      errors.incomeAllocationPct =
        "Income allocation percentage must be between 0% and 100%";
    }

    // Validate activation year
    if (formData.activationYear < 0) {
      errors.activationYear = "Activation year cannot be negative";
    }
    if (formData.activationYear >= formData.timeHorizon) {
      warnings.activationYear =
        "Activation year should be before the end of time horizon";
    }

    // Validate starting expenses
    if (formData.startingExpenses < 0) {
      errors.startingExpenses = "Starting expenses cannot be negative";
    }
    if (formData.startingExpenses > 1e12) {
      errors.startingExpenses = "Starting expenses cannot exceed $1 trillion";
    }
    if (formData.startingExpenses === 0) {
      warnings.startingExpenses = "Starting expenses should be greater than 0";
    }

    // Validate custom rate arrays (remove validation for now to maintain compatibility)
    // TODO: Re-enable with correct bounds after understanding data format
    // if (formData.btcPriceCustomRates.some(rate => rate < -0.95 || rate > 50)) {
    //   errors.btcPriceCustomRates = "BTC price growth rates must be between -95% and 5000%";
    // }

    // if (formData.inflationCustomRates.some(rate => rate < -0.5 || rate > 10)) {
    //   errors.inflationCustomRates = "Inflation rates must be between -50% and 1000%";
    // }

    // if (formData.incomeCustomRates.some(rate => rate < -0.9 || rate > 10)) {
    //   errors.incomeCustomRates = "Income growth rates must be between -90% and 1000%";
    // }

    const isValid = Object.keys(errors).length === 0;

    return { isValid, errors, warnings };
  };

  const validateTimeHorizon = (timeHorizon: number) => {
    if (timeHorizon < 1) {
      return {
        isValid: false,
        message: "Time horizon must be at least 1 year",
      };
    }
    if (timeHorizon > 100) {
      return {
        isValid: false,
        message: "Time horizon cannot exceed 100 years",
      };
    }
    return { isValid: true };
  };

  const validateBtcStack = (btcStack: number) => {
    if (btcStack <= 0) {
      return { isValid: false, message: "BTC stack must be greater than 0" };
    }
    if (btcStack > 1000000) {
      return {
        isValid: false,
        message: "BTC stack cannot exceed 1,000,000 BTC",
      };
    }
    return { isValid: true };
  };

  const validateYieldRates = (startYield: number, endYield: number) => {
    if (startYield < 0) {
      return { isValid: false, message: "Start yield cannot be negative" };
    }
    if (endYield < 0) {
      return { isValid: false, message: "End yield cannot be negative" };
    }
    if (startYield > 1000) {
      return { isValid: false, message: "Start yield cannot exceed 1000%" };
    }
    if (endYield > 1000) {
      return { isValid: false, message: "End yield cannot exceed 1000%" };
    }
    return { isValid: true };
  };

  return {
    validateFormData,
    validateTimeHorizon,
    validateBtcStack,
    validateYieldRates,
  };
};
