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

    let btcWithIncome = btcStack;
    let btcWithoutIncome = btcStack;
    const results: Result[] = [];
    const usdIncome: number[] = [];
    const btcIncome: number[] = [];
    const riskScores: number[] = [];

    for (let year = 0; year <= timeHorizon; year++) {
      const investmentsYield = getYield(
        year,
        investmentsStartYield,
        investmentsEndYield,
      );
      const speculationYield = getYield(
        year,
        speculationStartYield,
        speculationEndYield,
      );

      const savingsGrowth = btcGrowth / 100;
      const investmentsGrowth =
        (btcGrowth * (1 + investmentsYield / 100)) / 100;
      const speculationGrowth =
        (btcGrowth * (1 + speculationYield / 100)) / 100;

      const savingsWithout =
        btcWithoutIncome *
        (savingsPct / 100) *
        Math.pow(1 + savingsGrowth, year);
      const investmentsWithout =
        btcWithoutIncome *
        (investmentsPct / 100) *
        Math.pow(1 + investmentsGrowth, year);
      const speculationWithout =
        btcWithoutIncome *
        (speculationPct / 100) *
        Math.pow(1 + speculationGrowth, year);
      btcWithoutIncome =
        savingsWithout + investmentsWithout + speculationWithout;

      let savingsWith = btcWithIncome * (savingsPct / 100);
      let investmentsWith = btcWithIncome * (investmentsPct / 100);
      let speculationWith = btcWithIncome * (speculationPct / 100);
      let incomeWith = 0;

      if (year >= activationYear) {
        const incomeAllocation = btcWithIncome * 0.1;
        savingsWith *= 0.9 / (savingsPct / 100);
        investmentsWith *= 0.9 / (investmentsPct / 100);
        speculationWith *= 0.9 / (speculationPct / 100);
        incomeWith =
          incomeAllocation *
          Math.pow(1 + incomeYield / 100, year - activationYear);
      }

      savingsWith *= Math.pow(1 + savingsGrowth, year);
      investmentsWith *= Math.pow(1 + investmentsGrowth, year);
      speculationWith *= Math.pow(1 + speculationGrowth, year);
      btcWithIncome = savingsWith + investmentsWith + speculationWith;

      const usdIncomeValue =
        incomeWith * exchangeRate * Math.pow(1 + btcGrowth / 100, year);
      const btcIncomeValue =
        usdIncomeValue / (exchangeRate * Math.pow(1 + btcGrowth / 100, year));

      const riskScore = Math.min(
        100,
        2 * investmentsPct +
          5 * speculationPct +
          (year >= activationYear ? 10 : 0) +
          (btcGrowth - 20) / 10 +
          (collateralPct > 0 ? 10 + (loanRate - 5) : 0) +
          (investmentsStartYield > 0 ? 5 : 0) +
          (speculationStartYield > 0 ? 5 : 0),
      );

      results.push({ year, btcWithIncome, btcWithoutIncome });
      usdIncome.push(year >= activationYear ? usdIncomeValue : 0);
      btcIncome.push(year >= activationYear ? btcIncomeValue : 0);
      riskScores.push(riskScore);
    }

    const crashMultiplier = 1 - priceCrash / 100;
    results.forEach((r) => {
      r.btcWithIncome *= crashMultiplier;
      r.btcWithoutIncome *= crashMultiplier;
    });

    const loanPrincipal =
      btcStack *
      (savingsPct / 100) *
      (collateralPct / 100) *
      0.4 *
      exchangeRate;
    const loanInterest = loanPrincipal * (loanRate / 100);

    return {
      results,
      usdIncome,
      btcIncome,
      riskScores,
      loanPrincipal,
      loanInterest,
    };
  }, [formData]);
};
