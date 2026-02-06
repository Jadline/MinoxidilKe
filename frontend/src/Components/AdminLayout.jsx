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
} from "@heroicons/react/24/outline";

const adminNav = [
  { name: "Dashboard", to: "/admin", icon: Squares2X2Icon },
  { name: "Products", to: "/admin/products", icon: ListBulletIcon },
  { name: "Packages", to: "/admin/packages", icon: SquaresPlusIcon },
  { name: "Orders", to: "/admin/orders", icon: ClipboardDocumentListIcon },
  { name: "Contacts", to: "/admin/contacts", icon: ChatBubbleLeftRightIcon },
  { name: "Subscribers", to: "/admin/subscribers", icon: EnvelopeIcon },
  { name: "Shipping", to: "/admin/shipping-methods", icon: TruckIcon },
  { name: "Pickup", to: "/admin/pickup-locations", icon: MapPinIcon },
  { name: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#191970]">
      <header className="bg-[#12125c] border-b border-white/10 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-white font-semibold hover:text-[#8bb4e8] transition-colors"
              >
                <CubeIcon className="h-6 w-6 text-[#8bb4e8]" />
                Admin
              </Link>
              <nav className="hidden sm:flex gap-1">
                {adminNav.map((item) => {
                  const isActive =
                    item.to === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to site
            </Link>
          </div>
        </div>
      </header>
      <main className="w-full max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
