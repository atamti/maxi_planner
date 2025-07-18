import React from "react";
import { FormData } from "../../../types";
import { BtcExchangeChart } from "../../charts/BtcExchangeChart";

interface PriceProjectionChartProps {
  formData: FormData;
}

export const PriceProjectionChart: React.FC<PriceProjectionChartProps> = ({
  formData,
}) => {
  return (
    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
      <h4 className="font-semibold text-orange-800 mb-3">
        💹 Projected USD exchange rate
      </h4>
      <div style={{ height: "400px" }}>
        <BtcExchangeChart formData={formData} />
      </div>
    </div>
  );
};
