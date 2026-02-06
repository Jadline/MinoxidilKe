import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { getSettings, updateSettings } from "../api";
import toast from "react-hot-toast";
import { useDarkModeStore } from "../stores/darkModeStore";

export default function AdminShippingInfo() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkModeStore();
  
  const [formData, setFormData] = useState({
    freeShippingThreshold: 6000,
    estimatedDeliveryDays: "2-5",
    shippingPolicyText: "",
    returnPolicyText: "",
    processingTime: "1-2 business days",
    internationalShipping: false,
    internationalShippingNote: "",
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "shippingInfo"],
    queryFn: () => getSettings("shippingInfo").then((r) => r.data?.data?.value ?? {}),
  });

  // Update form when settings load
  useEffect(() => {
    if (settings && typeof settings === "object") {
      setFormData((prev) => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => updateSettings("shippingInfo", data),
    onSuccess: () => {
      toast.success("Shipping information saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings", "shippingInfo"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to save settings");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <TruckIcon className="w-6 h-6 text-white" />
          </div>
          Shipping Information
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Configure shipping details and policies displayed to your customers during checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Settings Card */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className={`p-6 border-b ${isDarkMode ? "border-gray-700 bg-indigo-900/20" : "border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50"}`}>
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <ClockIcon className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              Delivery Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure delivery timeframes and processing times</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Days
                </label>
                <input
                  type="text"
                  value={formData.estimatedDeliveryDays}
                  onChange={(e) => handleChange("estimatedDeliveryDays", e.target.value)}
                  placeholder="e.g. 2-5 business days"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Shown to customers at checkout (e.g., "2-5 business days")
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={formData.processingTime}
                  onChange={(e) => handleChange("processingTime", e.target.value)}
                  placeholder="e.g. 1-2 business days"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Time to prepare order before shipping
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Free Shipping Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              Free Shipping
            </h2>
            <p className="text-sm text-gray-500 mt-1">Set the minimum order amount for free shipping</p>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (KES)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
                <input
                  type="number"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => handleChange("freeShippingThreshold", parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gray-200 pl-14 pr-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Orders above this amount qualify for free shipping. Set to 0 to disable.
              </p>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>Preview:</strong> "Get free delivery on orders over KES {formData.freeShippingThreshold.toLocaleString()}"
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Policy Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-purple-600" />
              Shipping Policy
            </h2>
            <p className="text-sm text-gray-500 mt-1">Detailed shipping information for customers</p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Policy Text
            </label>
            <textarea
              value={formData.shippingPolicyText}
              onChange={(e) => handleChange("shippingPolicyText", e.target.value)}
              rows={6}
              placeholder="Enter your shipping policy details here...

Example:
- We ship to all major cities in Kenya, Uganda, and Tanzania
- Orders are processed within 1-2 business days
- Delivery typically takes 2-5 business days depending on location
- Tracking information will be sent via SMS/email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* Return Policy Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 text-orange-600" />
              Return Policy
            </h2>
            <p className="text-sm text-gray-500 mt-1">Information about returns and refunds</p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Policy Text
            </label>
            <textarea
              value={formData.returnPolicyText}
              onChange={(e) => handleChange("returnPolicyText", e.target.value)}
              rows={5}
              placeholder="Enter your return policy details here...

Example:
- Returns accepted within 7 days of delivery
- Products must be unopened and in original packaging
- Contact us via WhatsApp to initiate a return
- Refunds processed within 3-5 business days"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* International Shipping Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-cyan-600" />
              International Shipping
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure international delivery options</p>
          </div>
          <div className="p-6 space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.internationalShipping}
                onChange={(e) => handleChange("internationalShipping", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium text-gray-900">Enable International Shipping</span>
                <p className="text-sm text-gray-500">Allow orders from countries outside East Africa</p>
              </div>
            </label>

            {formData.internationalShipping && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  International Shipping Note
                </label>
                <textarea
                  value={formData.internationalShippingNote}
                  onChange={(e) => handleChange("internationalShippingNote", e.target.value)}
                  rows={3}
                  placeholder="e.g. International shipping rates are calculated at checkout. Delivery times vary by destination."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
