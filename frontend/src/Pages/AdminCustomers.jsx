import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders } from "../api";
import {
  UsersIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useDarkModeStore } from "../stores/darkModeStore";

export default function AdminCustomers() {
  const { isDarkMode } = useDarkModeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState("totalSpent"); // orders, totalSpent, lastOrder
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAdminOrders(),
  });

  const orders = data?.data?.data?.orders ?? [];

  // Aggregate customers from orders
  const customers = useMemo(() => {
    const customerMap = new Map();

    orders.forEach((order) => {
      const email = order.email?.toLowerCase();
      if (!email) return;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          firstName: order.firstName || "",
          lastName: order.lastName || "",
          phone: order.phoneNumber || order.shippingPhone || "",
          orders: [],
          addresses: [],
          totalSpent: 0,
          lastOrderDate: null,
        });
      }

      const customer = customerMap.get(email);
      
      // Update name if we have better data
      if (!customer.firstName && order.firstName) {
        customer.firstName = order.firstName;
      }
      if (!customer.lastName && order.lastName) {
        customer.lastName = order.lastName;
      }
      if (!customer.phone && (order.phoneNumber || order.shippingPhone)) {
        customer.phone = order.phoneNumber || order.shippingPhone;
      }

      // Add order
      customer.orders.push({
        orderNumber: order.orderNumber,
        date: order.date,
        total: order.OrderTotal || order.Total || 0,
        status: order.orderStatus || "pending",
        paymentStatus: order.paymentStatus || "pending",
        itemCount: order.orderItems?.length || 0,
      });

      // Calculate total spent
      customer.totalSpent += order.OrderTotal || order.Total || 0;

      // Track last order date
      const orderDate = new Date(order.date);
      if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
      }

      // Collect unique addresses
      if (order.streetAddress) {
        const addressKey = `${order.streetAddress}-${order.city}-${order.country}`;
        const existingAddress = customer.addresses.find(
          (a) => `${a.streetAddress}-${a.city}-${a.country}` === addressKey
        );
        if (!existingAddress) {
          customer.addresses.push({
            streetAddress: order.streetAddress,
            apartment: order.apartment,
            city: order.city,
            country: order.country,
            postalCode: order.postalCode,
            phone: order.shippingPhone,
          });
        }
      }
    });

    return Array.from(customerMap.values());
  }, [orders]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.email.toLowerCase().includes(query) ||
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "orders":
          comparison = a.orders.length - b.orders.length;
          break;
        case "totalSpent":
          comparison = a.totalSpent - b.totalSpent;
          break;
        case "lastOrder":
          comparison = (a.lastOrderDate || 0) - (b.lastOrderDate || 0);
          break;
        case "name":
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [customers, searchQuery, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalCustomers: customers.length,
      totalOrders: orders.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgOrderValue: orders.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / orders.length
        : 0,
    };
  }, [customers, orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="text-red-600 mb-2">Failed to load customer data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <UsersIcon className={`h-8 w-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Customers
              </h1>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                View and manage customer information and order history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-2xl p-5 border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
              <UsersIcon className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalCustomers}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Customers</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-purple-900/30" : "bg-purple-100"}`}>
              <ShoppingBagIcon className={`h-5 w-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalOrders}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Orders</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-green-900/30" : "bg-green-100"}`}>
              <CurrencyDollarIcon className={`h-5 w-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{formatCurrency(stats.totalRevenue)}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Revenue</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-amber-900/30" : "bg-amber-100"}`}>
              <BuildingStorefrontIcon className={`h-5 w-5 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{formatCurrency(stats.avgOrderValue)}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Order Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`rounded-2xl border shadow-sm mb-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              <option value="totalSpent">Total Spent</option>
              <option value="orders">Order Count</option>
              <option value="lastOrder">Last Order</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`px-3 py-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {sortOrder === "asc" ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <UsersIcon className={`h-10 w-10 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {searchQuery ? "No customers found" : "No customers yet"}
            </h3>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              {searchQuery ? "Try a different search term" : "Customers will appear here when they place orders"}
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
            {filteredCustomers.map((customer) => (
              <div key={customer.email}>
                {/* Customer Row */}
                <div
                  onClick={() => setExpandedCustomer(expandedCustomer === customer.email ? null : customer.email)}
                  className={`p-5 cursor-pointer transition-colors ${
                    isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                  } ${expandedCustomer === customer.email ? (isDarkMode ? "bg-gray-700/30" : "bg-indigo-50/50") : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {customer.firstName?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                        {customer.lastName?.charAt(0) || ""}
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {customer.firstName || customer.lastName
                            ? `${customer.firstName} ${customer.lastName}`.trim()
                            : customer.email}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                          <span className={`flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <EnvelopeIcon className="h-4 w-4" />
                            {customer.email}
                          </span>
                          {customer.phone && (
                            <span className={`flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              <PhoneIcon className="h-4 w-4" />
                              {customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{customer.orders.length}</p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Orders</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold text-green-600`}>{formatCurrency(customer.totalSpent)}</p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {formatDate(customer.lastOrderDate)}
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Last Order</p>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div className={`flex-shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                      {expandedCustomer === customer.email ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="sm:hidden flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className="font-semibold text-indigo-600">{customer.orders.length}</span> orders
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</span> spent
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCustomer === customer.email && (
                  <div className={`px-5 pb-5 ${isDarkMode ? "bg-gray-700/20" : "bg-gray-50/50"}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Shipping Addresses */}
                      <div>
                        <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          <MapPinIcon className="h-4 w-4 text-indigo-500" />
                          Shipping Addresses ({customer.addresses.length})
                        </h4>
                        {customer.addresses.length === 0 ? (
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No addresses on file</p>
                        ) : (
                          <div className="space-y-3">
                            {customer.addresses.map((address, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                              >
                                <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                  {address.streetAddress}
                                  {address.apartment && `, ${address.apartment}`}
                                </p>
                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {address.city}, {address.country}
                                  {address.postalCode && ` ${address.postalCode}`}
                                </p>
                                {address.phone && (
                                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    <PhoneIcon className="h-3.5 w-3.5 inline mr-1" />
                                    {address.phone}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Order History */}
                      <div>
                        <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          <ShoppingBagIcon className="h-4 w-4 text-purple-500" />
                          Order History ({customer.orders.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {customer.orders
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((order, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-mono font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    #{order.orderNumber}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                                    <CalendarDaysIcon className="h-3.5 w-3.5 inline mr-1" />
                                    {formatDate(order.date)}
                                  </span>
                                  <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {formatCurrency(order.total)}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                  {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`mt-4 pt-4 border-t flex flex-wrap gap-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <a
                        href={`mailto:${customer.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition-colors text-sm"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                        Send Email
                      </a>
                      {customer.phone && (
                        <a
                          href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors text-sm"
                        >
                          <PhoneIcon className="h-4 w-4" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredCustomers.length > 0 && (
        <div className={`mt-4 text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      )}
    </div>
  );
}
