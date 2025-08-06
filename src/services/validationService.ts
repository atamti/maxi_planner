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

    // Validate allocation
    const totalAllocation =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    if (totalAllocation !== 100) {
      errors.allocation = `Allocations must sum to 100% (current: ${totalAllocation}%)`;
    }

    // Warnings for edge cases
    if (formData.activationYear >= formData.timeHorizon) {
      warnings.activationYear =
        "Activation year should be before the end of time horizon";
    }

    if (formData.startingExpenses <= 0) {
      warnings.startingExpenses = "Starting expenses should be greater than 0";
    }

    if (formData.exchangeRate <= 0) {
      warnings.exchangeRate = "Exchange rate should be greater than 0";
    }

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
