import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getPackages } from "../api";
import Price from "./Price";

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch products for search
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch packages for search
  const { data: packagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await getPackages();
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData || [];
  const packages = packagesData || [];

  // Filter results based on query
  const filteredProducts = query.length >= 2
    ? products.filter((p) =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredPackages = query.length >= 2
    ? packages.filter((p) =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults = filteredProducts.length > 0 || filteredPackages.length > 0;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product-details/${productId}`);
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  const handlePackageClick = (packageId) => {
    navigate(`/package-details/${packageId}`);
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length >= 2);
            }}
            onFocus={() => setIsOpen(query.length >= 2)}
            placeholder="Search products, packages..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {!hasResults ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2">No results found for "{query}"</p>
              <p className="text-sm">Try different keywords</p>
            </div>
          ) : (
            <>
              {/* Products */}
              {filteredProducts.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                    Products
                  </div>
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      {product.imageSrc && (
                        <img
                          src={product.imageSrc.startsWith("http") ? product.imageSrc : product.imageSrc}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover bg-gray-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-indigo-600">
                          <Price amount={product.price} />
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Packages */}
              {filteredPackages.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                    Packages
                  </div>
                  {filteredPackages.map((pkg) => (
                    <button
                      key={pkg._id}
                      onClick={() => handlePackageClick(pkg._id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      {pkg.imageSrc && (
                        <img
                          src={pkg.imageSrc.startsWith("http") ? pkg.imageSrc : pkg.imageSrc}
                          alt={pkg.name}
                          className="h-12 w-12 rounded-md object-cover bg-gray-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pkg.name}
                        </p>
                        <p className="text-sm text-indigo-600">
                          <Price amount={pkg.bundlePrice} />
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <button
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                View all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
