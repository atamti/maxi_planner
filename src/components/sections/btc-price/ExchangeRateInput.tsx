import React from "react";
import { FormData } from "../../../types";

interface ExchangeRateInputProps {
  formData: FormData;
  formatNumberForDisplay: (value: number) => string;
  handleExchangeRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ExchangeRateInput: React.FC<ExchangeRateInputProps> = ({
  formData,
  formatNumberForDisplay,
  handleExchangeRateChange,
}) => {
  return (
    <div className="p-4 card-themed border border-bitcoin-orange">
      <h4 className="font-semibold text-bitcoin-orange mb-3 font-heading tracking-wide uppercase">
        💰 CURRENT BTC PRICE
      </h4>
      <div>
        <label className="block font-medium mb-1 text-primary font-ui">
          Starting USD Exchange Rate ($/₿):
        </label>
        <input
          type="text"
          value={formatNumberForDisplay(formData.exchangeRate)}
          onChange={handleExchangeRateChange}
          className="w-full p-2 border border-themed bg-surface text-primary font-mono rounded-none focus-ring-themed"
          placeholder="100,000"
        />
      </div>
    </div>
  );
};
