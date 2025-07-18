import React from "react";
import { Line } from "react-chartjs-2";

interface UsdIncomeChartProps {
  data: any;
  config: any;
}

export const UsdIncomeChart: React.FC<UsdIncomeChartProps> = ({
  data,
  config,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">💵 USD Income Stream</h3>
      <Line data={data} options={config} />
    </div>
  );
};
