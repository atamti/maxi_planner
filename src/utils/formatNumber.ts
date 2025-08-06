// Legacy formatNumber - use utils/shared/useNumberFormatting for new code
export const formatNumber = (num: number, decimals: number = 2): string => {
  // Safety check for undefined/null values
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (num: number, decimals: number = 2): string => {
  // Safety check for undefined/null values
  if (num === undefined || num === null || isNaN(num)) {
    return "$0";
  }
  return `$${formatNumber(num, decimals)}`;
};
