import React, { useEffect } from "react";
import economicScenarios from "../../config/economicScenarios";
import { createCalculationService } from "../../services/calculationService";
import { usePortfolioCompat } from "../../store";
import { useGeneralRateSystem } from "../../utils/shared/useGeneralRateSystem";
import { YieldChart } from "../charts/YieldChart";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { BtcPriceSection } from "./BtcPriceSection";
import { InflationSection } from "./InflationSection";

export const MarketAssumptionsSection: React.FC = () => {
  const { formData, updateFormData, calculationResults } = usePortfolioCompat();
  const calculationService = createCalculationService();

  const { generateRates, applyRatesToArray } = useGeneralRateSystem();

  // Initialize rates on component mount to ensure headers show correct averages
  useEffect(() => {
    let updatedData: Partial<typeof formData> = {};

    // Initialize inflation rates if using preset AND rates are completely missing
    if (
      formData.inflationInputType === "preset" &&
      formData.inflationPreset &&
      formData.inflationPreset !== "custom" &&
      (!formData.inflationCustomRates ||
        formData.inflationCustomRates.length === 0)
    ) {
      // Transform economic scenarios to the format expected by generateRates (inflation-specific)
      const inflationPresetScenarios: Record<string, any> = {};
      Object.entries(economicScenarios).forEach(([key, scenario]) => {
        inflationPresetScenarios[key] = scenario.inflation;
      });

      const inflationRates = generateRates({
        type: "preset",
        flatRate: formData.inflationFlat,
        startRate: formData.inflationStart,
        endRate: formData.inflationEnd,
        preset: formData.inflationPreset,
        timeHorizon: formData.timeHorizon,
        presetScenarios: inflationPresetScenarios,
      });

      const newInflationRates = applyRatesToArray(
        formData.inflationCustomRates,
        inflationRates,
        formData.timeHorizon,
        formData.inflationFlat || 8,
      );

      updatedData.inflationCustomRates = newInflationRates;
    } else {
    }

    // Initialize BTC rates if using preset AND rates are completely missing
    if (
      formData.btcPriceInputType === "preset" &&
      formData.btcPricePreset &&
      formData.btcPricePreset !== "custom" &&
      (!formData.btcPriceCustomRates ||
        formData.btcPriceCustomRates.length === 0)
    ) {
      // Transform economic scenarios to the format expected by generateRates (BTC-specific)
      const btcPresetScenarios: Record<string, any> = {};
      Object.entries(economicScenarios).forEach(([key, scenario]) => {
        btcPresetScenarios[key] = scenario.btcPrice;
      });

      const btcRates = generateRates({
        type: "preset",
        flatRate: formData.btcPriceFlat,
        startRate: formData.btcPriceStart,
        endRate: formData.btcPriceEnd,
        preset: formData.btcPricePreset,
        timeHorizon: formData.timeHorizon,
        presetScenarios: btcPresetScenarios,
      });

      const newBtcRates = applyRatesToArray(
        formData.btcPriceCustomRates,
        btcRates,
        formData.timeHorizon,
        formData.btcPriceFlat || 50,
      );

      updatedData.btcPriceCustomRates = newBtcRates;
    } else {
      // BTC rate initialization not needed
    }

    // Update form data if we have any changes
    if (Object.keys(updatedData).length > 0) {
      updateFormData(updatedData);
    }
  }, [
    formData.inflationInputType,
    formData.inflationPreset,
    formData.btcPriceInputType,
    formData.btcPricePreset,
    formData.timeHorizon,
  ]);

  // Check for economic scenario changes (for debugging)
  useEffect(() => {
    // Scenario state tracking for debugging
  }, [
    formData.economicScenario,
    formData.inflationPreset,
    formData.btcPricePreset,
  ]);

  // Calculate averages for use in titles with safety checks
  const avgInflation =
    formData.inflationCustomRates && formData.inflationCustomRates.length > 0
      ? calculationService
          .calculateSimpleAverage(
            formData.inflationCustomRates,
            formData.timeHorizon,
          )
          .toFixed(1)
      : "0";

  // Use centralized BTC appreciation calculation (CAGR)
  const avgBtcGrowth = (calculationResults.btcAppreciationAverage ?? 0).toFixed(
    1,
  );

  // Helper function to get inflation description
  const getInflationDescription = () => {
    if (
      formData.followEconomicScenarioInflation &&
      formData.economicScenario !== "custom"
    ) {
      const scenario =
        economicScenarios[
          formData.economicScenario as keyof typeof economicScenarios
        ];
      return scenario ? `${scenario.name} scenario` : "scenario-based";
    }

    switch (formData.inflationInputType) {
      case "preset":
        if (formData.inflationPreset && formData.inflationPreset !== "custom") {
          const scenario =
            economicScenarios[
              formData.inflationPreset as keyof typeof economicScenarios
            ];
          return scenario ? `${scenario.name} preset` : "preset";
        }
        return formData.inflationPreset === "custom"
          ? "Manual Configuration"
          : "preset";
      case "flat":
        return `${formData.inflationFlat}% flat`;
      case "linear":
        return `${formData.inflationStart}-${formData.inflationEnd}% range`;
      default:
        return "custom";
    }
  };

  // Helper function to get BTC description
  const getBtcDescription = () => {
    if (
      formData.followEconomicScenarioBtc &&
      formData.economicScenario !== "custom"
    ) {
      const scenario =
        economicScenarios[
          formData.economicScenario as keyof typeof economicScenarios
        ];
      return scenario ? `${scenario.name} scenario` : "scenario-based";
    }

    switch (formData.btcPriceInputType) {
      case "preset":
        if (formData.btcPricePreset && formData.btcPricePreset !== "custom") {
          const scenario =
            economicScenarios[
              formData.btcPricePreset as keyof typeof economicScenarios
            ];
          return scenario ? `${scenario.name} preset` : "preset";
        }
        return formData.btcPricePreset === "custom"
          ? "Manual Configuration"
          : "preset";
      case "flat":
        return `${formData.btcPriceFlat}% flat`;
      case "linear":
        return `${formData.btcPriceStart}-${formData.btcPriceEnd}% range`;
      case "saylor":
        return "Saylor projection (37%→21%)";
      default:
        return "custom";
    }
  };

  // Create descriptive title with current settings
  const getSectionTitle = () => {
    return `3. 📊 Market Assumptions: ${avgInflation}% avg inflation, ${avgBtcGrowth}% BTC CAGR, ${formData.investmentsStartYield}-${formData.investmentsEndYield}% investment yields`;
  };

  return (
    <CollapsibleSection title={getSectionTitle()} noGrid={true}>
      <div className="space-y-4">
        {/* Subsection 3a: USD Inflation */}
        <CollapsibleSection
          title={`3a. 💵 USD Inflation: ${avgInflation}% average (${getInflationDescription()})`}
          defaultExpanded={false}
          noGrid={true}
        >
          <InflationSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </CollapsibleSection>

        {/* Subsection 3b: BTC Price Appreciation */}
        <CollapsibleSection
          title={`3b. ₿ BTC Price Appreciation: ${avgBtcGrowth}% CAGR (${getBtcDescription()})`}
          defaultExpanded={false}
          noGrid={true}
        >
          <BtcPriceSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </CollapsibleSection>

        {/* Subsection 3c: BTC Yield Assumptions */}
        <CollapsibleSection
          title={`3c. 📈 BTC Yield Assumptions: ${formData.investmentsStartYield}-${formData.investmentsEndYield}% investments, ${formData.speculationStartYield}-${formData.speculationEndYield}% speculation`}
          defaultExpanded={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                INVESTMENTS
                <br />
                START YIELD (BTC %):
              </label>
              <input
                type="range"
                value={formData.investmentsStartYield}
                onChange={(e) =>
                  updateFormData({
                    investmentsStartYield: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
                min="0"
                max="100"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-secondary font-mono">0%</span>
                <span className="text-sm font-bold text-bitcoin-orange font-inter">
                  {formData.investmentsStartYield}% INITIAL YIELD
                </span>
                <span className="text-xs text-secondary font-mono">100%</span>
              </div>
            </div>
            <div>
              <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                INVESTMENTS
                <br />
                END YIELD (BTC %):
              </label>
              <input
                type="range"
                value={formData.investmentsEndYield}
                onChange={(e) =>
                  updateFormData({
                    investmentsEndYield: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
                min="0"
                max="50"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-secondary font-mono">0%</span>
                <span className="text-sm font-bold text-bitcoin-orange font-inter">
                  {formData.investmentsEndYield}% FINAL YIELD
                </span>
                <span className="text-xs text-secondary font-mono">50%</span>
              </div>
            </div>
            <div>
              <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                SPECULATION
                <br />
                START YIELD (BTC %):
              </label>
              <input
                type="range"
                value={formData.speculationStartYield}
                onChange={(e) =>
                  updateFormData({
                    speculationStartYield: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
                min="0"
                max="100"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-secondary font-mono">0%</span>
                <span className="text-sm font-bold text-bitcoin-orange font-inter">
                  {formData.speculationStartYield}% INITIAL YIELD
                </span>
                <span className="text-xs text-secondary font-mono">100%</span>
              </div>
            </div>
            <div>
              <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                SPECULATION
                <br />
                END YIELD (BTC %):
              </label>
              <input
                type="range"
                value={formData.speculationEndYield}
                onChange={(e) =>
                  updateFormData({
                    speculationEndYield: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
                min="0"
                max="50"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-secondary font-mono">0%</span>
                <span className="text-sm font-bold text-bitcoin-orange font-inter">
                  {formData.speculationEndYield}% FINAL YIELD
                </span>
                <span className="text-xs text-secondary font-mono">50%</span>
              </div>
            </div>
          </div>

          {/* Yield Projection Chart */}
          <div className="mt-6 p-4 bg-surface-alt rounded-none border-2 border-navy-900/50">
            <h4 className="font-poppins text-lg font-bold text-navy-900 mb-1 uppercase tracking-wide">
              📈 YIELD PROJECTION CHART
            </h4>
            <p className="text-sm text-secondary mb-4 font-mono">
              ₿ Yield %/Year
            </p>
            <div style={{ height: "250px" }}>
              <YieldChart formData={formData} />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  );
};
