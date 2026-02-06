import { create } from "zustand";
import { persist } from "zustand/middleware";

// Exchange rates relative to KES (Kenya Shilling)
// These are approximate rates - in production, you'd fetch live rates
const EXCHANGE_RATES = {
  KES: 1,
  TZS: 19.5,  // 1 KES ≈ 19.5 TZS
  UGX: 28.5,  // 1 KES ≈ 28.5 UGX
};

const CURRENCY_INFO = {
  KES: { code: "KES", symbol: "Ksh", name: "Kenya Shilling", country: "Kenya" },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzania Shilling", country: "Tanzania" },
  UGX: { code: "UGX", symbol: "USh", name: "Uganda Shilling", country: "Uganda" },
};

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: "KES", // Default currency
      
      setCurrency: (currency) => {
        if (EXCHANGE_RATES[currency]) {
          set({ currency });
        }
      },
      
      // Convert price from KES to selected currency
      convertPrice: (priceInKES) => {
        const { currency } = get();
        const rate = EXCHANGE_RATES[currency] || 1;
        return Math.round(priceInKES * rate);
      },
      
      // Format price with currency symbol
      formatPrice: (priceInKES) => {
        const { currency } = get();
        const rate = EXCHANGE_RATES[currency] || 1;
        const converted = Math.round(priceInKES * rate);
        const info = CURRENCY_INFO[currency];
        return `${info.symbol} ${converted.toLocaleString()}`;
      },
      
      // Get current currency info
      getCurrencyInfo: () => {
        const { currency } = get();
        return CURRENCY_INFO[currency];
      },
      
      // Get all available currencies
      getAvailableCurrencies: () => Object.values(CURRENCY_INFO),
    }),
    {
      name: "currency-storage",
    }
  )
);

// Helper hook for formatting prices
export function useFormatPrice() {
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  return formatPrice;
}

// Helper to get currency symbol
export function useCurrencySymbol() {
  const currency = useCurrencyStore((state) => state.currency);
  return CURRENCY_INFO[currency]?.symbol || "Ksh";
}
