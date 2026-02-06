import { useState } from "react";
import { BellIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function StockNotification({ productId, productName }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Store in localStorage for now (can be connected to backend later)
    try {
      const notifications = JSON.parse(
        localStorage.getItem("stockNotifications") || "[]"
      );
      
      // Check if already subscribed
      const existing = notifications.find(
        (n) => n.productId === productId && n.email === email
      );
      
      if (existing) {
        toast("You're already subscribed for this product", { icon: "📧" });
        setIsSubscribed(true);
        return;
      }

      notifications.push({
        productId,
        productName,
        email,
        subscribedAt: Date.now(),
      });
      
      localStorage.setItem("stockNotifications", JSON.stringify(notifications));
      setIsSubscribed(true);
      toast.success("We'll notify you when it's back in stock!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700">
        <CheckCircleIcon className="h-5 w-5" />
        <span className="text-sm font-medium">
          We'll email you when it's back!
        </span>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-amber-700 hover:bg-amber-100 transition-colors w-full"
      >
        <BellIcon className="h-5 w-5" />
        <span className="text-sm font-medium">
          Notify me when back in stock
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <BellIcon className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">
            Get notified when this item is back
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Enter your email and we'll let you know
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isSubmitting ? "..." : "Notify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
