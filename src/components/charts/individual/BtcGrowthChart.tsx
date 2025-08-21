import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../../contexts/ThemeContext";

interface BtcGrowthChartProps {
  data: any;
  config: any;
}

export const BtcGrowthChart: React.FC<BtcGrowthChartProps> = ({
  data,
  config,
}) => {
  const { theme } = useTheme();

  return (
    <div className="card-themed rounded-none p-6">
      <h3 className="font-poppins text-lg font-bold text-bitcoin-orange mb-4 uppercase tracking-wide">
        📈 BTC STACK GROWTH
      </h3>
      <Line key={theme} data={data} options={config} />
    </div>
  );
};
