import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  PlusCircleIcon,
  ArrowLeftIcon,
  CubeIcon,
  ListBulletIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";

const adminNav = [
  { name: "Dashboard", to: "/admin", icon: Squares2X2Icon },
  { name: "Manage Products", to: "/admin/products", icon: ListBulletIcon },
  { name: "Manage Packages", to: "/admin/packages", icon: SquaresPlusIcon },
  { name: "Add Product", to: "/admin/add-product", icon: PlusCircleIcon },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-900 font-semibold"
              >
                <CubeIcon className="h-6 w-6 text-indigo-600" />
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
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
