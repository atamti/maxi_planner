import { useMemo } from "react";
import { CalculationResults, FormData, Result } from "../types";

export const useCalculations = (formData: FormData): CalculationResults => {
  return useMemo(() => {
    const {
      btcStack,
      savingsPct,
      investmentsPct,
      speculationPct,
      collateralPct,
      loanRate,
      incomeYield,
      incomeAllocationPct,
      investmentsStartYield,
      investmentsEndYield,
      speculationStartYield,
      speculationEndYield,
      btcGrowth,
      priceCrash,
      exchangeRate,
      timeHorizon,
      activationYear,
    } = formData;

    const getYield = (year: number, start: number, end: number): number => {
      if (start === 0 && end === 0) return 0;
      return start - (start - end) * (year / timeHorizon);
    };

    // Initialize both scenarios with the same starting BTC stack
    let btcWithIncome = btcStack;
    let btcWithoutIncome = btcStack;
    let usdIncomePool = 0; // USD pool for income generation

    const results: Result[] = [];
    const usdIncome: number[] = [];
    const btcIncome: number[] = [];

    for (let year = 0; year <= timeHorizon; year++) {
      // Calculate yields for the current year
      const savingsYield = 0; // Savings grows at BTC rate only
      const investmentsYield =
        getYield(year, investmentsStartYield, investmentsEndYield) / 100;
      const speculationYield =
        getYield(year, speculationStartYield, speculationEndYield) / 100;

      // Calculate growth rates
      const btcGrowthRate = btcGrowth / 100;

      // Handle income allocation at activation year for btcWithIncome scenario only
      if (year === activationYear) {
        const btcToRemove = btcWithIncome * (incomeAllocationPct / 100);
        const currentBtcPrice =
          exchangeRate * Math.pow(1 + btcGrowthRate, year);
        usdIncomePool = btcToRemove * currentBtcPrice;

        // Scale down btcWithIncome by the allocation percentage
        btcWithIncome *= (100 - incomeAllocationPct) / 100;
      }

      // Calculate USD income from the separated USD pool
      const usdIncomeValue =
        year >= activationYear && usdIncomePool > 0
          ? usdIncomePool * (incomeYield / 100)
          : 0;
      const btcIncomeValue = 0; // Income is now entirely in USD

      // Record current year values BEFORE applying growth
      results.push({
        year,
        btcWithIncome: Math.max(0, btcWithIncome), // Prevent negative values
        btcWithoutIncome: Math.max(0, btcWithoutIncome),
      });
      usdIncome.push(year >= activationYear ? usdIncomeValue : 0);
      btcIncome.push(btcIncomeValue);

      // Apply growth to both scenarios using the same logic (for next year)
      if (year < timeHorizon) {
        const applyGrowth = (btcAmount: number): number => {
          const savings = btcAmount * (savingsPct / 100) * (1 + savingsYield);
          const investments =
            btcAmount * (investmentsPct / 100) * (1 + investmentsYield);
          const speculation =
            btcAmount * (speculationPct / 100) * (1 + speculationYield);
          return savings + investments + speculation;
        };

        btcWithIncome = applyGrowth(btcWithIncome);
        btcWithoutIncome = applyGrowth(btcWithoutIncome);
      }
    }

    // Apply price crash
    const crashMultiplier = 1 - priceCrash / 100;
    results.forEach((r) => {
      r.btcWithIncome *= crashMultiplier;
      r.btcWithoutIncome *= crashMultiplier;
    });

    // Calculate loan details
    const collateralValue =
      btcStack * (savingsPct / 100) * (collateralPct / 100);
    const loanPrincipal = collateralValue * 0.4 * exchangeRate; // 40% LTV typical for BTC loans
    const loanInterest = loanPrincipal * (loanRate / 100);

    // Calculate income potential for each possible activation year
    const incomeAtActivationYears: number[] = [];

    for (
      let potentialActivationYear = 0;
      potentialActivationYear <= timeHorizon;
      potentialActivationYear++
    ) {
      // Simulate BTC growth to the potential activation year
      let simulatedBtcStack = btcStack;

      for (let year = 0; year < potentialActivationYear; year++) {
        const yearInvestmentsYield =
          getYield(year, investmentsStartYield, investmentsEndYield) / 100;
        const yearSpeculationYield =
          getYield(year, speculationStartYield, speculationEndYield) / 100;

        const savings = simulatedBtcStack * (savingsPct / 100) * 1; // No additional yield
        const investments =
          simulatedBtcStack *
          (investmentsPct / 100) *
          (1 + yearInvestmentsYield);
        const speculation =
          simulatedBtcStack *
          (speculationPct / 100) *
          (1 + yearSpeculationYield);

        simulatedBtcStack = savings + investments + speculation;
      }

      // Calculate the USD value at potential activation year
      const btcToRemove = simulatedBtcStack * (incomeAllocationPct / 100);
      const btcPriceAtActivation =
        exchangeRate * Math.pow(1 + btcGrowth / 100, potentialActivationYear);
      const usdPoolValue = btcToRemove * btcPriceAtActivation;
      const effectiveRate = (incomeYield - incomeReinvestmentPct) / 100;
      const annualIncome = usdPoolValue * effectiveRate;

      incomeAtActivationYears.push(annualIncome);
    }

    return {
      results,
      usdIncome,
      btcIncome,
      incomeAtActivationYears,
      loanPrincipal,
      loanInterest,
    };
  }, [formData]);
};
