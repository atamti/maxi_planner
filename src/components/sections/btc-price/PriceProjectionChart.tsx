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
    <div className="p-4 card-themed border border-themed">
      <h4 className="font-semibold text-bitcoin-orange mb-1 font-heading tracking-wide uppercase">
        💹 PROJECTED USD EXCHANGE RATE
      </h4>
      <p className="text-sm text-secondary mb-4 font-mono">$Ms</p>
      <div style={{ height: "400px" }}>
        <BtcExchangeChart formData={formData} />
      </div>
    </div>
  );
};
