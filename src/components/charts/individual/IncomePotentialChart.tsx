import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../../contexts/ThemeContext";

interface IncomePotentialChartProps {
  data: any;
  config: any;
}

export const IncomePotentialChart: React.FC<IncomePotentialChartProps> = ({
  data,
  config,
}) => {
  const { theme } = useTheme();

  return (
    <div className="card-themed rounded-none p-6">
      <h3 className="font-poppins text-lg font-bold text-navy-900 mb-4 uppercase tracking-wide">
        📊 INCOME VS EXPENSES BY ACTIVATION YEAR
      </h3>
      <Line key={theme} data={data} options={config} />
      <p className="text-xs text-secondary mt-3 font-mono uppercase tracking-wide">
        💡 CLICK ON ANY POINT TO SET THAT YEAR AS YOUR ACTIVATION YEAR
      </p>
    </div>
  );
};
