import { Link } from "react-router-dom";
import { useRecentlyViewedStore } from "../stores/recentlyViewedStore";
import Price from "./Price";
import StarRating from "./StarRating";

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

export default function RecentlyViewed({ excludeId, maxItems = 4 }) {
  const items = useRecentlyViewedStore((state) => state.items);
  
  // Filter out the current product if provided
  const filteredItems = excludeId
    ? items.filter((item) => item._id !== excludeId && item.id !== excludeId)
    : items;

  const displayItems = filteredItems.slice(0, maxItems);

  if (displayItems.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
        {filteredItems.length > maxItems && (
          <button
            onClick={() => useRecentlyViewedStore.getState().clearItems()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {displayItems.map((product) => (
          <Link
            key={product._id}
            to={`/product-details/${product._id}`}
            state={{ product }}
            className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={productImageSrc(product.imageSrc)}
                alt={product.imageAlt || product.name}
                className="h-full w-full object-contain group-hover:opacity-80 transition-opacity"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              <div className="mt-1">
                <StarRating rating={product.rating ?? 0} size="sm" />
              </div>
              <p className="mt-2 text-sm font-medium text-indigo-600">
                <Price amount={product.price} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
