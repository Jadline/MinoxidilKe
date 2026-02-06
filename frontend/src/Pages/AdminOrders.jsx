import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrder } from "../api";
import toast from "react-hot-toast";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useDarkModeStore } from "../stores/darkModeStore";

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function formatCurrency(n) {
  return n != null ? `KSh ${Number(n).toLocaleString()}` : "—";
}

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "unpaid", label: "Unpaid" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { isDarkMode } = useDarkModeStore();

  const {
    data: ordersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await getAdminOrders();
      return res.data?.data?.orders ?? [];
    },
  });
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const totalPages = Math.max(1, Math.ceil(orders.length / limit));
  const start = (page - 1) * limit;
  const displayed = orders.slice(start, start + limit);

  const { mutate: updateOrderStatus, isPending: isUpdatingOrder } = useMutation(
    {
      mutationFn: ({ orderId, paymentStatus, orderStatus }) =>
        updateOrder(orderId, { paymentStatus, orderStatus }),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        if (variables.orderStatus != null)
          toast.success("Order status updated.");
        if (variables.paymentStatus != null)
          toast.success("Payment status updated.");
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to update."
        );
      },
    }
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Manage Orders</h1>
        <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>View and manage all customer orders.</p>
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Loading orders…</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load orders."}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <ClipboardDocumentListIcon className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>No orders yet</h3>
            <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Order #</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Date</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Customer</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Phone</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Delivery</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Order Status</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Payment</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                  {displayed.map((order) => (
                    <tr key={order._id} className={`transition-colors ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                      <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {order.orderNumber || "—"}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {formatDate(order.date)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {[order.firstName, order.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                          order.email ||
                          "—"}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {order.phoneNumber || order.shippingPhone || "—"}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {formatCurrency(order.OrderTotal ?? order.Total)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {order.deliveryType === "pickup"
                          ? "Pickup"
                          : "Shipping"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.orderStatus || "pending"}
                          onChange={(e) =>
                            updateOrderStatus({
                              orderId: order._id,
                              orderStatus: e.target.value,
                            })
                          }
                          disabled={isUpdatingOrder}
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-[#082567]/30 disabled:opacity-50 ${
                            order.orderStatus === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.orderStatus === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.orderStatus === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.paymentStatus || "pending"}
                          onChange={(e) =>
                            updateOrderStatus({
                              orderId: order._id,
                              paymentStatus: e.target.value,
                            })
                          }
                          disabled={isUpdatingOrder}
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-[#082567]/30 disabled:opacity-50 ${
                            order.paymentStatus === "succeeded"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.paymentStatus === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : order.paymentStatus === "failed" ||
                                order.paymentStatus === "unpaid"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {PAYMENT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className={`flex items-center justify-between gap-4 px-4 py-3 border-t ${isDarkMode ? "bg-gray-700/30 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span> (
                  {orders.length} orders)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50 transition-colors ${
                      isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600" 
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50 transition-colors ${
                      isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600" 
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
