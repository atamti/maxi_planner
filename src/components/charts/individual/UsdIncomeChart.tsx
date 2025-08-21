import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../../contexts/ThemeContext";

interface UsdIncomeChartProps {
  data: any;
  config: any;
}

export const UsdIncomeChart: React.FC<UsdIncomeChartProps> = ({
  data,
  config,
}) => {
  const { theme } = useTheme();

  return (
    <div className="card-themed rounded-none p-6">
      <h3 className="font-poppins text-lg font-bold text-navy-900 mb-4 uppercase tracking-wide">
        💵 USD INCOME STREAM
      </h3>
      <Line key={theme} data={data} options={config} />
    </div>
  );
};
