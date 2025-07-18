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
    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <h4 className="font-semibold text-blue-800 mb-3">💰 Current BTC Price</h4>
      <div>
        <label className="block font-medium mb-1">
          Starting USD Exchange Rate ($/₿):
        </label>
        <input
          type="text"
          value={formatNumberForDisplay(formData.exchangeRate)}
          onChange={handleExchangeRateChange}
          className="w-full p-2 border rounded font-mono"
          placeholder="100,000"
        />
      </div>
    </div>
  );
};
