import { useMemo } from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
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
      loanTermYears,
      incomeAllocationPct,
      incomeReinvestmentPct,
      interestOnly,
      investmentsStartYield,
      investmentsEndYield,
      speculationStartYield,
      speculationEndYield,
      priceCrash,
      exchangeRate,
      timeHorizon,
      activationYear,
      startingExpenses,
      incomeCustomRates,
      inflationCustomRates,
      btcPriceCustomRates,
    } = formData;

    // Helper function to calculate yields that decline over time
    const getYield = (year: number, start: number, end: number): number => {
      if (start === 0 && end === 0) return 0;
      return start - (start - end) * (year / timeHorizon);
    };

    // Helper function to get income yield for a specific year
    const getIncomeYield = (year: number): number => {
      // If following economic scenario AND it's not custom, use the scenario's income yield progression
      if (
        formData.followEconomicScenarioIncome &&
        formData.economicScenario !== "custom"
      ) {
        const scenario =
          economicScenarios[formData.economicScenario as ScenarioKey];
        if (scenario && scenario.incomeYield) {
          const progress = year / Math.max(1, timeHorizon - 1);
          const curvedProgress = Math.pow(progress, 1.5);
          const yieldRate =
            scenario.incomeYield.startRate +
            (scenario.incomeYield.endRate - scenario.incomeYield.startRate) *
              curvedProgress;

          return yieldRate;
        }
      }

      // For all other cases (custom scenario, or when not following scenarios), use custom rates
      const customRate =
        incomeCustomRates[year] ||
        incomeCustomRates[incomeCustomRates.length - 1] ||
        8;

      return customRate;
    };

    // Helper function to get inflation rate for a specific year
    const getInflationRate = (year: number): number => {
      return (
        inflationCustomRates[year] ||
        inflationCustomRates[inflationCustomRates.length - 1] ||
        8
      );
    };

    // Helper function to get BTC appreciation rate for a specific year
    const getBtcAppreciationRate = (year: number): number => {
      return (
        btcPriceCustomRates[year] ||
        btcPriceCustomRates[btcPriceCustomRates.length - 1] ||
        50
      );
    };

    // Calculate BTC stack growth for a given year
    const calculateBtcGrowth = (btcAmount: number, year: number): number => {
      const savingsYield = 0; // Savings grows at BTC rate only
      const investmentsYield =
        getYield(year, investmentsStartYield, investmentsEndYield) / 100;
      const speculationYield =
        getYield(year, speculationStartYield, speculationEndYield) / 100;

      const savings = btcAmount * (savingsPct / 100) * (1 + savingsYield);
      const investments =
        btcAmount * (investmentsPct / 100) * (1 + investmentsYield);
      const speculation =
        btcAmount * (speculationPct / 100) * (1 + speculationYield);

      return savings + investments + speculation;
    };

    // Calculate BTC stack at a specific year
    const getBtcStackAtYear = (year: number): number => {
      let stack = btcStack;
      for (let i = 0; i < year; i++) {
        stack = calculateBtcGrowth(stack, i);
      }
      return stack;
    };

    // Calculate BTC price at a specific year using custom rates
    const getBtcPriceAtYear = (year: number): number => {
      let price = exchangeRate;
      for (let i = 0; i < year; i++) {
        const appreciationRate = getBtcAppreciationRate(i) / 100;
        price = price * (1 + appreciationRate);
      }
      return price;
    };

    // Calculate expenses at a specific year with inflation
    const getExpensesAtYear = (year: number): number => {
      let expenses = startingExpenses;
      for (let i = 0; i < year; i++) {
        const inflationRate = getInflationRate(i) / 100;
        expenses = expenses * (1 + inflationRate);
      }
      return expenses;
    };

    // Calculate loan details at activation year
    const calculateLoanDetails = (activationYear: number) => {
      const btcStackAtActivation = getBtcStackAtYear(activationYear);
      const btcSavingsAtActivation = btcStackAtActivation * (savingsPct / 100);
      const collateralBtc = btcSavingsAtActivation * (collateralPct / 100);
      const btcPriceAtActivation = getBtcPriceAtYear(activationYear);
      const loanPrincipal =
        collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;

      const debtService = interestOnly
        ? loanPrincipal * (loanRate / 100)
        : (loanPrincipal *
            ((loanRate / 100) * Math.pow(1 + loanRate / 100, loanTermYears))) /
          (Math.pow(1 + loanRate / 100, loanTermYears) - 1);

      return { loanPrincipal, debtService };
    };

    // Main calculation loop
    const results: Result[] = [];
    const usdIncome: number[] = [];
    const usdIncomeWithLeverage: number[] = [];
    const btcIncome: number[] = [];
    const annualExpenses: number[] = [];

    let btcWithIncome = btcStack;
    let btcWithoutIncome = btcStack;
    let usdIncomePool = 0;
    let leveragedUsdPool = 0;

    // Calculate loan details once for the actual activation year
    const loanDetails =
      collateralPct > 0
        ? calculateLoanDetails(activationYear)
        : { loanPrincipal: 0, debtService: 0 };

    // Also fix the main calculation loop for consistency
    for (let year = 0; year <= timeHorizon; year++) {
      // Calculate current year expenses
      const currentExpenses = getExpensesAtYear(year);
      annualExpenses.push(currentExpenses);

      // Handle income allocation at activation year
      if (year === activationYear) {
        const btcToRemove = btcWithIncome * (incomeAllocationPct / 100);
        const currentBtcPrice = getBtcPriceAtYear(year);
        usdIncomePool = btcToRemove * currentBtcPrice;

        // Initialize leveraged pool with original pool + loan proceeds (only if income allocation > 0)
        leveragedUsdPool =
          usdIncomePool +
          (collateralPct > 0 && incomeAllocationPct > 0
            ? loanDetails.loanPrincipal
            : 0);

        // Scale down btcWithIncome by the allocation percentage
        btcWithIncome *= (100 - incomeAllocationPct) / 100;
      }

      // Calculate income yields using dynamic rates
      const currentIncomeYield = getIncomeYield(year);
      const totalYieldRate = currentIncomeYield / 100;

      // Calculate total yield generated
      const totalBaseYield =
        year >= activationYear && usdIncomePool > 0
          ? usdIncomePool * totalYieldRate
          : 0;

      const totalLeveragedYield =
        year >= activationYear && leveragedUsdPool > 0
          ? leveragedUsdPool * totalYieldRate
          : 0;

      // Calculate reinvestment amounts (percentage of yield generated)
      const baseReinvestmentAmount =
        totalBaseYield * (incomeReinvestmentPct / 100);
      const leveragedReinvestmentAmount =
        totalLeveragedYield * (incomeReinvestmentPct / 100);

      // Net income is the remaining yield after reinvestment
      const baseUsdIncomeValue = totalBaseYield - baseReinvestmentAmount;
      const leveragedIncomeValue =
        totalLeveragedYield - leveragedReinvestmentAmount;

      // Calculate net leveraged income after debt service
      const netLeveragedIncome =
        year >= activationYear && collateralPct > 0 && incomeAllocationPct > 0
          ? leveragedIncomeValue - loanDetails.debtService
          : baseUsdIncomeValue;

      // Apply reinvestment to grow both pools
      if (year >= activationYear) {
        usdIncomePool += baseReinvestmentAmount;
        leveragedUsdPool += leveragedReinvestmentAmount;
      }

      // Record current year values
      results.push({
        year,
        btcWithIncome: Math.max(0, btcWithIncome),
        btcWithoutIncome: Math.max(0, btcWithoutIncome),
      });

      usdIncome.push(year >= activationYear ? baseUsdIncomeValue : 0);
      usdIncomeWithLeverage.push(
        year >= activationYear ? netLeveragedIncome : 0,
      );
      btcIncome.push(0);

      // Apply BTC growth for next year
      if (year < timeHorizon) {
        btcWithIncome = calculateBtcGrowth(btcWithIncome, year);
        btcWithoutIncome = calculateBtcGrowth(btcWithoutIncome, year);
      }
    }

    // Apply price crash
    const crashMultiplier = 1 - priceCrash / 100;
    results.forEach((r) => {
      r.btcWithIncome *= crashMultiplier;
      r.btcWithoutIncome *= crashMultiplier;
    });

    // Calculate income potential for each possible activation year
    const incomeAtActivationYears: number[] = [];
    const incomeAtActivationYearsWithLeverage: number[] = [];
    const expensesAtActivationYears: number[] = [];

    for (
      let potentialActivationYear = 0;
      potentialActivationYear <= timeHorizon;
      potentialActivationYear++
    ) {
      const simulatedBtcStack = getBtcStackAtYear(potentialActivationYear);
      const btcToRemove = simulatedBtcStack * (incomeAllocationPct / 100);
      const btcPriceAtActivation = getBtcPriceAtYear(potentialActivationYear);
      const usdPoolValue = btcToRemove * btcPriceAtActivation;
      const currentIncomeYield = getIncomeYield(potentialActivationYear);

      // Fix: Calculate yield properly - reinvestment is a percentage of yield generated
      const totalYieldRate = currentIncomeYield / 100;
      const totalYieldGenerated = usdPoolValue * totalYieldRate;
      const reinvestmentAmount =
        totalYieldGenerated * (incomeReinvestmentPct / 100);
      const annualIncome = totalYieldGenerated - reinvestmentAmount;

      // Calculate expenses at this activation year
      const expensesAtActivation = getExpensesAtYear(potentialActivationYear);

      // Calculate leveraged income potential
      let netLeveragedAnnualIncome = annualIncome;
      if (collateralPct > 0) {
        const potentialLoanDetails = calculateLoanDetails(
          potentialActivationYear,
        );
        const leveragedPoolValue =
          usdPoolValue + potentialLoanDetails.loanPrincipal;
        const leveragedTotalYield = leveragedPoolValue * totalYieldRate;
        const leveragedReinvestment =
          leveragedTotalYield * (incomeReinvestmentPct / 100);
        const leveragedAnnualIncome =
          leveragedTotalYield - leveragedReinvestment;
        netLeveragedAnnualIncome = Math.max(
          0,
          leveragedAnnualIncome - potentialLoanDetails.debtService,
        );
      }

      incomeAtActivationYears.push(annualIncome);
      incomeAtActivationYearsWithLeverage.push(netLeveragedAnnualIncome);
      expensesAtActivationYears.push(expensesAtActivation);
    }

    // Calculate loan details for display (using year 0 values for simplicity)
    const displayCollateralValue =
      btcStack * (savingsPct / 100) * (collateralPct / 100);
    const displayLoanPrincipal =
      displayCollateralValue * (formData.ltvRatio / 100) * exchangeRate;
    const displayLoanInterest = displayLoanPrincipal * (loanRate / 100);

    return {
      results,
      usdIncome,
      usdIncomeWithLeverage,
      btcIncome,
      annualExpenses,
      incomeAtActivationYears,
      incomeAtActivationYearsWithLeverage,
      expensesAtActivationYears,
      loanPrincipal: displayLoanPrincipal,
      loanInterest: displayLoanInterest,
    };
  }, [formData]);
};
