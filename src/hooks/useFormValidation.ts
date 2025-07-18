import { FormData } from "../types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  message?: string;
  type: "error" | "warning";
}

/**
 * Custom hook for form validation logic
 * Consolidates validation rules and error handling
 */
export const useFormValidation = (formData: FormData) => {
  const validateAllocation = (): FieldValidation => {
    const total =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;

    if (total !== 100) {
      return {
        field: "allocation",
        isValid: false,
        message: `Allocations must sum to 100% (current: ${total}%)`,
        type: "error",
      };
    }

    return {
      field: "allocation",
      isValid: true,
      type: "error",
    };
  };

  const validateBtcStack = (): FieldValidation => {
    if (formData.btcStack <= 0) {
      return {
        field: "btcStack",
        isValid: false,
        message: "BTC stack must be greater than 0",
        type: "error",
      };
    }

    if (formData.btcStack < 1) {
      return {
        field: "btcStack",
        isValid: true,
        message:
          "Consider a BTC stack of at least 1 BTC for meaningful results",
        type: "warning",
      };
    }

    return {
      field: "btcStack",
      isValid: true,
      type: "error",
    };
  };

  const validateTimeHorizon = (): FieldValidation => {
    if (formData.timeHorizon < 1) {
      return {
        field: "timeHorizon",
        isValid: false,
        message: "Time horizon must be at least 1 year",
        type: "error",
      };
    }

    if (formData.timeHorizon > 50) {
      return {
        field: "timeHorizon",
        isValid: true,
        message: "Very long time horizons may have unrealistic assumptions",
        type: "warning",
      };
    }

    return {
      field: "timeHorizon",
      isValid: true,
      type: "error",
    };
  };

  const validateActivationYear = (): FieldValidation => {
    if (formData.activationYear < 0) {
      return {
        field: "activationYear",
        isValid: false,
        message: "Activation year cannot be negative",
        type: "error",
      };
    }

    if (formData.activationYear > formData.timeHorizon) {
      return {
        field: "activationYear",
        isValid: false,
        message: "Activation year cannot be beyond time horizon",
        type: "error",
      };
    }

    return {
      field: "activationYear",
      isValid: true,
      type: "error",
    };
  };

  const validateLoanParameters = (): FieldValidation => {
    if (formData.collateralPct > 0) {
      if (formData.ltvRatio <= 0 || formData.ltvRatio >= 100) {
        return {
          field: "ltvRatio",
          isValid: false,
          message: "LTV ratio must be between 0% and 100%",
          type: "error",
        };
      }

      if (formData.ltvRatio > 80) {
        return {
          field: "ltvRatio",
          isValid: true,
          message: "LTV ratios above 80% carry high liquidation risk",
          type: "warning",
        };
      }

      if (formData.loanRate <= 0) {
        return {
          field: "loanRate",
          isValid: false,
          message: "Loan rate must be greater than 0%",
          type: "error",
        };
      }

      if (formData.loanTermYears <= 0) {
        return {
          field: "loanTermYears",
          isValid: false,
          message: "Loan term must be greater than 0 years",
          type: "error",
        };
      }
    }

    return {
      field: "loanParameters",
      isValid: true,
      type: "error",
    };
  };

  const validateYields = (): FieldValidation => {
    if (
      formData.investmentsStartYield < 0 ||
      formData.investmentsEndYield < 0
    ) {
      return {
        field: "investmentsYield",
        isValid: false,
        message: "Investment yields cannot be negative",
        type: "error",
      };
    }

    if (
      formData.speculationStartYield < 0 ||
      formData.speculationEndYield < 0
    ) {
      return {
        field: "speculationYield",
        isValid: false,
        message: "Speculation yields cannot be negative",
        type: "error",
      };
    }

    if (
      formData.investmentsStartYield > 100 ||
      formData.speculationStartYield > 200
    ) {
      return {
        field: "yields",
        isValid: true,
        message: "Very high yields may be unrealistic",
        type: "warning",
      };
    }

    return {
      field: "yields",
      isValid: true,
      type: "error",
    };
  };

  const validateIncomeParameters = (): FieldValidation => {
    if (
      formData.incomeAllocationPct < 0 ||
      formData.incomeAllocationPct > 100
    ) {
      return {
        field: "incomeAllocation",
        isValid: false,
        message: "Income allocation must be between 0% and 100%",
        type: "error",
      };
    }

    if (
      formData.incomeReinvestmentPct < 0 ||
      formData.incomeReinvestmentPct > 100
    ) {
      return {
        field: "incomeReinvestment",
        isValid: false,
        message: "Income reinvestment must be between 0% and 100%",
        type: "error",
      };
    }

    if (formData.startingExpenses <= 0) {
      return {
        field: "startingExpenses",
        isValid: false,
        message: "Starting expenses must be greater than 0",
        type: "error",
      };
    }

    return {
      field: "incomeParameters",
      isValid: true,
      type: "error",
    };
  };

  const validateAll = (): ValidationResult => {
    const validations = [
      validateAllocation(),
      validateBtcStack(),
      validateTimeHorizon(),
      validateActivationYear(),
      validateLoanParameters(),
      validateYields(),
      validateIncomeParameters(),
    ];

    const errors = validations
      .filter((v) => !v.isValid && v.type === "error")
      .map((v) => v.message!)
      .filter(Boolean);

    const warnings = validations
      .filter((v) => v.isValid && v.type === "warning" && v.message)
      .map((v) => v.message!)
      .filter(Boolean);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const getFieldValidation = (field: string): FieldValidation => {
    switch (field) {
      case "allocation":
        return validateAllocation();
      case "btcStack":
        return validateBtcStack();
      case "timeHorizon":
        return validateTimeHorizon();
      case "activationYear":
        return validateActivationYear();
      case "loanParameters":
        return validateLoanParameters();
      case "yields":
        return validateYields();
      case "incomeParameters":
        return validateIncomeParameters();
      default:
        return {
          field,
          isValid: true,
          type: "error",
        };
    }
  };

  return {
    validateAll,
    getFieldValidation,
    validateAllocation,
    validateBtcStack,
    validateTimeHorizon,
    validateActivationYear,
    validateLoanParameters,
    validateYields,
    validateIncomeParameters,
  };
};
