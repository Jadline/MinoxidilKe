import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/20/solid";

import { useProducts } from "../contexts/ProductContext";

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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CategoryFilters() {
  const { selectedFilters, setSelectedFilters } = useProducts();
  const { sortBy, setsortBy } = useProducts();

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
  return (
    <div className="bg-white">
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Hair Regrowth Treatments
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
          Restore your confidence with clinically proven solutions formulated to
          stimulate hair follicles and promote visible growth. Explore our range
          of Minoxidil-based treatments trusted by men and women across Kenya.
        </p>
      </div>

      {/* Filters */}
      <Disclosure
        as="section"
        aria-labelledby="filter-heading"
        className="grid items-center border-t border-b border-gray-200"
      >
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>
        <div className="relative col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl divide-x divide-gray-200 px-4 text-sm sm:px-6 lg:px-8">
            <div className="pr-6">
              <DisclosureButton className="group flex items-center font-medium text-gray-700">
                <FunnelIcon
                  aria-hidden="true"
                  className="mr-2 size-5 flex-none text-gray-400 group-hover:text-gray-500"
                />
                {selectedFilters.price.length + selectedFilters.category.length}
              </DisclosureButton>
            </div>
            <div className="pl-6">
              <button
                type="button"
                className="text-gray-500"
                onClick={() =>
                  setSelectedFilters({
                    price: [],
                    category: [],
                  })
                }
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
        <DisclosurePanel className="border-t border-gray-200 py-10">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
            <div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
              <fieldset>
                <legend className="block font-medium">Price</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {filters.price.map((option, optionIdx) => (
                    <div key={option.value} className="flex gap-3">
                      <div className="flex h-5 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id={`price-${optionIdx}`}
                            name="price[]"
                            type="checkbox"
                            checked={selectedFilters.price.some(
                              (p) =>
                                p.min === option.min && p.max === option.max
                            )}
                            onChange={(e) =>
                              handleFilterChange(
                                "price",
                                option,
                                e.target.checked
                              )
                            }
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <label
                        htmlFor={`price-${optionIdx}`}
                        className="text-base text-gray-600 sm:text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
              <fieldset>
                <legend className="block font-medium">Category</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {filters.category.map((option, optionIdx) => (
                    <div key={option.value} className="flex gap-3">
                      <div className="flex h-5 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id={`category-${optionIdx}`}
                            name="category[]"
                            value={option.value}
                            checked={selectedFilters.category.includes(
                              option.value
                            )}
                            onChange={(e) =>
                              handleFilterChange(
                                "category",
                                option.value,
                                e.target.checked
                              )
                            }
                            type="checkbox"
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <label
                        htmlFor={`category-${optionIdx}`}
                        className="text-base text-gray-600 sm:text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </DisclosurePanel>
        <div className="col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
            <Menu as="div" className="relative inline-block">
              <div className="flex">
                <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  <span>Sort</span>
                  <span className="ml-1 text-indigo-500">
                    {sortOptions.find((opt) => opt.value === sortBy)?.name}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                  />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value}>
                      <p
                        onClick={() => setsortBy(option.value)}
                        className={classNames(
                          sortBy === option.value
                            ? "font-medium text-gray-900"
                            : "text-gray-500",
                          "block px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden cursor-pointer"
                        )}
                      >
                        {option.name}
                      </p>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </Disclosure>
    </div>
  );
}
