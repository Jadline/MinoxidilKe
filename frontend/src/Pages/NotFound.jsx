import { Link } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-indigo-100 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        {/* Message */}
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Page not found
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Here are some helpful links instead:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Shop Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/order-history"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
