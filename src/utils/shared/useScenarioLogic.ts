import { useCallback } from "react";

/**
 * Shared scenario management utility for handling economic scenarios
 * Provides consistent scenario application patterns across different rate types
 */
export const useScenarioLogic = (
  economicScenarios: any,
  timeHorizon: number,
) => {
  /**
   * Apply scenario to generate rates using provided generator function
   */
  const applyScenario = useCallback(
    (
      scenarioKey: string,
      rateGenerator: (scenarioData: any, horizon: number) => number[],
    ): number[] => {
      const scenario = economicScenarios[scenarioKey];
      if (scenario === undefined) {
        throw new Error(`Scenario not found: ${scenarioKey}`);
      }
      return rateGenerator(scenario, timeHorizon);
    },
    [economicScenarios, timeHorizon],
  );

  /**
   * Get available scenario keys (excluding custom)
   */
  const getAvailableScenarios = useCallback(() => {
    return Object.keys(economicScenarios).filter((key) => key !== "custom");
  }, [economicScenarios]);

  /**
   * Get scenario display data for dropdowns
   */
  const getScenarioDropdownData = useCallback(() => {
    const scenarios: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom") {
        scenarios[key] = scenario;
      }
    });
    return scenarios;
  }, [economicScenarios]);

  /**
   * Get all scenarios including custom (for internal processing)
   */
  const getAllScenarios = useCallback(() => {
    return economicScenarios;
  }, [economicScenarios]);

  /**
   * Check if a scenario exists
   */
  const scenarioExists = useCallback(
    (scenarioKey: string): boolean => {
      return scenarioKey in economicScenarios;
    },
    [economicScenarios],
  );

  /**
   * Get scenario data for a specific property
   */
  const getScenarioProperty = useCallback(
    (scenarioKey: string, property: string) => {
      const scenario = economicScenarios[scenarioKey];
      return scenario ? scenario[property] : undefined;
    },
    [economicScenarios],
  );

  return {
    applyScenario,
    getAvailableScenarios,
    getScenarioDropdownData,
    getAllScenarios,
    scenarioExists,
    getScenarioProperty,
  };
};
