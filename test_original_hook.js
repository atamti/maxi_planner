// Quick test of the original rate generation logic
const generateRates = (params) => {
  const {
    type,
    flatRate,
    startRate,
    endRate,
    preset,
    timeHorizon,
    presetScenarios,
  } = params;

  const rates = [];

  if (type === "linear") {
    for (let i = 0; i <= timeHorizon; i++) {
      const progress = i / Math.max(1, timeHorizon - 1);
      const rate = startRate + (endRate - startRate) * progress;
      rates.push(Math.round(rate));
    }
  }

  return rates;
};

// Test with same params as the failing test
const result = generateRates({
  type: "linear",
  flatRate: 0,
  startRate: 10,
  endRate: 20,
  preset: "",
  timeHorizon: 4,
});

console.log("Generated rates:", result);
console.log("Length:", result.length);
console.log("rates[4]:", result[4]);
