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
    <div className="p-4 card-themed border border-bitcoin-orange">
      <h4 className="font-semibold text-bitcoin-orange mb-3 font-heading tracking-wide uppercase">
        💹 PROJECTED USD EXCHANGE RATE
      </h4>
      <div style={{ height: "400px" }}>
        <BtcExchangeChart formData={formData} />
      </div>
    </div>
  );
};
