import { Link } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";

/**
 * Breadcrumb navigation component
 * @param {Array} items - Array of breadcrumb items [{name, href}]
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home link */}
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.name} className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 text-gray-300"
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className="ml-2 text-sm font-medium text-gray-500"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
