import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  ArrowLeftIcon,
  CubeIcon,
  ListBulletIcon,
  SquaresPlusIcon,
  TruckIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  Bars3Icon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useDarkModeStore } from "../stores/darkModeStore";

const navSections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", to: "/admin", icon: Squares2X2Icon, exact: true },
    ],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", to: "/admin/products", icon: ListBulletIcon },
      { name: "Packages", to: "/admin/packages", icon: SquaresPlusIcon },
    ],
  },
  {
    title: "Sales",
    items: [
      { name: "Orders", to: "/admin/orders", icon: ClipboardDocumentListIcon },
      { name: "Customers", to: "/admin/customers", icon: UsersIcon },
    ],
  },
  {
    title: "Delivery",
    items: [
      { name: "Shipping Methods", to: "/admin/shipping-methods", icon: TruckIcon },
      { name: "Pickup Locations", to: "/admin/pickup-locations", icon: MapPinIcon },
      { name: "Shipping Info", to: "/admin/shipping-info", icon: InformationCircleIcon },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Contacts", to: "/admin/contacts", icon: ChatBubbleLeftRightIcon },
      { name: "Subscribers", to: "/admin/subscribers", icon: EnvelopeIcon },
    ],
  },
  {
    title: "Configuration",
    items: [
      { name: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkModeStore();

  const isNavActive = (item) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'} h-16 px-4 border-b border-white/10`}>
        <Link
          to="/admin"
          className="flex items-center gap-3 text-white font-bold"
          onClick={() => mobile && setSidebarOpen(false)}
        >
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <CubeIcon className="h-6 w-6 text-white" />
          </div>
          {(!collapsed || mobile) && <span className="text-xl">Admin</span>}
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {(!collapsed || mobile) && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isNavActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => mobile && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/20"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    } ${collapsed && !mobile ? 'justify-center' : ''}`}
                    title={collapsed && !mobile ? item.name : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                    {(!collapsed || mobile) && (
                      <span className="font-medium truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Dark Mode Toggle & Back to Site */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all ${collapsed && !mobile ? 'justify-center' : ''}`}
          title={collapsed && !mobile ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <MoonIcon className="w-5 h-5 flex-shrink-0" />
          )}
          {(!collapsed || mobile) && (
            <span className="font-medium">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>
        <Link
          to="/"
          onClick={() => mobile && setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all ${collapsed && !mobile ? 'justify-center' : ''}`}
          title={collapsed && !mobile ? "Back to Site" : undefined}
        >
          <ArrowLeftIcon className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span className="font-medium">Back to Site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900" 
        : "bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30"
    }`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0f0f3d] via-[#191970] to-[#1a1a5c] transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col bg-gradient-to-b from-[#0f0f3d] via-[#191970] to-[#1a1a5c] shadow-2xl transition-all duration-300 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Mobile Header */}
        <header className={`lg:hidden sticky top-0 z-30 backdrop-blur-lg border-b transition-colors duration-300 ${
          isDarkMode 
            ? "bg-gray-900/80 border-gray-700" 
            : "bg-white/80 border-gray-200"
        }`}>
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode 
                  ? "text-gray-400 hover:bg-gray-800" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/admin" className={`flex items-center gap-2 font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <CubeIcon className="h-5 w-5 text-white" />
              </div>
              Admin
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode 
                    ? "text-amber-400 hover:bg-gray-800" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <Link
                to="/"
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode 
                    ? "text-gray-400 hover:bg-gray-800" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ isDarkMode }} />
        </main>
      </div>
    </div>
  );
}
