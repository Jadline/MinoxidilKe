import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon, CubeIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import { getPackage } from "../api";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (imageSrc.startsWith("http")) return imageSrc;
  return BASE_URL ? BASE_URL + imageSrc : imageSrc;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PackageQuickView({ open, setOpen, packageData, onAddToCart }) {
  const { data, isLoading } = useQuery({
    queryKey: ["package", packageData?.id],
    queryFn: async () => {
      const res = await getPackage(packageData.id);
      return res.data?.data?.package ?? null;
    },
    enabled: open && !!packageData?.id,
  });

  const pkg = data || packageData;
  const products = data?.products ?? [];

  if (!pkg) return null;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <XMarkIcon className="size-6" />
          </button>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden shrink-0">
              {pkg.imageSrc ? (
                <img
                  src={packageImageSrc(pkg.imageSrc)}
                  alt={pkg.imageAlt || pkg.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CubeIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
              <div className="mt-2 flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((r) => (
                  <StarIcon
                    key={r}
                    className={classNames(
                      (pkg.rating ?? 0) > r ? "text-yellow-400" : "text-gray-200",
                      "size-5 shrink-0"
                    )}
                  />
                ))}
                <span className="text-sm text-gray-500 font-medium">
                  {(pkg.rating ?? 0).toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-indigo-600">
                KSh {Number(pkg.bundlePrice ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">{pkg.quantityLabel || "1 pack"}</p>

              {pkg.description ? (
                <p className="mt-4 text-sm text-gray-700">{pkg.description}</p>
              ) : null}

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">This package includes:</h3>
                {isLoading ? (
                  <p className="mt-1 text-sm text-gray-500">Loading…</p>
                ) : products.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {products.map((prod) => (
                      <li key={prod.id} className="flex items-center gap-2">
                        {prod.imageSrc ? (
                          <img
                            src={prod.imageSrc}
                            alt={prod.imageAlt || prod.name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        ) : null}
                        <span>{prod.name}</span>
                        <span className="text-gray-400">— KSh {Number(prod.price ?? 0).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    {Array.isArray(pkg.productIds) ? pkg.productIds.length : 0} product(s)
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onAddToCart?.()}
                className="mt-6 w-full rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-500"
              >
                Add package to Cart
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
