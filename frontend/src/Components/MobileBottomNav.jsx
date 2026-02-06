import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useCartStore } from "../stores/cartStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { useUserStore } from "../stores/userStore";
import { useState } from "react";
import SearchBar from "./SearchBar";

const navItems = [
  { name: "Home", path: "/", icon: HomeIcon, activeIcon: HomeIconSolid },
  { name: "Search", path: "#search", icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid },
  { name: "Wishlist", path: "/wishlist", icon: HeartIcon, activeIcon: HeartIconSolid },
  { name: "Cart", path: "/cart", icon: ShoppingBagIcon, activeIcon: ShoppingBagIconSolid },
  { name: "Account", path: "/account", icon: UserIcon, activeIcon: UserIconSolid },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { currentUser } = useUserStore();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item, e) => {
    if (item.path === "#search") {
      e.preventDefault();
      setSearchOpen(!searchOpen);
    }
  };

  return (
    <>
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search</h2>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
            </div>
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = item.path === "#search" ? searchOpen : isActive(item.path);
            const Icon = active ? item.activeIcon : item.icon;
            const path = item.path === "/account" && currentUser ? "/order-history" : item.path;

            const badge =
              item.name === "Cart" && cartCount > 0
                ? cartCount
                : item.name === "Wishlist" && wishlistCount > 0
                ? wishlistCount
                : null;

            if (item.path === "#search") {
              return (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    active ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={path}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                  active ? "text-indigo-600" : "text-gray-500"
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {badge !== null && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
