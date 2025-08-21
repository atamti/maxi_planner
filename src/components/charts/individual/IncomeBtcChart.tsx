import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../../contexts/ThemeContext";

interface IncomeBtcChartProps {
  data: any;
  config: any;
}

export const IncomeBtcChart: React.FC<IncomeBtcChartProps> = ({
  data,
  config,
}) => {
  const { theme } = useTheme();

  return (
    <div className="card-themed rounded-none p-6">
      <h3 className="font-poppins text-lg font-bold text-bitcoin-orange mb-1 uppercase tracking-wide">
        ₿ USD INCOME IN BTC TERMS (PURCHASING POWER)
      </h3>
      <p className="text-sm text-secondary mb-4 font-mono">₿</p>
      <Line key={theme} data={data} options={config} />
      <p className="text-xs text-secondary mt-3 font-mono uppercase tracking-wide">
        📉 SHOWS HOW USD INCOME AND EXPENSES LOSE PURCHASING POWER AS BTC
        APPRECIATES
      </p>
    </div>
  );
};
