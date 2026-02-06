import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useCurrencyStore } from "../stores/currencyStore";

const currencies = [
  { code: "KES", symbol: "Ksh", flag: "🇰🇪", name: "Kenya" },
  { code: "TZS", symbol: "TSh", flag: "🇹🇿", name: "Tanzania" },
  { code: "UGX", symbol: "USh", flag: "🇺🇬", name: "Uganda" },
];

export default function CurrencySelector({ variant = "default" }) {
  const { currency, setCurrency } = useCurrencyStore();
  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  const isCompact = variant === "compact";

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
          isCompact
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span>{currentCurrency.flag}</span>
        <span>{currentCurrency.code}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {currencies.map((curr) => (
            <MenuItem key={curr.code}>
              <button
                onClick={() => setCurrency(curr.code)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  currency === curr.code
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{curr.flag}</span>
                <span>{curr.name}</span>
                <span className="ml-auto text-gray-400">{curr.symbol}</span>
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
