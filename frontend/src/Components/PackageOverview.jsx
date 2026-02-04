import { FaArrowRight } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import StarRating from "./StarRating";
import Reviews from "./Reviews";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useUserStore } from "../stores/userStore";
import { CubeIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { getReviewsByPackage, createPackageReview } from "../api";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
const PACKAGE_CART_ID_PREFIX = "package-";

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

function packageCartId(pkgId) {
  return `${PACKAGE_CART_ID_PREFIX}${pkgId}`;
}

export default function PackageOverview({ package: pkgProp }) {
  const navigate = useNavigate();
  const setCart = useCartStore((state) => state.setCart);
  const currentUser = useUserStore((s) => s.currentUser);
  const pkg = pkgProp || null;

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!pkg?.id) return;
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByPackage(pkg.id);
        const data = res.data;
        if (Array.isArray(data)) setReviews(data);
        else if (data?.reviews) setReviews(data.reviews);
      } catch (err) {
        console.error("Error fetching package reviews:", err);
      }
    };
    fetchReviews();
  }, [pkg?.id]);

  if (!pkg) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
        No package selected.
      </div>
    );
  }

  const imageSrc = packageImageSrc(pkg.imageSrc);
  const products = Array.isArray(pkg.products) ? pkg.products : [];
  const details = Array.isArray(pkg.details) ? pkg.details : [];

  const handleAddPackageReview = async (payload) => {
    const res = await createPackageReview(payload);
    const data = res.data;
    if (data && data._id) setReviews((prev) => [data, ...prev]);
  };

  const handleAddToCart = () => {
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
          imageSrc: imageSrc || "",
          imageAlt: pkg.imageAlt || pkg.name,
          description: pkg.description || "",
          leadTime: pkg.leadTime || "",
        },
      ];
    });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image - same layout as product */}
          <div className="aspect-square w-full rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center sm:rounded-lg">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={pkg.imageAlt || pkg.name}
                className="w-full h-full object-contain bg-gradient-to-t from-black/20 via-[#ffff]/10 to-black/10"
              />
            ) : (
              <CubeIcon className="w-24 h-24 text-gray-400" />
            )}
          </div>

          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {pkg.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Package price</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                Ksh {Number(pkg.bundlePrice ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="mt-3">
              <h3 className="sr-only">Rating</h3>
              <div className="flex items-center gap-2">
                <StarRating rating={pkg.rating ?? 0} size="md" />
                <span className="text-sm text-gray-500">
                  ({(pkg.rating ?? 0).toFixed(1)})
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              {pkg.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: pkg.description }}
                  className="space-y-6 text-base text-gray-700"
                />
              ) : (
                <p className="text-base text-gray-500">No description.</p>
              )}
            </div>

            <form className="mt-6">
              <div>
                <fieldset
                  aria-label="WhatsApp"
                  className="mt-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                >
                  <a
                    href={`https://wa.me/254796866058?text=Hi! I'd like to know more about this package: ${encodeURIComponent(
                      pkg.name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <FaWhatsapp size={32} color="green" />
                    <span className="text-blue-600">
                      Redirect to WhatsApp for more info
                    </span>
                    <FaArrowRight />
                  </a>
                </fieldset>
              </div>

              <div className="mt-10 flex">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden sm:w-full"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/products");
                  }}
                  className="ml-4 flex items-center justify-center rounded-md px-3 py-3 text-white gap-2 bg-indigo-600"
                >
                  Continue Shopping <FaArrowRight />
                </button>
              </div>
            </form>

            <section
              aria-labelledby="package-details-heading"
              className="mt-12"
            >
              <h2 id="package-details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t border-gray-200">
                {/* Features section - always shown first */}
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                        Features
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {(() => {
                      const featuresDetail = details.find(
                        (d) => d.name === "Features"
                      );
                      const items = featuresDetail?.items ?? [];
                      const text =
                        items.length > 0
                          ? items
                              .map((i) => (i ?? "").trim())
                              .filter(Boolean)
                              .join("\n")
                          : "";
                      return text ? (
                        <p className="text-sm/6 text-gray-700 whitespace-pre-line">
                          {text}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No features or usage information listed.
                        </p>
                      );
                    })()}
                  </DisclosurePanel>
                </Disclosure>

                {details
                  .filter(
                    (d) =>
                      d.name && d.name !== "Features" && Array.isArray(d.items)
                  )
                  .map((detail) => (
                    <Disclosure key={detail.name} as="div">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pb-6">
                        <ul
                          role="list"
                          className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
                        >
                          {detail.items.map((item) => (
                            <li key={item} className="pl-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </DisclosurePanel>
                    </Disclosure>
                  ))}

                {products.length > 0 && (
                  <Disclosure as="div">
                    <h3>
                      <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                        <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                          This package includes
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      <ul className="space-y-3 text-sm text-gray-700">
                        {products.map((prod) => (
                          <li
                            key={prod.id ?? prod._id}
                            className="flex items-center gap-3"
                          >
                            {prod.imageSrc ? (
                              <img
                                src={packageImageSrc(prod.imageSrc)}
                                alt={prod.imageAlt || prod.name}
                                className="h-10 w-10 rounded object-cover shrink-0"
                              />
                            ) : (
                              <span className="h-10 w-10 rounded bg-gray-200 shrink-0 flex items-center justify-center">
                                <CubeIcon className="h-5 w-5 text-gray-400" />
                              </span>
                            )}
                            <span className="font-medium text-gray-900">
                              {prod.name}
                            </span>
                            <span className="text-gray-500">
                              — KSh {Number(prod.price ?? 0).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </DisclosurePanel>
                  </Disclosure>
                )}
              </div>

              <Reviews
                subjectId={pkg.id}
                reviewPayloadKey="package"
                reviews={reviews}
                onAddReview={handleAddPackageReview}
                currentUser={currentUser}
                emptyMessage="This package does not have reviews yet."
                alreadyReviewedMessage="You have already reviewed this package."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
