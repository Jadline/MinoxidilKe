import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  TruckIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "../stores/cartStore";
import { useUserStore } from "../stores/userStore";
import {
  createOrder,
  getShippingMethods,
  getPickupLocations,
  createAddress,
  getAddresses,
} from "../api";
import {
  validatePhoneByDial,
  validatePostalByCountry,
} from "../helpers/checkoutValidation";
import toast from "react-hot-toast";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function productImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
  const origin =
    path.startsWith("/uploads/") && BASE_URL
      ? BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : BASE_URL || "";
  return origin ? origin + path : path;
}

const paymentMethods = [
  { id: "mpesa", title: "M-Pesa" },
  { id: "pay-on-delivery", title: "Pay on Delivery" },
];

// Countries that have defined shipping methods in the backend. Others see "Enter your shipping address..." message.
const SHIPPING_COUNTRIES = ["Kenya", "Uganda", "Tanzania"];

// Kenya first (primary market), then alphabetical
const COUNTRIES = [
  "Kenya",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Country dial codes: Kenya first, then common/regional. Format: { dial: "254", label: "Kenya", flag: "🇰🇪" }
const COUNTRY_DIAL_CODES = [
  { dial: "254", label: "Kenya", flag: "🇰🇪" },
  { dial: "256", label: "Uganda", flag: "🇺🇬" },
  { dial: "255", label: "Tanzania", flag: "🇹🇿" },
  { dial: "251", label: "Ethiopia", flag: "🇪🇹" },
  { dial: "250", label: "Rwanda", flag: "🇷🇼" },
  { dial: "257", label: "Burundi", flag: "🇧🇮" },
  { dial: "253", label: "Djibouti", flag: "🇩🇯" },
  { dial: "252", label: "Somalia", flag: "🇸🇴" },
  { dial: "249", label: "Sudan", flag: "🇸🇩" },
  { dial: "211", label: "South Sudan", flag: "🇸🇸" },
  { dial: "255", label: "Zanzibar", flag: "🇹🇿" },
  { dial: "27", label: "South Africa", flag: "🇿🇦" },
  { dial: "234", label: "Nigeria", flag: "🇳🇬" },
  { dial: "233", label: "Ghana", flag: "🇬🇭" },
  { dial: "237", label: "Cameroon", flag: "🇨🇲" },
  { dial: "1", label: "USA/Canada", flag: "🇺🇸" },
  { dial: "44", label: "United Kingdom", flag: "🇬🇧" },
  { dial: "91", label: "India", flag: "🇮🇳" },
  { dial: "971", label: "UAE", flag: "🇦🇪" },
  { dial: "86", label: "China", flag: "🇨🇳" },
  { dial: "81", label: "Japan", flag: "🇯🇵" },
  { dial: "886", label: "Taiwan", flag: "🇹🇼" },
  { dial: "49", label: "Germany", flag: "🇩🇪" },
  { dial: "33", label: "France", flag: "🇫🇷" },
  { dial: "61", label: "Australia", flag: "🇦🇺" },
  { dial: "55", label: "Brazil", flag: "🇧🇷" },
  { dial: "20", label: "Egypt", flag: "🇪🇬" },
  { dial: "212", label: "Morocco", flag: "🇲🇦" },
  { dial: "213", label: "Algeria", flag: "🇩🇿" },
  { dial: "216", label: "Tunisia", flag: "🇹🇳" },
  { dial: "260", label: "Zambia", flag: "🇿🇲" },
  { dial: "263", label: "Zimbabwe", flag: "🇿🇼" },
  { dial: "258", label: "Mozambique", flag: "🇲🇿" },
  { dial: "265", label: "Malawi", flag: "🇲🇼" },
  { dial: "267", label: "Botswana", flag: "🇧🇼" },
  { dial: "31", label: "Netherlands", flag: "🇳🇱" },
  { dial: "32", label: "Belgium", flag: "🇧🇪" },
  { dial: "39", label: "Italy", flag: "🇮🇹" },
  { dial: "34", label: "Spain", flag: "🇪🇸" },
  { dial: "353", label: "Ireland", flag: "🇮🇪" },
  { dial: "254", label: "Other", flag: "🌐" },
];

export default function OrderSummary() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState("ship");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("254");
  const isProcessingRef = useRef(false);

  const { cart, setCart, subtotal } = useCartStore();
  const { currentUser } = useUserStore();
  const Total = subtotal();
  const shippingCost =
    deliveryType === "pickup" ? 0 : selectedShippingMethod?.costKes ?? 0;
  const OrderTotal = Total + shippingCost;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentType: "mpesa",
      country: "Kenya",
      firstName: "",
      lastName: "",
      company: "",
      streetAddress: "",
      apartment: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
      deliveryInstructions: "",
    },
  });

  const country = watch("country");
  const city = watch("city");

  // Fetch saved addresses for logged-in users
  const { data: savedAddresses } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: () => getAddresses().then((r) => r.data?.data?.addresses ?? []),
    enabled: !!currentUser,
  });

  // Auto-fill form with saved address when user is logged in
  useEffect(() => {
    if (currentUser && savedAddresses?.length > 0) {
      const addr = savedAddresses[0]; // Use first/default address
      reset({
        paymentType: "mpesa",
        country: addr.country || "Kenya",
        firstName: addr.firstName || "",
        lastName: addr.lastName || "",
        company: addr.company || "",
        streetAddress: addr.streetAddress || "",
        apartment: addr.apartment || "",
        city: addr.city || "",
        postalCode: addr.postalCode || "",
        phone: addr.phone || "",
        email: currentUser.email || "",
        deliveryInstructions: "",
      });
      // Set phone country code if available
      if (addr.phoneCountryCode) {
        setPhoneCountryCode(addr.phoneCountryCode);
      }
    } else if (currentUser) {
      // At least pre-fill email from user account
      setValue("email", currentUser.email || "");
    }
  }, [currentUser, savedAddresses, reset, setValue]);

  // Fetch shipping methods only for Kenya, Uganda, Tanzania. Other countries show the "Enter your shipping address..." message.
  const hasShippingMethods =
    country && SHIPPING_COUNTRIES.includes(country.trim());
  const { data: shippingData, isLoading: shippingLoading } = useQuery({
    queryKey: ["shipping-methods", country, city],
    queryFn: () =>
      getShippingMethods({
        country: country || "Kenya",
        city: city || "",
      }).then((r) => r.data?.data?.shippingMethods ?? []),
    enabled: deliveryType === "ship" && !!hasShippingMethods,
  });
  const shippingMethods = Array.isArray(shippingData) ? shippingData : [];

  // Fetch pickup locations when Pick up – business is in Kenya, so only Kenya locations
  const {
    data: pickupData,
    isLoading: pickupLoading,
    isError: pickupError,
    error: pickupErrorDetail,
  } = useQuery({
    queryKey: ["pickup-locations", "Kenya"],
    queryFn: () =>
      getPickupLocations({ country: "Kenya" }).then(
        (r) => r.data?.data?.pickupLocations ?? []
      ),
    enabled: deliveryType === "pickup",
  });
  const pickupLocations = Array.isArray(pickupData) ? pickupData : [];

  // Reset selection when switching delivery type or when list changes
  useEffect(() => {
    setSelectedShippingMethod(null);
    setSelectedPickupLocation(null);
  }, [deliveryType, country, city]);

  const saveOrderMutation = useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: async (response, variables) => {
      if (
        saveAddressForNextTime &&
        deliveryType === "ship" &&
        variables.streetAddress &&
        variables.city
      ) {
        try {
          await createAddress({
            country: variables.country,
            firstName: variables.firstName,
            lastName: variables.lastName,
            company: variables.company,
            streetAddress: variables.streetAddress,
            apartment: variables.apartment,
            city: variables.city,
            postalCode: variables.postalCode,
            phone: variables.phone || variables.phoneNumber,
            isDefault: true,
          });
        } catch (e) {
          // non-blocking
        }
      }
      toast.success("Order created successfully!");
      isProcessingRef.current = false;
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setCart([]);
      const createdOrder = response?.data?.data?.order;
      navigate("/order-confirmation", {
        state: createdOrder ? { order: createdOrder } : undefined,
      });
    },
    onError: (err) => {
      isProcessingRef.current = false;
      setIsSubmitting(false);
      const data = err?.response?.data;
      const firstError = data?.errors?.[0]?.msg ?? data?.errors?.[0]?.message;
      toast.error(firstError || data?.message || "Failed to save order");
    },
  });

  const notifyMpesaMutation = useMutation({
    mutationFn: (data) =>
      fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/mpesa-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => toast.success("Payment notification received!"),
    onError: () => toast.error("Failed to send payment notification."),
  });

  function handleMpesaNotification() {
    const mpesaNumber = watch("mpesaNumber");
    if (!mpesaNumber) {
      toast.error("Please enter the phone number you used for M-Pesa.");
      return;
    }
    notifyMpesaMutation.mutate({
      phone: mpesaNumber.replace(/^0/, "254"),
      description: watch("mpesaDescription") || "",
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    });
  }

  function onhandleSubmit(data) {
    if (isProcessingRef.current || isSubmitting) {
      toast.error("Please wait, your order is being processed...");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (deliveryType === "ship") {
      if (!data.country || !data.streetAddress || !data.city) {
        toast.error("Please fill in country, address and city for shipping.");
        return;
      }
      if (!selectedShippingMethod) {
        toast.error("Please select a shipping method.");
        return;
      }
    } else {
      if (!selectedPickupLocation) {
        toast.error("Please select a pickup location.");
        return;
      }
    }

    isProcessingRef.current = true;
    setIsSubmitting(true);

    const toNational = (val, dial) => {
      const digits = (val || "").replace(/\D/g, "");
      return digits.startsWith(dial)
        ? digits.slice(dial.length)
        : digits.replace(/^0+/, "");
    };
    const fullPhone = (
      phoneCountryCode + toNational(data.phone, phoneCountryCode)
    ).trim();

    const payload = {
      orderItems: cart.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        leadTime: item.leadTime,
        price: item.price,
        quantity: item.quantity,
        imageSrc: item.imageSrc,
        imageAlt: item.imageAlt,
      })),
      deliveryType,
      shippingMethodName: selectedShippingMethod?.name ?? null,
      shippingCost:
        deliveryType === "ship" ? selectedShippingMethod?.costKes : 0,
      pickupLocationName: selectedPickupLocation?.name ?? null,
      pickupLocationId: selectedPickupLocation?._id ?? null,
      country: data.country || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      company: data.company || "",
      streetAddress: data.streetAddress || "",
      apartment: data.apartment || "",
      city: data.city || "",
      postalCode: data.postalCode || null,
      phone: fullPhone,
      phoneNumber: fullPhone, // Use same phone for both
      email: data.email || "",
      deliveryInstructions: data.deliveryInstructions || null,
      paymentType: data.paymentType,
      mpesaNumber: data.mpesaNumber || null,
    };

    saveOrderMutation.mutate(payload);
  }

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 to-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <h2 className="sr-only">Checkout</h2>

        <form
          onSubmit={handleSubmit(onhandleSubmit)}
          className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
        >
          <div>
            {/* Delivery: Ship vs Pick up */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-indigo-800">
                Delivery
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                    deliveryType === "ship"
                      ? "border-indigo-600 bg-indigo-50/80 shadow-sm"
                      : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "ship"}
                    onChange={() => setDeliveryType("ship")}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <TruckIcon
                    className={`h-6 w-6 ${
                      deliveryType === "ship"
                        ? "text-indigo-600"
                        : "text-indigo-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      deliveryType === "ship"
                        ? "text-indigo-900"
                        : "text-gray-700"
                    }`}
                  >
                    Ship
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                    deliveryType === "pickup"
                      ? "border-indigo-600 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "pickup"}
                    onChange={() => setDeliveryType("pickup")}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <BuildingOfficeIcon
                    className={`h-6 w-6 ${
                      deliveryType === "pickup"
                        ? "text-indigo-600"
                        : "text-indigo-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      deliveryType === "pickup"
                        ? "text-indigo-900"
                        : "text-gray-700"
                    }`}
                  >
                    Pick up
                  </span>
                  <span className="text-xs text-gray-500">
                    (Leave phone in billing below)
                  </span>
                </label>
              </div>
            </div>

            {deliveryType === "ship" && (
              <>
                <div className="border-t border-indigo-100 pt-10">
                  <h2 className="text-lg font-semibold text-indigo-800">
                    Shipping address
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Country / Region
                      </label>
                      <select
                        {...register("country", { required: "Required" })}
                        disabled={isSubmitting}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 sm:text-sm"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        {...register("firstName", { required: "Required" })}
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        {...register("lastName", { required: "Required" })}
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Company (optional)
                      </label>
                      <input
                        {...register("company")}
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        {...register("streetAddress", {
                          required: "Street address is required",
                        })}
                        disabled={isSubmitting}
                        placeholder="e.g. P.o box 254, Kerugoya"
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                      {errors.streetAddress && (
                        <p className="text-red-600 text-sm">
                          {errors.streetAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        {...register("apartment")}
                        disabled={isSubmitting}
                        placeholder="e.g. Peniel Apartments, juja"
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        {...register("city", { required: "City is required" })}
                        disabled={isSubmitting}
                        placeholder="e.g. Nairobi"
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Postal code (optional)
                      </label>
                      <input
                        {...register("postalCode", {
                          validate: (v) => {
                            const r = validatePostalByCountry(v, country);
                            return r.valid || r.message;
                          },
                        })}
                        disabled={isSubmitting}
                        placeholder="e.g. 10300"
                        className={`mt-1 w-full rounded-md px-3 py-2 shadow-sm sm:text-sm ${
                          errors.postalCode
                            ? "border-red-500 border"
                            : "border-gray-300 border"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <div
                        className={`mt-1 flex rounded-md bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 ${
                          errors.phone
                            ? "border border-red-500 focus-within:border-red-500"
                            : "border border-gray-300 focus-within:border-indigo-500"
                        }`}
                      >
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1.5 border-0 bg-transparent py-2 pl-3 pr-2 text-gray-700 focus:ring-0 sm:text-sm"
                        >
                          {COUNTRY_DIAL_CODES.map((c) => (
                            <option key={c.dial + c.label} value={c.dial}>
                              {c.flag} +{c.dial}
                            </option>
                          ))}
                        </select>
                        <input
                          {...register("phone", {
                            required:
                              deliveryType === "ship"
                                ? "Phone is required for shipping"
                                : false,
                            validate: (v) => {
                              if (deliveryType !== "ship" && !(v || "").trim())
                                return true;
                              const digits = (v || "").replace(/\D/g, "");
                              const national = digits.startsWith(
                                phoneCountryCode
                              )
                                ? digits.slice(phoneCountryCode.length)
                                : digits;
                              const r = validatePhoneByDial(
                                national || digits,
                                phoneCountryCode
                              );
                              return r.valid || r.message;
                            },
                          })}
                          type="tel"
                          disabled={isSubmitting}
                          placeholder="791 061 920"
                          className="block w-full min-w-0 flex-1 border-0 py-2 pr-3 pl-1 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                        type="email"
                        disabled={isSubmitting}
                        placeholder="you@example.com"
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Delivery instructions (optional)
                      </label>
                      <textarea
                        {...register("deliveryInstructions")}
                        disabled={isSubmitting}
                        rows={2}
                        placeholder="e.g. Leave at gate, Call before delivery"
                        className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddressForNextTime}
                        onChange={(e) =>
                          setSaveAddressForNextTime(e.target.checked)
                        }
                        disabled={isSubmitting}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="saveAddress"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Save this information for next time
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-indigo-100 pt-10">
                  <h2 className="text-lg font-semibold text-indigo-800">
                    Shipping method
                  </h2>
                  {!country?.trim() ? (
                    <div className="mt-4 rounded-lg bg-gray-100 px-4 py-6 text-center text-gray-600">
                      Enter your shipping address to view available shipping
                      methods.
                    </div>
                  ) : !hasShippingMethods ? (
                    <div className="mt-4 rounded-lg bg-gray-100 px-4 py-6 text-center text-gray-600">
                      Enter your shipping address to view available shipping
                      methods.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {shippingLoading && (
                        <p className="text-indigo-600">Loading…</p>
                      )}
                      {!shippingLoading && shippingMethods.length === 0 && (
                        <p className="text-slate-600">
                          No shipping methods for this country/city. Try a
                          different city or contact us.
                        </p>
                      )}
                      {!shippingLoading &&
                        shippingMethods.map((method) => (
                          <label
                            key={method._id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                              selectedShippingMethod?._id === method._id
                                ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingMethod"
                              checked={
                                selectedShippingMethod?._id === method._id
                              }
                              onChange={() => setSelectedShippingMethod(method)}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 px-3 text-left min-w-0">
                              <span
                                className={`font-semibold block break-words ${
                                  selectedShippingMethod?._id === method._id
                                    ? "text-indigo-900"
                                    : "text-gray-800"
                                }`}
                              >
                                {method.name}
                              </span>
                              {method.description && (
                                <p className="text-sm text-slate-600 break-words">
                                  {method.description}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-indigo-600 whitespace-nowrap">
                              Ksh {method.costKes?.toLocaleString()}.00
                            </span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {deliveryType === "pickup" && (
              <div className="border-t border-indigo-100 pt-10">
                <h2 className="text-lg font-semibold text-indigo-800">
                  Pickup locations
                </h2>
                <p className="mt-1 text-sm font-medium text-blue-600">
                  Pickups are in Kenya.
                </p>
                {pickupLoading ? (
                  <div className="mt-4 rounded-xl bg-indigo-50/70 border border-indigo-100 px-4 py-6 text-center text-indigo-700">
                    Loading…
                  </div>
                ) : pickupError ? (
                  <div className="mt-4 rounded-xl bg-red-50 px-4 py-6 text-center text-red-700 border border-red-100">
                    Could not load pickup locations. Check that the backend is
                    running and the API is reachable.
                    {pickupErrorDetail?.message && (
                      <p className="mt-1 text-sm">
                        {pickupErrorDetail.message}
                      </p>
                    )}
                  </div>
                ) : pickupLocations.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-amber-50 px-4 py-6 text-center text-amber-800 border border-amber-200">
                    No pickup locations in Kenya yet. Run the seed script on the
                    backend:{" "}
                    <code className="text-sm">
                      node dev-data/seedPickupLocations.js
                    </code>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pickupLocations.map((loc) => (
                      <label
                        key={loc._id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                          selectedPickupLocation?._id === loc._id
                            ? "border-indigo-600 bg-indigo-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupLocation"
                          checked={selectedPickupLocation?._id === loc._id}
                          onChange={() => setSelectedPickupLocation(loc)}
                          className="mt-1 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              selectedPickupLocation?._id === loc._id
                                ? "text-indigo-900"
                                : "text-gray-800"
                            }`}
                          >
                            {loc.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {loc.address}
                          </p>
                          {loc.distanceKm != null && (
                            <p className="text-sm text-slate-500">
                              {loc.distanceKm} km
                            </p>
                          )}
                        </div>
                        <span
                          className={`font-semibold whitespace-nowrap ${
                            loc.costKes === 0
                              ? "text-emerald-600"
                              : "text-indigo-600"
                          }`}
                        >
                          {loc.costKes === 0 ? "FREE" : `Ksh ${loc.costKes}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment */}
            <div className="mt-10 border-t border-indigo-100 pt-10">
              <h2 className="text-lg font-semibold text-indigo-800">Payment</h2>
              <fieldset className="mt-4">
                <legend className="sr-only">Payment type</legend>
                <div className="space-y-4 sm:flex sm:space-x-10 sm:space-y-0">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="radio"
                        value={method.id}
                        {...register("paymentType", { required: true })}
                        disabled={isSubmitting}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {method.title}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="mt-3 text-sm text-gray-600">
                Want to pay by card?{" "}
                <a
                  href="https://wa.me/254726787330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Contact us on WhatsApp +254 726 787330
                </a>
              </p>

              {watch("paymentType") === "mpesa" && (
                <div className="mt-6 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="font-medium text-gray-700">
                    Pay with Safaricom M-Pesa
                  </p>
                  <ol className="list-inside list-decimal text-sm text-gray-700">
                    <li>
                      Select <strong>Lipa na M-Pesa → Pay Bill</strong>
                    </li>
                    <li>
                      Business Number: <strong>522533</strong>
                    </li>
                    <li>
                      Account Number: <strong>8023258</strong>
                    </li>
                    <li>
                      Amount: <strong>{OrderTotal}</strong>
                    </li>
                    <li>Enter your M-Pesa PIN and confirm</li>
                  </ol>
                  <input
                    type="text"
                    placeholder="Phone number used for payment"
                    {...register("mpesaNumber", {
                      pattern: {
                        value: /^0\d{9}$/,
                        message: "Valid Kenyan phone",
                      },
                    })}
                    disabled={isSubmitting}
                    className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm"
                  />
                  {errors.mpesaNumber && (
                    <p className="text-red-600 text-sm">
                      {errors.mpesaNumber.message}
                    </p>
                  )}
                  <textarea
                    placeholder="Optional: Payment reference"
                    {...register("mpesaDescription")}
                    disabled={isSubmitting}
                    className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleMpesaNotification}
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-green-600 px-4 py-3 text-white hover:bg-green-700"
                  >
                    I've Made Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-semibold text-indigo-800">
              Order summary
            </h2>
            <div className="mt-4 rounded-xl border-2 border-indigo-100 bg-white shadow-md shadow-indigo-100/50">
              <ul className="divide-y divide-gray-200">
                {cart.map((product) => (
                  <li key={product.id} className="flex px-4 py-6 sm:px-6">
                    <img
                      src={productImageSrc(product.imageSrc)}
                      alt={product.imageAlt}
                      className="h-20 w-20 rounded-md object-contain"
                    />
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setCart((prev) =>
                              prev.filter((i) => i.id !== product.id)
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Ksh {product.price} × {product.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-3 border-t border-indigo-100 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-sm text-gray-700">
                  <dt>Subtotal</dt>
                  <dd className="text-indigo-700 font-medium">
                    Ksh {Total?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <dt>Shipping</dt>
                  <dd className="text-indigo-700">
                    {deliveryType === "pickup" ? (
                      selectedPickupLocation ? (
                        <span className="text-emerald-600 font-medium">
                          Pickup – FREE
                        </span>
                      ) : (
                        "—"
                      )
                    ) : selectedShippingMethod ? (
                      `${selectedShippingMethod.name} – Ksh ${(
                        selectedShippingMethod.costKes ?? 0
                      ).toLocaleString()}`
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t-2 border-indigo-100 pt-3 text-base font-semibold">
                  <dt className="text-indigo-900">Total</dt>
                  <dd className="text-indigo-600">
                    Ksh {OrderTotal?.toLocaleString()}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-md px-4 py-3 text-base font-medium text-white ${
                    isSubmitting
                      ? "cursor-not-allowed bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSubmitting ? "Processing…" : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
