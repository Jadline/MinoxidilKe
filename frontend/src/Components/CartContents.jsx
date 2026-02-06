import { 
  ChevronDownIcon, 
  MinusIcon, 
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon, ClockIcon } from "@heroicons/react/20/solid";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import Price from "./Price";
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

export default function CartContents() {
  const { cart, setCart, subtotal } = useCartStore();
  const Total = subtotal();
  const navigate = useNavigate();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  function handleDelete(id) {
    setCart((prevcart) => prevcart.filter((cartitem) => cartitem.id !== id));
    toast.success("Item removed from cart");
  }

  function updateQuantity(id, newQty) {
    if (newQty < 1) return;
    setCart((prevcart) =>
      prevcart.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-[70vh]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingBagIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. 
              Explore our collection and find something you'll love!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Shopping Cart
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="space-y-4">
              {cart.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                          <img
                            alt={product.imageAlt || product.name}
                            src={productImageSrc(product.imageSrc)}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                              <Link to={`/product-details/${product.id}`}>
                                {product.name}
                              </Link>
                            </h3>
                            {product.quantityLabel && (
                              <p className="mt-1 text-sm text-gray-500">
                                {product.quantityLabel}
                              </p>
                            )}
                            
                            {/* Stock Status */}
                            <div className="mt-2">
                              {product.inStock ? (
                                <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                                  <CheckIcon className="w-4 h-4" />
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                                  <ClockIcon className="w-4 h-4" />
                                  Ships in {product.leadTime}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              <Price amount={product.price * product.quantity} />
                            </p>
                            {product.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                <Price amount={product.price} /> each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="mt-4 flex items-center justify-between">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Qty:</span>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MinusIcon className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-4 py-2 text-center font-medium min-w-[3rem] bg-gray-50">
                                {product.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                disabled={product.quantity >= 10}
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <PlusIcon className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Summary Items */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-gray-900"><Price amount={Total} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900"><Price amount={Total} /></span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/checkout");
                  }}
                  className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {Total < 6000 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <TruckIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          You're <Price amount={6000 - Total} /> away from free delivery!
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Add more items to qualify
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((Total / 6000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {Total >= 6000 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-800">
                        You qualify for FREE delivery!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-6 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
