import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";
import { CubeIcon } from "@heroicons/react/24/outline";
import { getPackages } from "../api";
import { useCartStore } from "../stores/cartStore";
import PackageQuickView from "./PackageQuickView";
import Price from "./Price";

const PACKAGE_CART_ID_PREFIX = "package-";
const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
    <div className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Packages</h2>
        <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="group relative border-r border-b border-gray-200 p-4 sm:p-6 animate-pulse"
            >
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-4 h-3 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
              <div className="mt-4 h-8 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackageList() {
  const navigate = useNavigate();
  const setCart = useCartStore((state) => state.setCart);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await getPackages({ limit: 20 });
      return res.data?.data?.packages ?? [];
    },
  });

  const packages = Array.isArray(data) ? data : [];

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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Packages</h2>
        <p className="text-sm text-gray-500 mb-6">
          Save when you buy products together. Click a package card to open its
          details page, or use View details for a quick preview.
        </p>

        {error && (
          <p className="text-sm text-amber-600 mb-4">
            Could not load packages. If you deployed to Vercel, set{" "}
            <strong>VITE_BASE_URL</strong> to your Render backend URL in Vercel
            → Settings → Environment Variables, then redeploy with “Clear
            cache”.
          </p>
        )}

        {!error && packages.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">
            No packages yet. Add packages in Admin (Manage Packages) or run the
            seed script:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              node Backend/dev-data/seedPackages.js
            </code>
          </p>
        )}

        {!error && packages.length > 0 && (
          <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group relative border-r border-b border-gray-200 p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow duration-150"
                onClick={() => {
                  const path =
                    pkg.id != null
                      ? `/package-details/${pkg.id}`
                      : "/package-details";
                  navigate(path, { state: { package: pkg } });
                }}
              >
                <div className="aspect-square rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                  {pkg.imageSrc ? (
                    <img
                      alt={pkg.imageAlt || pkg.name}
                      src={packageImageSrc(pkg.imageSrc)}
                      className="w-full h-full object-contain group-hover:opacity-75 transition duration-150"
                    />
                  ) : (
                    <CubeIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openQuickView(pkg);
                  }}
                  className="mt-3 w-3/4 rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  View details
                </button>

                <div className="pt-10 pb-4 text-left">
                  <h3 className="text-sm font-medium text-gray-900">
                    <span className="relative line-clamp-2">{pkg.name}</span>
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((r) => (
                        <StarIcon
                          key={r}
                          aria-hidden="true"
                          className={classNames(
                            (pkg.rating ?? 0) > r
                              ? "text-yellow-400"
                              : "text-gray-200",
                            "size-5 shrink-0"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 font-bold">
                      {(pkg.rating ?? 0).toFixed(1)}
                    </p>
                  </div>

                  <p className="mt-4 text-base font-medium text-gray-900">
                    {pkg.quantityLabel || "1 pack"}
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    <Price amount={pkg.bundlePrice ?? 0} />
                  </p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
