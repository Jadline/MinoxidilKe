import { Link } from "react-router-dom";
import {
  CubeIcon,
  ArrowRightIcon,
  ListBulletIcon,
  SquaresPlusIcon,
  TruckIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-white/80 mb-8">
        Manage your store products and settings.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/products"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#082567]/10 group-hover:bg-[#082567]/20">
            <ListBulletIcon className="h-6 w-6 text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">Manage Products</h2>
            <p className="mt-1 text-sm text-gray-600">
              View, edit, or delete products in your shop.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/admin/packages"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#082567]/10 group-hover:bg-[#082567]/20">
            <SquaresPlusIcon className="h-6 w-6 text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">Manage Packages</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create and edit product bundles customers can buy together.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/admin/shipping-methods"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#082567]/10 group-hover:bg-[#082567]/20">
            <TruckIcon className="h-6 w-6 text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">
              Manage Shipping Methods
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure delivery options by country and region.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/admin/pickup-locations"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#082567]/10 group-hover:bg-[#082567]/20">
            <MapPinIcon className="h-6 w-6 text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">
              Manage Pickup Locations
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure pickup points for customer orders.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#082567]/10 group-hover:bg-[#082567]/20">
            <ClipboardDocumentListIcon className="h-6 w-6 text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">Manage Orders</h2>
            <p className="mt-1 text-sm text-gray-600">
              View all customer orders.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/products"
          className="relative rounded-xl border border-white/20 bg-white/95 p-6 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#082567]/30 transition-all flex items-start gap-4 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#082567]/10">
            <CubeIcon className="h-6 w-6 text-gray-600 group-hover:text-[#082567]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">View Shop</h2>
            <p className="mt-1 text-sm text-gray-600">
              See how products appear to customers.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-medium text-[#082567]">
              Go <ArrowRightIcon className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
