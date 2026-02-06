import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CubeIcon,
  ArrowRightIcon,
  ListBulletIcon,
  SquaresPlusIcon,
  TruckIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { getProducts, getPackages, getContacts, getSubscriberCount } from "../api";
import { useDarkModeStore } from "../stores/darkModeStore";

function StatCard({ icon: Icon, label, value, color, loading, isDarkMode }) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${
      isDarkMode 
        ? "bg-gray-800 border-gray-700" 
        : "bg-white border-gray-100"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3.5 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {loading ? (
              <span className={`inline-block w-12 h-7 rounded animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ to, icon: Icon, title, description, badge, isDarkMode }) {
  return (
    <Link
      to={to}
      className={`group relative rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:-translate-y-1 ${
        isDarkMode 
          ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:border-indigo-500/50" 
          : "bg-white border-gray-100 hover:shadow-lg hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 rounded-xl transition-colors ${
          isDarkMode 
            ? "bg-indigo-600/20 group-hover:bg-indigo-600/30" 
            : "bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100"
        }`}>
          <Icon className={`w-6 h-6 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold group-hover:text-indigo-500 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {title}
            </h3>
            {badge && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                isDarkMode ? "bg-indigo-600/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"
              }`}>
                {badge}
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
        </div>
        <ArrowRightIcon className={`w-5 h-5 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 ${
          isDarkMode ? "text-gray-600" : "text-gray-300"
        }`} />
      </div>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, isDarkMode }) {
  return (
    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <Icon className={`w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
      {title}
    </h2>
  );
}

export default function AdminDashboard() {
  const { isDarkMode } = useDarkModeStore();
  
  // Fetch stats
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: () => getProducts({ page: 1, limit: 1 }).then(r => r.data?.total ?? 0),
  });

  const { data: packagesData, isLoading: loadingPackages } = useQuery({
    queryKey: ["admin-packages-count"],
    queryFn: () => getPackages().then(r => r.data?.data?.packages?.length ?? 0),
  });

  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ["admin-contacts-count"],
    queryFn: () => getContacts().then(r => r.data?.data?.contacts?.length ?? 0),
  });

  const { data: subscribersData, isLoading: loadingSubscribers } = useQuery({
    queryKey: ["admin-subscribers-count"],
    queryFn: () => getSubscriberCount().then(r => r.data?.data?.total ?? 0),
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Welcome back!</h1>
        <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Products"
          value={productsData ?? 0}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          loading={loadingProducts}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={SquaresPlusIcon}
          label="Total Packages"
          value={packagesData ?? 0}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          loading={loadingPackages}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={EnvelopeIcon}
          label="Messages"
          value={contactsData ?? 0}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          loading={loadingContacts}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={UsersIcon}
          label="Subscribers"
          value={subscribersData ?? 0}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          loading={loadingSubscribers}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Products & Inventory Section */}
      <div className="mb-10">
        <SectionHeader icon={CubeIcon} title="Products & Inventory" isDarkMode={isDarkMode} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard to="/admin/products" icon={ListBulletIcon} title="Manage Products" description="Add, edit, or remove products from your catalog" isDarkMode={isDarkMode} />
          <DashboardCard to="/admin/packages" icon={SquaresPlusIcon} title="Manage Packages" description="Create product bundles and special offers" isDarkMode={isDarkMode} />
          <DashboardCard to="/products" icon={EyeIcon} title="View Store" description="See your store as customers see it" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Orders & Delivery Section */}
      <div className="mb-10">
        <SectionHeader icon={TruckIcon} title="Orders & Delivery" isDarkMode={isDarkMode} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard to="/admin/orders" icon={ClipboardDocumentListIcon} title="Manage Orders" description="View and process customer orders" isDarkMode={isDarkMode} />
          <DashboardCard to="/admin/shipping-methods" icon={TruckIcon} title="Shipping Methods" description="Configure delivery options and pricing" isDarkMode={isDarkMode} />
          <DashboardCard to="/admin/pickup-locations" icon={MapPinIcon} title="Pickup Locations" description="Manage store pickup points" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Communications Section */}
      <div className="mb-10">
        <SectionHeader icon={EnvelopeIcon} title="Communications" isDarkMode={isDarkMode} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard to="/admin/contacts" icon={EnvelopeIcon} title="Contact Messages" description="View and respond to customer inquiries" badge={contactsData > 0 ? `${contactsData}` : null} isDarkMode={isDarkMode} />
          <DashboardCard to="/admin/subscribers" icon={UsersIcon} title="Newsletter Subscribers" description="Manage email subscribers and send newsletters" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Settings Section */}
      <div className="mb-10">
        <SectionHeader icon={Cog6ToothIcon} title="Settings" isDarkMode={isDarkMode} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard to="/admin/settings" icon={Cog6ToothIcon} title="Site Settings" description="Configure promo banner and site-wide settings" isDarkMode={isDarkMode} />
          <DashboardCard to="/admin/shipping-info" icon={InformationCircleIcon} title="Shipping Information" description="Edit shipping policy and delivery details" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Quick Tips */}
      <div className={`rounded-2xl p-6 border ${
        isDarkMode 
          ? "bg-indigo-900/30 border-indigo-800/50" 
          : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100"
      }`}>
        <h3 className={`font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Quick Tips</h3>
        <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            Keep your product images high quality for better conversions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            Respond to customer inquiries within 24 hours
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            Update shipping methods when rates change
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            Send regular newsletters to keep subscribers engaged
          </li>
        </ul>
      </div>
    </div>
  );
}
