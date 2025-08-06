import React, { useEffect } from "react";
import economicScenarios from "../../config/economicScenarios";
import { usePortfolioCompat } from "../../store";
import { useGeneralRateSystem } from "../../utils/shared/useGeneralRateSystem";
import { YieldChart } from "../charts/YieldChart";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { BtcPriceSection } from "./BtcPriceSection";
import { InflationSection } from "./InflationSection";

export const MarketAssumptionsSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolioCompat();
  const { generateRates, applyRatesToArray } = useGeneralRateSystem();

  // Initialize rates on component mount to ensure headers show correct averages
  useEffect(() => {
    let updatedData: Partial<typeof formData> = {};

    // Initialize inflation rates if using preset
    if (
      formData.inflationInputType === "preset" &&
      formData.inflationPreset &&
      formData.inflationPreset !== "custom"
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
    }

    // Initialize BTC rates if using preset
    if (
      formData.btcPriceInputType === "preset" &&
      formData.btcPricePreset &&
      formData.btcPricePreset !== "custom"
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
      ? (
          formData.inflationCustomRates
            .filter((rate) => !isNaN(rate) && isFinite(rate))
            .reduce((sum, rate) => sum + rate, 0) /
          formData.inflationCustomRates.filter(
            (rate) => !isNaN(rate) && isFinite(rate),
          ).length
        ).toFixed(1)
      : "0";

  const avgBtcGrowth =
    formData.btcPriceCustomRates && formData.btcPriceCustomRates.length > 0
      ? (
          formData.btcPriceCustomRates
            .filter((rate) => !isNaN(rate) && isFinite(rate))
            .reduce((sum, rate) => sum + rate, 0) /
          formData.btcPriceCustomRates.filter(
            (rate) => !isNaN(rate) && isFinite(rate),
          ).length
        ).toFixed(1)
      : "0";

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
    return `3. 📊 Market Assumptions: ${avgInflation}% avg inflation, ${avgBtcGrowth}% avg BTC growth, ${formData.investmentsStartYield}-${formData.investmentsEndYield}% investment yields`;
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
          title={`3b. ₿ BTC Price Appreciation: ${avgBtcGrowth}% average (${getBtcDescription()})`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Investments Start Yield (BTC %):
              </label>
              <input
                type="range"
                value={formData.investmentsStartYield}
                onChange={(e) =>
                  updateFormData({
                    investmentsStartYield: Number(e.target.value),
                  })
                }
                className="w-full"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                {formData.investmentsStartYield}% initial yield
              </span>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Speculation Start Yield (BTC %):
              </label>
              <input
                type="range"
                value={formData.speculationStartYield}
                onChange={(e) =>
                  updateFormData({
                    speculationStartYield: Number(e.target.value),
                  })
                }
                className="w-full"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                {formData.speculationStartYield}% initial yield
              </span>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Investments End Yield (BTC %):
              </label>
              <input
                type="range"
                value={formData.investmentsEndYield}
                onChange={(e) =>
                  updateFormData({
                    investmentsEndYield: Number(e.target.value),
                  })
                }
                className="w-full"
                min="0"
                max="50"
              />
              <span className="text-sm text-gray-600">
                {formData.investmentsEndYield}% final yield
              </span>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Speculation End Yield (BTC %):
              </label>
              <input
                type="range"
                value={formData.speculationEndYield}
                onChange={(e) =>
                  updateFormData({
                    speculationEndYield: Number(e.target.value),
                  })
                }
                className="w-full"
                min="0"
                max="50"
              />
              <span className="text-sm text-gray-600">
                {formData.speculationEndYield}% final yield
              </span>
            </div>
          </div>

          {/* Yield Projection Chart */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">📈 Yield Projection Chart</h4>
            <div style={{ height: "300px" }}>
              <YieldChart formData={formData} />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  );
};
