import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useWishlistStore } from "../stores/wishlistStore";
import toast from "react-hot-toast";

export default function WishlistButton({ product, className = "", size = "md" }) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const inWishlist = isInWishlist(product?._id || product?.id);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    const added = toggleItem(product);
    if (added) {
      toast.success("Added to wishlist", { icon: "❤️" });
    } else {
      toast("Removed from wishlist", { icon: "💔" });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full p-2 transition-all duration-200 ${
        inWishlist
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
      } ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {inWishlist ? (
        <HeartIconSolid className={`${sizeClasses[size]} animate-pulse`} />
      ) : (
        <HeartIcon className={sizeClasses[size]} />
      )}
    </button>
  );
}
