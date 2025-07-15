export type ScenarioKey =
  | "tight"
  | "debasement"
  | "crisis"
  | "spiral"
  | "custom";

export interface ScenarioPreset {
  name: string;
  startRate: number;
  endRate: number;
  maxAxis: number;
}

export interface ScenarioConfiguration {
  name: string;
  description: string;
  inflationAvg: number;
  btcAppreciationAvg: number;
  incomeGrowth: number;
  inflation: ScenarioPreset;
  btcPrice: ScenarioPreset;
  incomeYield: ScenarioPreset;
}

const economicScenarios: Record<ScenarioKey, ScenarioConfiguration> = {
  tight: {
    name: "Tight monetary policy",
    description: "Low inflation, steady BTC growth",
    inflationAvg: 2,
    btcAppreciationAvg: 15,
    incomeGrowth: 7.5,
    inflation: {
      name: "Tight monetary policy",
      startRate: 2,
      endRate: 2,
      maxAxis: 10,
    },
    btcPrice: {
      name: "Tight monetary policy - Low growth",
      startRate: 10,
      endRate: 30,
      maxAxis: 50,
    },
    incomeYield: {
      name: "Tight monetary policy - Stable income",
      startRate: 5,
      endRate: 5,
      maxAxis: 10,
    },
  },
  debasement: {
    name: "Managed debasement",
    description: "Moderate inflation, solid BTC growth",
    inflationAvg: 5,
    btcAppreciationAvg: 30,
    incomeGrowth: 12.5,
    inflation: {
      name: "Managed debasement",
      startRate: 8,
      endRate: 12,
      maxAxis: 20,
    },
    btcPrice: {
      name: "Managed debasement - Conservative growth",
      startRate: 30,
      endRate: 70,
      maxAxis: 100,
    },
    incomeYield: {
      name: "Managed debasement - Growing income",
      startRate: 8,
      endRate: 10,
      maxAxis: 15,
    },
  },
  crisis: {
    name: "Accelerated crisis",
    description: "Higher inflation, accelerated BTC adoption",
    inflationAvg: 12,
    btcAppreciationAvg: 60,
    incomeGrowth: 45,
    inflation: {
      name: "Accelerated crisis",
      startRate: 8,
      endRate: 25,
      maxAxis: 40,
    },
    btcPrice: {
      name: "Accelerated crisis - Rapid adoption",
      startRate: 50,
      endRate: 120,
      maxAxis: 150,
    },
    incomeYield: {
      name: "Accelerated crisis - Income ",
      startRate: 35,
      endRate: 40,
      maxAxis: 50,
    },
  },
  spiral: {
    name: "Hyperinflationary spiral",
    description: "High inflation, rapid BTC adoption",
    inflationAvg: 35,
    btcAppreciationAvg: 120,
    incomeGrowth: 11,
    inflation: {
      name: "Hyperinflationary spiral",
      startRate: 10,
      endRate: 100,
      maxAxis: 100,
    },
    btcPrice: {
      name: "Hyperbitcoinization",
      startRate: 80,
      endRate: 200,
      maxAxis: 250,
    },
    incomeYield: {
      name: "Hyperinflationary spiral",
      startRate: 20,
      endRate: 2,
      maxAxis: 25,
    },
  },
  custom: {
    name: "Manual configuration",
    description: "Manually configured settings",
    inflationAvg: 0,
    btcAppreciationAvg: 0,
    incomeGrowth: 0,
    inflation: {
      name: "Custom Inflation",
      startRate: 3,
      endRate: 3,
      maxAxis: 100,
    },
    btcPrice: {
      name: "Custom BTC Growth",
      startRate: 20,
      endRate: 20,
      maxAxis: 200,
    },
    incomeYield: {
      name: "Custom Income",
      startRate: 5, // Changed from 8 to 5 to be less intrusive
      endRate: 5, // Changed from 8 to 5 to be less intrusive
      maxAxis: 100,
    },
  },
};

export default economicScenarios;
