import { useMemo, useState } from "react";
import { FormData } from "../types";

export const useExchangeRateHandling = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
) => {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  // Format number with commas for display
  const formatNumberForDisplay = useMemo(() => {
    return (value: number): string => {
      return Math.round(value).toLocaleString();
    };
  }, []);

  // Parse number from formatted string
  const parseFormattedNumber = useMemo(() => {
    return (value: string): number => {
      return Number(value.replace(/,/g, ""));
    };
  }, []);

  // Handle exchange rate input change
  const handleExchangeRateChange = useMemo(() => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseFormattedNumber(inputValue);
      if (!isNaN(numericValue)) {
        updateFormData({ exchangeRate: numericValue });
      }
    };
  }, [parseFormattedNumber, updateFormData]);

  // Show locked message temporarily when user tries to interact with locked controls
  const handleLockedInteraction = useMemo(() => {
    return () => {
      if (formData.followEconomicScenarioBtc || formData.btcPriceManualMode) {
        setShowLockedMessage(true);
        setTimeout(() => setShowLockedMessage(false), 3000);
      }
    };
  }, [formData.followEconomicScenarioBtc, formData.btcPriceManualMode]);

  return {
    showLockedMessage,
    formatNumberForDisplay,
    parseFormattedNumber,
    handleExchangeRateChange,
    handleLockedInteraction,
  };
};
