import { Link, NavLink } from "react-router-dom";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useCartStore } from "../stores/cartStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { getPublicSettings } from "../api";
import UserDropdown from "./userDropdown";
import CurrencySelector from "./CurrencySelector";

const navigation = {
  pages: [
    { name: "Home", to: "/" },
    { name: "Shop", to: "/products" },
    { name: "Contact", to: "/contact" },
  ],
};

// Default promo banner settings (used while loading or on error)
const DEFAULT_PROMO_BANNER = {
  enabled: true,
  text: "Get free delivery on orders over",
  freeDeliveryThreshold: 6000,
  showTruckEmoji: true,
};

export default function PageNav() {
  const cartCount = useCartStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );
  // Subscribe to both formatPrice AND currency to trigger re-render when currency changes
  const { formatPrice, currency } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  
  // Fetch promo banner settings from backend
  const { data: settingsData } = useQuery({
    queryKey: ["publicSettings"],
    queryFn: async () => {
      const res = await getPublicSettings();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
  
  const promoBanner = settingsData?.promoBanner || DEFAULT_PROMO_BANNER;

  return (
    <div className="bg-white">
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {navigation.pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <NavLink
                    to={page.to}
                    className="-m-2 block p-2 font-medium text-gray-900"
                  >
                    {page.name}
                  </NavLink>
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              <div className="flow-root">
                <span className="text-sm font-medium text-gray-500">Currency</span>
                <div className="mt-2">
                  <CurrencySelector />
                </div>
              </div>
              <div className="flow-root">
                <Link
                  to="/account"
                  className="-m-2 block p-2 font-medium text-gray-900"
                >
                  Create an account
                </Link>
              </div>
              <div className="flow-root">
                <Link
                  to="/login"
                  className="-m-2 block p-2 font-medium text-gray-900"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              <form>
                <div className="-ml-2 inline-grid grid-cols-1">
                  <Link to="/">
                    <h1 className="px-3">MinoxidilKe</h1>
                  </Link>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative">
        <nav aria-label="Top">
          <div className="bg-gradient-to-r from-[#000080] via-[#0066cc] to-[#39a9db]">
            <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <form className="hidden lg:block lg:flex-1">
                <div className="-ml-2 inline-grid grid-cols-1">
                  <Link to="/">
                    <h1 className="text-white">MinoxidilKe</h1>
                  </Link>
                </div>
              </form>

              {promoBanner.enabled && (
                <div className="flex-1 text-center text-sm font-medium text-white lg:flex-none overflow-hidden">
                  <p className="promo-text inline-flex items-center gap-2">
                    {promoBanner.showTruckEmoji && <span className="animate-bounce">🚚</span>}
                    <span className="font-semibold">
                      {promoBanner.text} {formatPrice(promoBanner.freeDeliveryThreshold)}
                    </span>
                    {promoBanner.showTruckEmoji && <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🚚</span>}
                  </p>
                </div>
              )}

              <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-4">
                <CurrencySelector variant="compact" />
                <span aria-hidden="true" className="h-6 w-px bg-gray-600" />
                <Link
                  to="/account"
                  className="text-sm font-medium text-white hover:text-gray-100"
                >
                  Create an account
                </Link>
                <span aria-hidden="true" className="h-6 w-px bg-gray-600" />
                <Link
                  to="/login"
                  className="text-sm font-medium text-white hover:text-gray-100"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="border-b border-gray-200">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      MK
                    </div> */}
                  </div>

                  <div className="hidden h-full lg:flex">
                    <PopoverGroup className="inset-x-0 bottom-0 px-4">
                      <div className="flex h-full justify-center space-x-8">
                        {navigation.pages.map((page) => (
                          <NavLink
                            key={page.name}
                            to={page.to}
                            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                          >
                            {page.name}
                          </NavLink>
                        ))}
                      </div>
                    </PopoverGroup>
                  </div>

                  <div className="flex flex-1 items-center lg:hidden">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="-ml-2 rounded-md bg-white p-2 text-gray-400"
                    >
                      <span className="sr-only">Open menu</span>
                      <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>

                    {/* <a
                      href="#"
                      className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon
                        aria-hidden="true"
                        className="size-6"
                      />
                    </a> */}
                  </div>

                  <a href="#" className="lg:hidden">
                    <span className="sr-only">Your Company</span>
                  </a>

                  <div className="flex flex-1 items-center justify-end">
                    <div className="flex items-center lg:ml-8">
                      <div className="flex space-x-8">
                        <div className="hidden lg:flex">
                          {/* <a
                            href="#"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Search</span>
                            <MagnifyingGlassIcon
                              aria-hidden="true"
                              className="size-6"
                            />
                          </a> */}
                        </div>

                        <div className="flex cursor-pointer">
                          <button className="-m-2 p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Account</span>
                            <UserIcon aria-hidden="true" className="size-6" />
                          </button>
                          <UserDropdown />
                        </div>
                      </div>

                      <span
                        aria-hidden="true"
                        className="mx-4 h-6 w-px bg-gray-200 lg:mx-6"
                      />

                      <div className="flow-root">
                        <Link
                          to="/cart"
                          className="group -m-2 flex items-center p-2"
                        >
                          <ShoppingCartIcon
                            aria-hidden="true"
                            className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                            {cartCount}
                          </span>
                          <span className="sr-only">
                            items in cart, view bag
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
