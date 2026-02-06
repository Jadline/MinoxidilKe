import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon, CubeIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import { getPackage } from "../api";
import Price from "./Price";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  const s = String(imageSrc).trim();
  if (s.startsWith("http")) return s;
  const path = s.startsWith("/") ? s : "/" + s;
  const origin =
    path.startsWith("/uploads/") && BASE_URL
      ? BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : BASE_URL || "";
  return origin ? origin + path : path;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PackageQuickView({
  open,
  setOpen,
  packageData,
  onAddToCart,
}) {
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

  const imageSrc = packageImageSrc(pkg.imageSrc);

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl rounded-lg bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="size-6" />
          </button>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            {/* Left: prominent image */}
            <div className="aspect-square w-full rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={pkg.imageAlt || pkg.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <CubeIcon className="w-24 h-24 text-gray-400" />
              )}
            </div>

            {/* Right: title, price, rating, description, Add to Cart */}
            <div className="flex flex-col min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                <Price amount={pkg.bundlePrice ?? 0} />
              </p>

              <div className="mt-3 flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((r) => (
                  <StarIcon
                    key={r}
                    className={classNames(
                      (pkg.rating ?? 0) > r
                        ? "text-yellow-400"
                        : "text-gray-200",
                      "size-5 shrink-0"
                    )}
                  />
                ))}
                <span className="text-sm text-gray-500 font-medium">
                  {(pkg.rating ?? 0).toFixed(1)}
                </span>
              </div>

              <div className="mt-4 flex-1 min-h-0">
                {pkg.description ? (
                  typeof pkg.description === "string" &&
                  (pkg.description.startsWith("<") ||
                    pkg.description.includes("<p>")) ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: pkg.description }}
                      className="text-sm text-gray-700 leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {pkg.description}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No description.
                  </p>
                )}
              </div>


              <button
                type="button"
                onClick={() => onAddToCart?.()}
                className="mt-6 w-full rounded-md bg-indigo-600 py-3 text-base font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
