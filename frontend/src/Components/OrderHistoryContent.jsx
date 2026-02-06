import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  HashtagIcon,
  CreditCardIcon,
  MapPinIcon,
  InboxIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

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

// Status configuration with colors and icons
const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
    icon: ClockIcon,
    step: 1,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    icon: SparklesIcon,
    step: 2,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    icon: TruckIcon,
    step: 3,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    icon: CheckCircleIcon,
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
    icon: XCircleIcon,
    step: 0,
  },
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    icon: CheckCircleIcon,
    step: 1,
  },
  unpaid: {
    label: "Unpaid",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
    icon: ClockIcon,
    step: 0,
  },
};

function getStatusConfig(status) {
  const normalizedStatus = String(status).toLowerCase().trim();
  return statusConfig[normalizedStatus] || statusConfig.pending;
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function OrderProgressTracker({ status }) {
  const config = getStatusConfig(status);
  const currentStep = config.step;
  
  if (status?.toLowerCase() === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircleIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  const steps = [
    { name: "Order Placed", icon: ShoppingBagIcon },
    { name: "Processing", icon: SparklesIcon },
    { name: "Shipped", icon: TruckIcon },
    { name: "Delivered", icon: CheckCircleIcon },
  ];

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index + 1;
          const StepIcon = step.icon;
          
          return (
            <div key={step.name} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200"
                    : isCurrent
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircleSolid className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0 mx-5">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${Math.max(0, (currentStep - 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrderHistoryContent() {
  const { orders, isLoading } = useOrders();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-500 mt-1">Track and manage your orders</p>
              </div>
            </div>
          </div>
          
          {/* Empty State */}
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <InboxIcon className="h-12 w-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              When you place your first order, it will appear here so you can track its progress.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-sm">
                <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-500 mt-1">Track and manage your orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-2xl font-bold text-indigo-600">{orders.length}</span>
                <span className="text-gray-500 text-sm ml-1.5">orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order.orderNumber || index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <CalendarDaysIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date Placed</p>
                        <p className="font-semibold text-gray-900">{formatShortDate(order.date)}</p>
                      </div>
                    </div>
                    
                    {/* Order Number */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <HashtagIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Order Number</p>
                        <p className="font-semibold text-gray-900 font-mono">{order.orderNumber}</p>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CreditCardIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                        <p className="font-bold text-gray-900">{order.OrderTotal}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <StatusBadge status={order.paymentStatus || order.status || "pending"} />
                </div>
              </div>

              {/* Order Progress (for non-cancelled orders) */}
              {order.status && order.status.toLowerCase() !== "cancelled" && (
                <div className="px-6 py-6 bg-gray-50/50 border-b border-gray-100">
                  <OrderProgressTracker status={order.status || "pending"} />
                </div>
              )}

              {/* Order Items */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
                  Items in this order
                </h3>
                <div className="space-y-4">
                  {order.orderItems.map((product, productIndex) => (
                    <div
                      key={product.id || productIndex}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={productImageSrc(product.imageSrc)}
                          alt={product.imageAlt || product.name}
                          className="w-20 h-20 rounded-xl object-cover shadow-sm border border-gray-200"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">Qty:</span> {product.quantity}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="font-semibold text-gray-900">{product.price}</span>
                        </div>
                      </div>
                      
                      {/* View Product Link */}
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View product"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TruckIcon className="h-4 w-4" />
                  <span>Shipping: <span className="font-medium text-gray-900">{order.shippingCost || "Free"}</span></span>
                </div>
                
                {order.shippingAddress && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate max-w-xs">{order.shippingAddress}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
            <SparklesIcon className="h-8 w-8 text-indigo-500 mb-3" />
            <p className="text-gray-600 mb-4">Looking for more great products?</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
