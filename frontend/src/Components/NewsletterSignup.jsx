import { useState } from "react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/subscribers/subscribe`, { email });
      setIsSubscribed(true);
      toast.success(response.data?.message || "Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircleIcon className="h-5 w-5" />
        <span className="text-sm">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <p className="text-sm text-gray-300 mb-3">
        Subscribe to get special offers, free giveaways, and new arrivals.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg bg-white/10 border border-white/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            isSubmitting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-white text-indigo-600 hover:bg-gray-100"
          }`}
        >
          {isSubmitting ? "..." : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
