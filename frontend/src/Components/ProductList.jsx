import { useState } from "react";
import ProductQuickView from "./ProductQuickView";
import StarRating from "./StarRating";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useShopProducts } from "../hooks/useShopProducts";

function ProductsSkeleton() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
        <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
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
      <div className="bg-white py-16 text-center">
        <p className="text-sm text-red-600">
          There was an error fetching products. Please try again.
        </p>
      </div>
    );

  if (!products || products.length === 0)
    return (
      <div className="bg-white py-24 text-center">
        <p className="text-lg font-medium text-gray-900">
          No products found.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Try clearing some filters or adjusting your search.
        </p>
      </div>
    );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id ?? product._id}
              onClick={() => {
                if (product) {
                  const path = product.id != null
                    ? `/product-details/${product.id}`
                    : "/product-details";
                  navigate(path, { state: { product } });
                }
              }}
              className="group relative border-r border-b border-gray-200 p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow duration-150"
            >
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square rounded-lg bg-gray-200 object-contain group-hover:opacity-75 transition duration-150"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickView(product);
                }}
                className="mt-3 w-3/4 rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Quick View
              </button>

              <div className="pt-10 pb-4 text-left">
                <h3 className="text-sm font-medium text-gray-900">
                  <p className="relative line-clamp-2">{product.name}</p>
                </h3>

                <div className="mt-3 flex items-center gap-3">
                  <StarRating rating={product.rating ?? 0} size="sm" />
                  <p className="text-sm text-gray-500 font-bold">
                    {product.rating != null && product.rating !== ""
                      ? Number(product.rating).toFixed(1)
                      : "—"}
                  </p>
                </div>

                <p className="mt-4 text-base font-medium text-gray-900">
                  {product.quantityLabel}
                </p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  Ksh {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
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
