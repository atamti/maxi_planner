export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (num: number, decimals: number = 2): string => {
  return `$${formatNumber(num, decimals)}`;
};
