import React from "react";
import { Line } from "react-chartjs-2";

interface BtcGrowthChartProps {
  data: any;
  config: any;
}

export const BtcGrowthChart: React.FC<BtcGrowthChartProps> = ({
  data,
  config,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">📈 BTC Stack Growth</h3>
      <Line data={data} options={config} />
    </div>
  );
};
