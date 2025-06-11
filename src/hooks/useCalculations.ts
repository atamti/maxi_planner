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

    // Initialize portfolio allocations at year 0
    let btcSavings = btcStack * (savingsPct / 100);
    let btcInvestments = btcStack * (investmentsPct / 100);
    let btcSpeculation = btcStack * (speculationPct / 100);
    let btcIncomeAllocation = 0;

    // Track results for comparison scenario (no income allocation)
    let btcWithoutIncome = btcStack;

    const results: Result[] = [];
    const usdIncome: number[] = [];
    const btcIncome: number[] = [];
    const riskScores: number[] = [];

    for (let year = 0; year <= timeHorizon; year++) {
      // Get current year yields (these decay over time)
      const investmentsYield =
        getYield(year, investmentsStartYield, investmentsEndYield) / 100;
      const speculationYield =
        getYield(year, speculationStartYield, speculationEndYield) / 100;
      const btcGrowthRate = btcGrowth / 100;

      // Calculate growth rates for each bucket
      // Each bucket grows at BTC rate + its additional yield
      const savingsGrowthRate = btcGrowthRate;
      const investmentsGrowthRate = btcGrowthRate + investmentsYield;
      const speculationGrowthRate = btcGrowthRate + speculationYield;

      // For year 0, no growth yet
      if (year === 0) {
        // Initial allocation
        if (year >= activationYear) {
          // Move 10% to income bucket at activation
          const totalStack = btcSavings + btcInvestments + btcSpeculation;
          btcIncomeAllocation = totalStack * 0.1;
          btcSavings *= 0.9;
          btcInvestments *= 0.9;
          btcSpeculation *= 0.9;
        }
      } else {
        // Apply annual growth to each bucket
        btcSavings *= 1 + savingsGrowthRate;
        btcInvestments *= 1 + investmentsGrowthRate;
        btcSpeculation *= 1 + speculationGrowthRate;

        // Income bucket grows at USD rate (which decays in BTC terms)
        if (btcIncomeAllocation > 0) {
          // Income yield is in USD terms, so it gets diluted by BTC appreciation
          const realIncomeGrowth = incomeYield / 100 - btcGrowthRate;
          btcIncomeAllocation *= 1 + realIncomeGrowth;
        }

        // Check if activation happens this year
        if (year === activationYear && activationYear > 0) {
          const totalStack = btcSavings + btcInvestments + btcSpeculation;
          btcIncomeAllocation = totalStack * 0.1;
          btcSavings *= 0.9;
          btcInvestments *= 0.9;
          btcSpeculation *= 0.9;
        }

        // Update comparison scenario (simple compound growth)
        const avgYield =
          savingsGrowthRate * (savingsPct / 100) +
          investmentsGrowthRate * (investmentsPct / 100) +
          speculationGrowthRate * (speculationPct / 100);
        btcWithoutIncome *= 1 + avgYield;
      }

      // Calculate total BTC stack with income allocation
      const btcWithIncome =
        btcSavings + btcInvestments + btcSpeculation + btcIncomeAllocation;

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
      btcIncome.push(year >= activationYear ? btcIncomeAllocation : 0);
      riskScores.push(riskScore);
    }

    // Apply crash scenario to final results
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

    return {
      results,
      usdIncome,
      btcIncome,
      loanPrincipal,
      loanInterest,
    };
  }, [formData]);
};
