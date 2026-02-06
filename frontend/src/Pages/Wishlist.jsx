import { Link } from "react-router-dom";
import { useWishlistStore } from "../stores/wishlistStore";
import { useCartStore } from "../stores/cartStore";
import Price from "../Components/Price";
import StarRating from "../Components/StarRating";
import { TrashIcon, ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

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

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { setCart } = useCartStore();

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageSrc: product.imageSrc,
          imageAlt: product.imageAlt,
        },
      ];
    });
    toast.success("Added to cart!");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <HeartIcon className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Your wishlist is empty
        </h2>
        <p className="mt-2 text-gray-500 text-center max-w-md">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-1 text-sm text-gray-500">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          <button
            onClick={() => {
              clearWishlist();
              toast("Wishlist cleared", { icon: "🗑️" });
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <div
              key={product._id}
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link
                to={`/product-details/${product._id}`}
                state={{ product }}
                className="block"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  <img
                    src={productImageSrc(product.imageSrc)}
                    alt={product.imageAlt || product.name}
                    className="h-full w-full object-contain group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mt-2">
                    <StarRating rating={product.rating ?? 0} size="sm" />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-indigo-600">
                    <Price amount={product.price} />
                  </p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    removeItem(product._id);
                    toast("Removed from wishlist", { icon: "💔" });
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
