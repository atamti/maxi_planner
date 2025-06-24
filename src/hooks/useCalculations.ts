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
      loanTermYears,
      incomeYield,
      incomeAllocationPct,
      incomeReinvestmentPct,
      interestOnly,
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

    // Helper function to calculate yields that decline over time
    const getYield = (year: number, start: number, end: number): number => {
      if (start === 0 && end === 0) return 0;
      return start - (start - end) * (year / timeHorizon);
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

    // Calculate loan details at activation year
    const calculateLoanDetails = (activationYear: number) => {
      const btcStackAtActivation = getBtcStackAtYear(activationYear);
      const btcSavingsAtActivation = btcStackAtActivation * (savingsPct / 100);
      const collateralBtc = btcSavingsAtActivation * (collateralPct / 100);
      const btcPriceAtActivation =
        exchangeRate * Math.pow(1 + btcGrowth / 100, activationYear);
      const loanPrincipal = collateralBtc * 0.4 * btcPriceAtActivation;

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

    let btcWithIncome = btcStack;
    let btcWithoutIncome = btcStack;
    let usdIncomePool = 0;
    let leveragedUsdPool = 0;

    // Calculate loan details once for the actual activation year
    const loanDetails =
      collateralPct > 0
        ? calculateLoanDetails(activationYear)
        : { loanPrincipal: 0, debtService: 0 };

    for (let year = 0; year <= timeHorizon; year++) {
      // Handle income allocation at activation year
      if (year === activationYear) {
        const btcToRemove = btcWithIncome * (incomeAllocationPct / 100);
        const currentBtcPrice =
          exchangeRate * Math.pow(1 + btcGrowth / 100, year);
        usdIncomePool = btcToRemove * currentBtcPrice;

        // Initialize leveraged pool with original pool + loan proceeds
        leveragedUsdPool =
          usdIncomePool + (collateralPct > 0 ? loanDetails.loanPrincipal : 0);
        // console.log(`Year ${year}: USD Income Pool = ${usdIncomePool}, Leveraged USD Pool = ${leveragedUsdPool}`);

        // Scale down btcWithIncome by the allocation percentage
        btcWithIncome *= (100 - incomeAllocationPct) / 100;
      }

      // Calculate income yields
      const effectiveIncomeRate = (incomeYield - incomeReinvestmentPct) / 100;

      const baseUsdIncomeValue =
        year >= activationYear && usdIncomePool > 0
          ? usdIncomePool * effectiveIncomeRate
          : 0;
      // console.log(`Year ${year}: Base USD Income Value = ${baseUsdIncomeValue}`);

      const leveragedIncomeValue =
        year >= activationYear && leveragedUsdPool > 0
          ? leveragedUsdPool * effectiveIncomeRate
          : 0;
      // console.log(`Year ${year}: Leveraged USD Income Value = ${leveragedIncomeValue}`);

      // Calculate net leveraged income after debt service
      const netLeveragedIncome =
        year >= activationYear && collateralPct > 0
          ? leveragedIncomeValue - loanDetails.debtService
          : baseUsdIncomeValue;
      // console.log(`Year ${year}: Net Leveraged Income = ${netLeveragedIncome}`);

      // Apply reinvestment to grow both pools
      if (year >= activationYear) {
        const baseReinvestmentAmount =
          usdIncomePool * (incomeReinvestmentPct / 100);
        const leveragedReinvestmentAmount =
          leveragedUsdPool * (incomeReinvestmentPct / 100);

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

    for (
      let potentialActivationYear = 0;
      potentialActivationYear <= timeHorizon;
      potentialActivationYear++
    ) {
      const simulatedBtcStack = getBtcStackAtYear(potentialActivationYear);
      const btcToRemove = simulatedBtcStack * (incomeAllocationPct / 100);
      const btcPriceAtActivation =
        exchangeRate * Math.pow(1 + btcGrowth / 100, potentialActivationYear);
      const usdPoolValue = btcToRemove * btcPriceAtActivation;
      const effectiveRate = (incomeYield - incomeReinvestmentPct) / 100;
      const annualIncome = usdPoolValue * effectiveRate;

      // Calculate leveraged income potential
      let netLeveragedAnnualIncome = annualIncome;
      if (collateralPct > 0) {
        const potentialLoanDetails = calculateLoanDetails(
          potentialActivationYear,
        );
        const leveragedPoolValue =
          usdPoolValue + potentialLoanDetails.loanPrincipal;
        const leveragedAnnualIncome = leveragedPoolValue * effectiveRate;
        netLeveragedAnnualIncome = Math.max(
          0,
          leveragedAnnualIncome - potentialLoanDetails.debtService,
        );
      }

      incomeAtActivationYears.push(annualIncome);
      incomeAtActivationYearsWithLeverage.push(netLeveragedAnnualIncome);
    }

    // Calculate loan details for display (using year 0 values for simplicity)
    const displayCollateralValue =
      btcStack * (savingsPct / 100) * (collateralPct / 100);
    const displayLoanPrincipal = displayCollateralValue * 0.4 * exchangeRate;
    const displayLoanInterest = displayLoanPrincipal * (loanRate / 100);

    return {
      results,
      usdIncome,
      usdIncomeWithLeverage,
      btcIncome,
      incomeAtActivationYears,
      incomeAtActivationYearsWithLeverage,
      loanPrincipal: displayLoanPrincipal,
      loanInterest: displayLoanInterest,
    };
  }, [formData]);
};
