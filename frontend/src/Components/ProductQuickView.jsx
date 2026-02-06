import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import Price from "./Price";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function productImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
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

export default function ProductQuickView({ open, setOpen, product, setCart }) {
  if (!product) return null;

  const imgSrc =
    product.imageSrc ?? product.images?.[0]?.src ?? product.images?.[0]?.url;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="size-6" />
          </button>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <img
              src={productImageSrc(imgSrc)}
              alt={product.imageAlt}
              className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
            />

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h2>
              <p className="mt-2 text-lg text-gray-900"><Price amount={product.price} /></p>

              <div className="mt-3 flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={classNames(
                      product.rating > rating
                        ? "text-yellow-400"
                        : "text-gray-200",
                      "size-5 shrink-0"
                    )}
                  />
                ))}
                <p className="ml-2 text-sm text-gray-500">
                  {product.rating.toFixed(1)}
                </p>
              </div>

              <p className="mt-4 text-sm text-gray-700">
                {product.description}
              </p>

              <button
                onClick={() => {
                  setCart((prevcart) => {
                    const existingproduct = prevcart.find(
                      (item) => item.id === product.id
                    );
                    if (existingproduct) {
                      return prevcart.map((item) =>
                        item.id === product.id
                          ? { ...item, quantity: item.quantity + 1 }
                          : item
                      );
                    } else {
                      return [...prevcart, { ...product, quantity: 1 }];
                    }
                  });
                  setOpen(false);
                }}
                className="mt-6 w-full rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-500"
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
