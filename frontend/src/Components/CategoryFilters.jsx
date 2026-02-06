import { useState, Fragment } from "react";
import { Dialog, Transition, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { 
  ChevronDownIcon, 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon 
} from "@heroicons/react/20/solid";
import { useShopStore } from "../stores/shopStore";

const filters = {
  price: [
    { min: 0, max: 999, label: "Under Ksh 1,000" },
    { min: 1000, max: 1999, label: "Ksh 1,000 – Ksh 1,999" },
    { min: 2000, max: 2699, label: "Ksh 2,000 – Ksh 2,699" },
    { min: 2700, max: null, label: "Over Ksh 2,700" },
  ],

  category: [
    {
      value: "hair-growth-treatments",
      label: "Hair Growth Treatments",
      checked: false,
    },
    { value: "scalp-tools", label: "Scalp Tools", checked: false },
    { value: "hair-supplements", label: "Hair Supplements", checked: false },
    { value: "natural-oils", label: "Natural Oils", checked: false },
    {
      value: "shampoos-and-cleansers",
      label: "Shampoos & Cleansers",
      checked: false,
    },
  ],
};

const sortOptions = [
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
  { name: "Name: A–Z", value: "name-asc" },
  { name: "Name: Z–A", value: "name-desc" },
];

export default function CategoryFilters() {
  const { selectedFilters, setSelectedFilters, sortBy, setsortBy } = useShopStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const totalFilters = selectedFilters.price.length + selectedFilters.category.length;

  function handleFilterChange(filterType, value, checked) {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterType];
      let updatedValues;

      if (filterType === "price") {
        if (checked) {
          updatedValues = [...currentValues, value];
        } else {
          updatedValues = currentValues.filter(
            (v) => v.min !== value.min || v.max !== value.max
          );
        }
      }

      if (filterType === "category") {
        if (checked) {
          updatedValues = [...currentValues, value];
        } else {
          updatedValues = currentValues.filter((v) => v.value !== value);
        }
      }

      return { ...prev, [filterType]: updatedValues };
    });
  }

  const clearAllFilters = () => {
    setSelectedFilters({ price: [], category: [] });
  };

  return (
    <>
      {/* Mobile Filter Dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Filter Content */}
                <div className="flex-1 px-4 py-6 space-y-8">
                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
                    <div className="space-y-3">
                      {filters.price.map((option, optionIdx) => (
                        <label 
                          key={optionIdx}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex h-5 w-5 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedFilters.price.some(
                                (p) => p.min === option.min && p.max === option.max
                              )}
                              onChange={(e) =>
                                handleFilterChange("price", option, e.target.checked)
                              }
                              className="peer h-5 w-5 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
                            />
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                    <div className="space-y-3">
                      {filters.category.map((option, optionIdx) => (
                        <label 
                          key={optionIdx}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex h-5 w-5 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedFilters.category.includes(option.value)}
                              onChange={(e) =>
                                handleFilterChange("category", option.value, e.target.checked)
                              }
                              className="peer h-5 w-5 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
                            />
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                  {totalFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
                  >
                    View Results
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Main Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="py-10 lg:py-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              All Products
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base text-gray-500">
              Browse our complete collection of hair care and regrowth products. 
              Use filters to find exactly what you need.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-gray-200">
            {/* Left Side - Filters */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filters
                {totalFilters > 0 && (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-xs text-white">
                    {totalFilters}
                  </span>
                )}
              </button>

              {/* Desktop Filter Pills */}
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                
                {/* Price Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Price
                    {selectedFilters.price.length > 0 && (
                      <span className="h-5 w-5 rounded-full bg-indigo-600 text-xs text-white flex items-center justify-center">
                        {selectedFilters.price.length}
                      </span>
                    )}
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </MenuButton>
                  <MenuItems className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2">
                    {filters.price.map((option, idx) => (
                      <MenuItem key={idx} as="div">
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters.price.some(
                              (p) => p.min === option.min && p.max === option.max
                            )}
                            onChange={(e) =>
                              handleFilterChange("price", option, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>

                {/* Category Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Category
                    {selectedFilters.category.length > 0 && (
                      <span className="h-5 w-5 rounded-full bg-indigo-600 text-xs text-white flex items-center justify-center">
                        {selectedFilters.category.length}
                      </span>
                    )}
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </MenuButton>
                  <MenuItems className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2">
                    {filters.category.map((option, idx) => (
                      <MenuItem key={idx} as="div">
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters.category.includes(option.value)}
                            onChange={(e) =>
                              handleFilterChange("category", option.value, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>

                {/* Clear All */}
                {totalFilters > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all ({totalFilters})
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Sort */}
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500">Sort:</span>
                <span className="text-indigo-600">{sortOptions.find((opt) => opt.value === sortBy)?.name || 'Default'}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2">
                {sortOptions.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      onClick={() => setsortBy(option.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.name}
                      {sortBy === option.value && (
                        <CheckIcon className="h-4 w-4" />
                      )}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          {/* Active Filters Tags */}
          {totalFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-4">
              {selectedFilters.price.map((filter, idx) => (
                <span
                  key={`price-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-sm text-indigo-700"
                >
                  {filter.label}
                  <button
                    onClick={() => handleFilterChange("price", filter, false)}
                    className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              {selectedFilters.category.map((catValue, idx) => {
                const cat = filters.category.find(c => c.value === catValue);
                return (
                  <span
                    key={`cat-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-sm text-purple-700"
                  >
                    {cat?.label || catValue}
                    <button
                      onClick={() => handleFilterChange("category", catValue, false)}
                      className="hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
