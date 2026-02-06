import { useCurrencyStore } from "../stores/currencyStore";

/**
 * Price component that automatically converts and formats prices based on selected currency
 * @param {number} amount - Price in KES (Kenya Shillings)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showOriginal - Show original KES price in parentheses (for non-KES currencies)
 */
export default function Price({ amount, className = "", showOriginal = false }) {
  const { formatPrice, currency } = useCurrencyStore();
  
  if (amount == null || isNaN(amount)) {
    return <span className={className}>-</span>;
  }

  const formattedPrice = formatPrice(amount);
  
  return (
    <span className={className}>
      {formattedPrice}
      {showOriginal && currency !== "KES" && (
        <span className="text-xs text-gray-400 ml-1">
          (Ksh {amount.toLocaleString()})
        </span>
      )}
    </span>
  );
}

/**
 * Hook to get price formatting function
 * Use this when you need to format prices in callbacks or complex scenarios
 */
export function usePrice() {
  const { formatPrice, convertPrice, currency, getCurrencyInfo } = useCurrencyStore();
  
  return {
    format: formatPrice,
    convert: convertPrice,
    currency,
    currencyInfo: getCurrencyInfo(),
  };
}
