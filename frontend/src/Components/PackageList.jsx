import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CubeIcon, EyeIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { getPackages } from "../api";
import { useCartStore } from "../stores/cartStore";
import PackageQuickView from "./PackageQuickView";
import Price from "./Price";
import StarRating, { isNewProduct, NewBadge } from "./StarRating";

const PACKAGE_CART_ID_PREFIX = "package-";
const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageCartId(pkgId) {
  return `${PACKAGE_CART_ID_PREFIX}${pkgId}`;
}

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (imageSrc.startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
  const origin =
    path.startsWith("/uploads/") && BASE_URL
      ? BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : BASE_URL || "";
  return origin ? origin + path : path;
}

function PackagesSkeleton() {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto animate-pulse mb-4" />
          <div className="h-4 w-96 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-gray-200" />
              <div className="mt-4 h-4 w-3/4 rounded-full bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-gray-200" />
              <div className="mt-4 h-10 rounded-xl bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const INITIAL_VISIBLE = 4;

export default function PackageList() {
  const navigate = useNavigate();
  const setCart = useCartStore((state) => state.setCart);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await getPackages({ limit: 50 });
      return res.data?.data?.packages ?? [];
    },
  });

  const allPackages = Array.isArray(data) ? data : [];
  const packages = showAll || allPackages.length <= INITIAL_VISIBLE 
    ? allPackages 
    : allPackages.slice(0, INITIAL_VISIBLE);
  const hasMorePackages = allPackages.length > INITIAL_VISIBLE;

  const handleAddPackageToCart = (pkg) => {
    const cartId = packageCartId(pkg.id);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: cartId,
          name: pkg.name,
          price: pkg.bundlePrice,
          quantity: 1,
          imageSrc: packageImageSrc(pkg.imageSrc) || pkg.imageSrc || "",
          imageAlt: pkg.imageAlt || pkg.name,
          description: pkg.description || "",
          leadTime: pkg.leadTime || "",
        },
      ];
    });
    setQuickViewOpen(false);
    setSelectedPackage(null);
  };

  const openQuickView = (pkg) => {
    setSelectedPackage(pkg);
    setQuickViewOpen(true);
  };

  if (isLoading) return <PackagesSkeleton />;

  if (!error && packages.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-semibold mb-4">
            <SparklesIcon className="w-4 h-4" />
            Bundle & Save
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Value Packages
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Save more when you buy products together. Our curated bundles are designed 
            for maximum results at the best value.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-6 bg-amber-50 border border-amber-200 rounded-xl text-center mb-8">
            <p className="text-amber-800">
              Could not load packages. Please check your connection or try again later.
            </p>
          </div>
        )}

        {!error && packages.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
                >
                  {/* Image Container */}
                  <div 
                    onClick={() => {
                      const path = pkg.id != null ? `/package-details/${pkg.id}` : "/package-details";
                      navigate(path, { state: { package: pkg } });
                    }}
                    className="relative cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-4 flex items-center justify-center">
                      {pkg.imageSrc ? (
                        <img
                          alt={pkg.imageAlt || pkg.name}
                          src={packageImageSrc(pkg.imageSrc)}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <CubeIcon className="w-16 h-16 text-indigo-300" />
                      )}
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isNewProduct(pkg) && <NewBadge />}
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        Bundle Deal
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>

                  {/* Package Info */}
                  <div className="p-4">
                    {/* Package Name */}
                    <h3 
                      onClick={() => {
                        const path = pkg.id != null ? `/package-details/${pkg.id}` : "/package-details";
                        navigate(path, { state: { package: pkg } });
                      }}
                      className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {pkg.name}
                    </h3>

                    {/* Rating */}
                    <div className="mt-2">
                      <StarRating 
                        rating={pkg.rating ?? 0} 
                        size="sm" 
                        reviewCount={pkg.reviewCount ?? 0}
                        showLabel={true}
                      />
                    </div>

                    {/* Quantity Label */}
                    <p className="mt-2 text-xs text-gray-500">
                      {pkg.quantityLabel || "Complete Bundle"}
                    </p>

                    {/* Price */}
                    <div className="mt-3">
                      <p className="text-lg font-bold text-gray-900">
                        <Price amount={pkg.bundlePrice ?? 0} />
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openQuickView(pkg);
                      }}
                      className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More / Show Less Button */}
            {hasMorePackages && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <ChevronUpIcon className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Show All {allPackages.length} Packages
                      <ChevronDownIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {quickViewOpen && selectedPackage && (
        <PackageQuickView
          open={quickViewOpen}
          setOpen={setQuickViewOpen}
          packageData={selectedPackage}
          onAddToCart={() => handleAddPackageToCart(selectedPackage)}
        />
      )}
    </section>
  );
}
