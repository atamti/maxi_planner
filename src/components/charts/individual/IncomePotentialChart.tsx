import React from "react";
import { Line } from "react-chartjs-2";

interface IncomePotentialChartProps {
  data: any;
  config: any;
}

export const IncomePotentialChart: React.FC<IncomePotentialChartProps> = ({
  data,
  config,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        📊 Income vs Expenses by Activation Year
      </h3>
      <Line data={data} options={config} />
      <p className="text-xs text-gray-600 mt-2">
        💡 Click on any point to set that year as your activation year
      </p>
    </div>
  );
};
