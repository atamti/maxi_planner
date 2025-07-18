import React from "react";
import { Line } from "react-chartjs-2";

interface IncomeBtcChartProps {
  data: any;
  config: any;
}

export const IncomeBtcChart: React.FC<IncomeBtcChartProps> = ({
  data,
  config,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        ₿ USD Income in BTC Terms (Purchasing Power)
      </h3>
      <Line data={data} options={config} />
      <p className="text-xs text-gray-600 mt-2">
        📉 Shows how USD income and expenses lose purchasing power as BTC
        appreciates
      </p>
    </div>
  );
};
