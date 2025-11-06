import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ArchiveBoxIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useProducts } from "../Contexts/ProductContext";
import { useNavigate } from "react-router-dom";

export default function UserDropdown() {
  const { currentUser, setCurrentUser, setCart } = useProducts();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem("cart");
    navigate("/login");
  };
  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-black inset-ring-1 inset-ring-white/5 hover:bg-white/20">
        {currentUser?.name || "Account"}
        <ChevronDownIcon
          aria-hidden="true"
          className="-mr-1 size-5 text-gray-500"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {currentUser && (
          <div className="py-1 bg-white">
            <MenuItem>
              <button
                onClick={handleLogout}
                className="group flex items-center px-4 py-2 text-sm text-gray-700 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
              >
                <ArrowRightOnRectangleIcon
                  aria-hidden="true"
                  className="mr-3 size-5 text-gray-500 group-data-focus:text-white"
                />
                Logout
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => navigate("/order-history")}
                className="group flex items-center px-4 py-2 text-sm text-gray-700 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
              >
                <ArchiveBoxIcon
                  aria-hidden="true"
                  className="mr-3 size-5 text-gray-500 group-data-focus:text-white"
                />
                Orders
              </button>
            </MenuItem>
          </div>
        )}
        {!currentUser && (
          <div className="py-1 bg-white">
            <MenuItem>
              <button
                onClick={() => navigate("/account")}
                className="group flex items-center px-4 py-2 text-sm text-gray-700 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
              >
                <PencilSquareIcon
                  aria-hidden="true"
                  className="mr-3 size-5 text-gray-500 group-data-focus:text-white"
                />
                Create an Account
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => navigate("/login")}
                className="group flex items-center px-4 py-2 text-sm text-gray-700 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
              >
                <ArrowRightCircleIcon
                  aria-hidden="true"
                  className="mr-3 size-5 text-gray-500 group-data-focus:text-white"
                />
                Sign In
              </button>
            </MenuItem>
          </div>
        )}
      </MenuItems>
    </Menu>
  );
}
