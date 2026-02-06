import { useState } from "react";
import ProductQuickView from "./ProductQuickView";
import StarRating, { NewBadge, isNewProduct } from "./StarRating";
import Price from "./Price";
import WishlistButton from "./WishlistButton";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useShopProducts } from "../hooks/useShopProducts";
import { EyeIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

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

function ProductsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 animate-pulse"
          >
            <div className="aspect-square rounded-xl bg-gray-200" />
            <div className="mt-4 h-4 w-3/4 rounded-full bg-gray-200" />
            <div className="mt-2 h-3 w-1/2 rounded-full bg-gray-200" />
            <div className="mt-4 h-10 rounded-xl bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductList() {
  const { products, isLoadingProducts, productsError } = useShopProducts();
  const { setCart } = useCartStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  if (isLoadingProducts) return <ProductsSkeleton />;

  if (productsError)
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Unable to load products</p>
          <p className="mt-2 text-gray-500">Please try refreshing the page.</p>
        </div>
      </div>
    );

  if (!products || products.length === 0)
    return (
      <div className="py-24 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900">No products found</p>
          <p className="mt-2 text-gray-500">
            Try clearing some filters or adjusting your search criteria.
          </p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h2 className="sr-only">Products</h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div
            key={product.id ?? product._id}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
          >
            {/* Image Container */}
            <div 
              onClick={() => {
                if (product) {
                  const path =
                    product.id != null
                      ? `/product-details/${product.id}`
                      : "/product-details";
                  navigate(path, { state: { product } });
                }
              }}
              className="relative cursor-pointer"
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <img
                  alt={product.imageAlt}
                  src={productImageSrc(
                    product.imageSrc ??
                      product.images?.[0]?.src ??
                      product.images?.[0]?.url
                  )}
                  className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                    product.inStock === false ? "opacity-60" : ""
                  }`}
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isNewProduct(product) && product.inStock !== false && (
                  <NewBadge />
                )}
                {product.inStock === false && (
                  <span className="inline-flex items-center rounded-full bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                    Out of stock
                  </span>
                )}
              </div>
              
              {/* Wishlist Button */}
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton 
                  product={product} 
                  size="sm" 
                  className="bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white" 
                />
              </div>

              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Product Name */}
              <h3 
                onClick={() => {
                  if (product) {
                    const path =
                      product.id != null
                        ? `/product-details/${product.id}`
                        : "/product-details";
                    navigate(path, { state: { product } });
                  }
                }}
                className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {product.name}
              </h3>

              {/* Rating */}
              <div className="mt-2">
                <StarRating 
                  rating={product.rating ?? 0} 
                  size="sm" 
                  reviewCount={product.reviewCount ?? 0}
                  showLabel={true}
                />
              </div>

              {/* Quantity Label */}
              {product.quantityLabel && (
                <p className="mt-2 text-xs text-gray-500">
                  {product.quantityLabel}
                </p>
              )}

              {/* Price */}
              <div className="mt-3">
                <p className="text-lg font-bold text-gray-900">
                  <Price amount={product.price} />
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickView(product);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick View</span>
                  <span className="sm:hidden">View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ProductQuickView
          open={open}
          setOpen={setOpen}
          product={selectedProduct}
          setCart={setCart}
        />
      )}
    </div>
  );
}
