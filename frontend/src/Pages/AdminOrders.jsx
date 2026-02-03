import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrder } from "../api";
import toast from "react-hot-toast";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
        <p className="text-white/80 mt-1">View all customer orders.</p>
      </div>

      <div className="rounded-xl border border-[#191970]/30 bg-white shadow-xl overflow-hidden transition-all duration-200 hover:shadow-2xl hover:border-[#191970]/50">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading orders…</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load orders."}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-2 text-white">No orders yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#191970]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Order status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/15 divide-y divide-white/20">
                  {displayed.map((order) => (
                    <tr key={order._id} className="hover:bg-[#191970]/5 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {[order.firstName, order.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                          order.email ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.phoneNumber || order.shippingPhone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(order.OrderTotal ?? order.Total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
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
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span> (
                  {orders.length} orders)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
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
