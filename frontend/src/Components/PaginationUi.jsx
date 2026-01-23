import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { MenuItems } from "@headlessui/react";
import { useShopStore } from "../stores/shopStore";
import { useShopProducts } from "../hooks/useShopProducts";

export default function PaginationComponent() {
  const currentPage = useShopStore((state) => state.currentPage);
  const setCurrentPage = useShopStore((state) => state.setCurrentPage);
  const itemsperPage = useShopStore((state) => state.itemsperPage);
  const { totalItems } = useShopProducts();

  const totalPages = itemsperPage > 0 ? Math.ceil(totalItems / itemsperPage) : 0;

  const indexOfLastItem = Math.min(currentPage * itemsperPage, totalItems);
  const indexofFirstItem = (currentPage - 1) * itemsperPage;

  function handleNext() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }
  function handlePrevious() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={isFirstPage}
          className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {totalItems === 0 ? 0 : indexofFirstItem + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            <button
              onClick={handlePrevious}
              disabled={isFirstPage}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === i + 1
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              disabled={isLastPage}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
