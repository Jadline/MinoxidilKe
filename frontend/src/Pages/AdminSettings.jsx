import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicSettings, updatePromoBanner } from "../api";
import toast from "react-hot-toast";
import { useCurrencyStore } from "../stores/currencyStore";
import { useDarkModeStore } from "../stores/darkModeStore";
import { Cog6ToothIcon, TruckIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const { isDarkMode } = useDarkModeStore();

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["publicSettings"],
    queryFn: async () => {
      const res = await getPublicSettings();
      return res.data.data;
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    enabled: true,
    text: "Get free delivery on orders over",
    freeDeliveryThreshold: 6000,
    showTruckEmoji: true,
  });

  // Update form when data loads
  useEffect(() => {
    if (settingsData?.promoBanner) {
      setFormData(settingsData.promoBanner);
    }
  }, [settingsData]);

  // Mutation to update promo banner
  const updateMutation = useMutation({
    mutationFn: updatePromoBanner,
    onSuccess: () => {
      toast.success("Promo banner settings updated!");
      queryClient.invalidateQueries(["publicSettings"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
            <Cog6ToothIcon className={`h-8 w-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Site Settings</h1>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Manage your website settings and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Promo Banner Settings */}
      <div className={`shadow-sm rounded-2xl overflow-hidden border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gradient-to-r from-gray-50 to-white"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-indigo-900/50" : "bg-indigo-100"}`}>
              <SparklesIcon className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Promo Banner</h2>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Configure the promotional banner displayed at the top of your website
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Preview
            </label>
            <div className="bg-gradient-to-r from-[#000080] via-[#0066cc] to-[#39a9db] p-4 rounded-xl shadow-sm">
              {formData.enabled ? (
                <p className="text-center text-sm font-medium text-white flex items-center justify-center gap-2">
                  {formData.showTruckEmoji && <span>🚚</span>}
                  <span>
                    {formData.text} {formatPrice(formData.freeDeliveryThreshold)}
                  </span>
                  {formData.showTruckEmoji && <span>🚚</span>}
                </p>
              ) : (
                <p className="text-center text-sm text-white/50 italic">
                  Banner is disabled
                </p>
              )}
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="enabled" className={`ml-3 block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
              Enable promo banner
            </label>
          </div>

          {/* Banner Text */}
          <div>
            <label
              htmlFor="text"
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Banner Text
            </label>
            <input
              type="text"
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              className={`block w-full rounded-xl border px-4 py-3 shadow-sm transition-all sm:text-sm ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              }`}
              placeholder="Get free delivery on orders over"
            />
            <p className={`mt-2 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              The price will be automatically appended to this text
            </p>
          </div>

          {/* Free Delivery Threshold */}
          <div>
            <label
              htmlFor="freeDeliveryThreshold"
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Free Delivery Threshold (KES)
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className={`sm:text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Ksh</span>
              </div>
              <input
                type="number"
                id="freeDeliveryThreshold"
                name="freeDeliveryThreshold"
                value={formData.freeDeliveryThreshold}
                onChange={handleChange}
                min="0"
                step="100"
                className={`block w-full pl-12 rounded-xl border px-4 py-3 shadow-sm transition-all sm:text-sm ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>
            <p className={`mt-2 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              Orders above this amount qualify for free delivery. This will be converted to other currencies automatically.
            </p>
          </div>

          {/* Show Truck Emoji */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTruckEmoji"
              name="showTruckEmoji"
              checked={formData.showTruckEmoji}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="showTruckEmoji"
              className={`ml-3 block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
            >
              Show truck emoji 🚚
            </label>
          </div>

          {/* Submit Button */}
          <div className={`pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold transition-all shadow-lg ${
                updateMutation.isPending
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
              }`}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
