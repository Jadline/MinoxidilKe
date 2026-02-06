import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  TrashIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  HomeIcon,
  ArrowLeftIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useCartStore } from "../stores/cartStore";
import { useUserStore } from "../stores/userStore";
import Price, { usePrice } from "./Price";
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
  { id: "mpesa", title: "M-Pesa", icon: "📱", description: "Pay via Safaricom M-Pesa" },
  { id: "pay-on-delivery", title: "Pay on Delivery", icon: "💵", description: "Cash on delivery" },
];

const SHIPPING_COUNTRIES = ["Kenya", "Uganda", "Tanzania"];

const COUNTRIES = [
  "Kenya",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kiribati", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
];

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
  { dial: "49", label: "Germany", flag: "🇩🇪" },
  { dial: "33", label: "France", flag: "🇫🇷" },
  { dial: "61", label: "Australia", flag: "🇦🇺" },
  { dial: "55", label: "Brazil", flag: "🇧🇷" },
  { dial: "20", label: "Egypt", flag: "🇪🇬" },
  { dial: "212", label: "Morocco", flag: "🇲🇦" },
  { dial: "260", label: "Zambia", flag: "🇿🇲" },
  { dial: "263", label: "Zimbabwe", flag: "🇿🇼" },
  { dial: "265", label: "Malawi", flag: "🇲🇼" },
];

// Input component for consistent styling
function FormInput({ label, error, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'} ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:ring-2 focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-500`}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

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
  const shippingCost = deliveryType === "pickup" ? 0 : selectedShippingMethod?.costKes ?? 0;
  const OrderTotal = Total + shippingCost;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

  const { data: savedAddresses } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: () => getAddresses().then((r) => r.data?.data?.addresses ?? []),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (currentUser && savedAddresses?.length > 0) {
      const addr = savedAddresses[0];
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
      if (addr.phoneCountryCode) {
        setPhoneCountryCode(addr.phoneCountryCode);
      }
    } else if (currentUser) {
      setValue("email", currentUser.email || "");
    }
  }, [currentUser, savedAddresses, reset, setValue]);

  const hasShippingMethods = country && SHIPPING_COUNTRIES.includes(country.trim());
  const { data: shippingData, isLoading: shippingLoading } = useQuery({
    queryKey: ["shipping-methods", country, city],
    queryFn: () =>
      getShippingMethods({ country: country || "Kenya", city: city || "" })
        .then((r) => r.data?.data?.shippingMethods ?? []),
    enabled: deliveryType === "ship" && !!hasShippingMethods,
  });
  const shippingMethods = Array.isArray(shippingData) ? shippingData : [];

  const { data: pickupData, isLoading: pickupLoading, isError: pickupError } = useQuery({
    queryKey: ["pickup-locations", "Kenya"],
    queryFn: () => getPickupLocations({ country: "Kenya" }).then((r) => r.data?.data?.pickupLocations ?? []),
    enabled: deliveryType === "pickup",
  });
  const pickupLocations = Array.isArray(pickupData) ? pickupData : [];

  useEffect(() => {
    setSelectedShippingMethod(null);
    setSelectedPickupLocation(null);
  }, [deliveryType, country, city]);

  const saveOrderMutation = useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: async (response, variables) => {
      if (saveAddressForNextTime && deliveryType === "ship" && variables.streetAddress && variables.city) {
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
        } catch (e) { /* non-blocking */ }
      }
      toast.success("Order created successfully!");
      isProcessingRef.current = false;
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setCart([]);
      const createdOrder = response?.data?.data?.order;
      navigate("/order-confirmation", { state: createdOrder ? { order: createdOrder } : undefined });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("userToken")}` },
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
      return digits.startsWith(dial) ? digits.slice(dial.length) : digits.replace(/^0+/, "");
    };
    const fullPhone = (phoneCountryCode + toNational(data.phone, phoneCountryCode)).trim();

    const payload = {
      orderItems: cart.map((item) => ({
        id: item.id, name: item.name, description: item.description, leadTime: item.leadTime,
        price: item.price, quantity: item.quantity, imageSrc: item.imageSrc, imageAlt: item.imageAlt,
      })),
      deliveryType,
      shippingMethodName: selectedShippingMethod?.name ?? null,
      shippingCost: deliveryType === "ship" ? selectedShippingMethod?.costKes : 0,
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
      phoneNumber: fullPhone,
      email: data.email || "",
      deliveryInstructions: data.deliveryInstructions || null,
      paymentType: data.paymentType,
      mpesaNumber: data.mpesaNumber || null,
    };

    saveOrderMutation.mutate(payload);
  }

  // Calculate progress steps
  const steps = [
    { name: 'Cart', completed: true },
    { name: 'Shipping', completed: deliveryType === 'ship' ? !!selectedShippingMethod : !!selectedPickupLocation },
    { name: 'Payment', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Cart</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LockClosedIcon className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="pb-4">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, idx) => (
                <div key={step.name} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    step.completed 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {step.completed ? (
                      <CheckIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-medium text-gray-500">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${step.completed ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${step.completed ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onhandleSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Delivery Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-indigo-600" />
                  Delivery Method
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("ship")}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      deliveryType === "ship"
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    {deliveryType === "ship" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <div className={`p-3 rounded-full ${deliveryType === "ship" ? "bg-indigo-100" : "bg-gray-100"}`}>
                      <TruckIcon className={`w-8 h-8 ${deliveryType === "ship" ? "text-indigo-600" : "text-gray-500"}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${deliveryType === "ship" ? "text-indigo-900" : "text-gray-700"}`}>
                        Ship to Address
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Delivery to your door</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      deliveryType === "pickup"
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    {deliveryType === "pickup" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <div className={`p-3 rounded-full ${deliveryType === "pickup" ? "bg-indigo-100" : "bg-gray-100"}`}>
                      <BuildingOfficeIcon className={`w-8 h-8 ${deliveryType === "pickup" ? "text-indigo-600" : "text-gray-500"}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${deliveryType === "pickup" ? "text-indigo-900" : "text-gray-700"}`}>
                        Pick Up
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Collect from store</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Shipping Address Form */}
            {deliveryType === "ship" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-indigo-600" />
                    Shipping Address
                  </h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country / Region</label>
                    <select
                      {...register("country", { required: "Required" })}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 disabled:bg-gray-50"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="First Name"
                      icon={UserIcon}
                      {...register("firstName", { required: "Required" })}
                      disabled={isSubmitting}
                      placeholder="John"
                      error={errors.firstName?.message}
                    />
                    <FormInput
                      label="Last Name"
                      {...register("lastName", { required: "Required" })}
                      disabled={isSubmitting}
                      placeholder="Doe"
                      error={errors.lastName?.message}
                    />
                  </div>

                  {/* Company */}
                  <FormInput
                    label="Company (optional)"
                    {...register("company")}
                    disabled={isSubmitting}
                    placeholder="Your company name"
                  />

                  {/* Address */}
                  <FormInput
                    label="Street Address"
                    icon={HomeIcon}
                    {...register("streetAddress", { required: "Street address is required" })}
                    disabled={isSubmitting}
                    placeholder="e.g. 123 Kenyatta Avenue, CBD"
                    error={errors.streetAddress?.message}
                  />

                  <FormInput
                    label="Apartment, suite, etc. (optional)"
                    {...register("apartment")}
                    disabled={isSubmitting}
                    placeholder="e.g. Westlands Heights, Floor 3, Unit 12"
                  />

                  {/* City & Postal */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="City"
                      {...register("city", { required: "City is required" })}
                      disabled={isSubmitting}
                      placeholder="e.g. Nairobi"
                      error={errors.city?.message}
                    />
                    <FormInput
                      label="Postal Code (optional)"
                      {...register("postalCode", {
                        validate: (v) => {
                          const r = validatePostalByCountry(v, country);
                          return r.valid || r.message;
                        },
                      })}
                      disabled={isSubmitting}
                      placeholder="e.g. 10300"
                      error={errors.postalCode?.message}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className={`flex rounded-xl border ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-opacity-20 overflow-hidden`}>
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        disabled={isSubmitting}
                        className="border-0 bg-gray-50 py-3 pl-4 pr-2 text-gray-700 focus:ring-0"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.dial + c.label} value={c.dial}>
                            {c.flag} +{c.dial}
                          </option>
                        ))}
                      </select>
                      <input
                        {...register("phone", {
                          required: deliveryType === "ship" ? "Phone is required for shipping" : false,
                          validate: (v) => {
                            if (deliveryType !== "ship" && !(v || "").trim()) return true;
                            const digits = (v || "").replace(/\D/g, "");
                            const national = digits.startsWith(phoneCountryCode) ? digits.slice(phoneCountryCode.length) : digits;
                            const r = validatePhoneByDial(national || digits, phoneCountryCode);
                            return r.valid || r.message;
                          },
                        })}
                        type="tel"
                        disabled={isSubmitting}
                        placeholder="712 345 678"
                        className="flex-1 border-0 py-3 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0"
                      />
                    </div>
                    {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <FormInput
                    label="Email Address"
                    icon={EnvelopeIcon}
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
                    })}
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                    error={errors.email?.message}
                  />

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Instructions (optional)</label>
                    <textarea
                      {...register("deliveryInstructions")}
                      disabled={isSubmitting}
                      rows={3}
                      placeholder="e.g. Leave at gate, Call before delivery"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>

                  {/* Save Address */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddressForNextTime}
                      onChange={(e) => setSaveAddressForNextTime(e.target.checked)}
                      disabled={isSubmitting}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Save this address for future orders</span>
                  </label>
                </div>
              </div>
            )}

            {/* Shipping Method / Pickup Location */}
            {deliveryType === "ship" ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-indigo-600" />
                    Shipping Method
                  </h2>
                </div>
                <div className="p-6">
                  {!country?.trim() || !hasShippingMethods ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MapPinIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Enter your shipping address to view available shipping methods.</p>
                    </div>
                  ) : shippingLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-indigo-600">Loading shipping options...</p>
                    </div>
                  ) : shippingMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No shipping methods available for this location. Try a different city or contact us.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingMethods.map((method) => (
                        <label
                          key={method._id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedShippingMethod?._id === method._id
                              ? "border-indigo-600 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={selectedShippingMethod?._id === method._id}
                            onChange={() => setSelectedShippingMethod(method)}
                            className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${selectedShippingMethod?._id === method._id ? "text-indigo-900" : "text-gray-800"}`}>
                              {method.name}
                            </p>
                            {method.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                            )}
                          </div>
                          <span className="font-bold text-indigo-600 whitespace-nowrap">
                            <Price amount={method.costKes ?? 0} />
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
                    Pickup Location
                  </h2>
                  <p className="text-sm text-indigo-600 mt-1">Pickups available in Kenya</p>
                </div>
                <div className="p-6">
                  {pickupLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-indigo-600">Loading pickup locations...</p>
                    </div>
                  ) : pickupError ? (
                    <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl">
                      Could not load pickup locations. Please try again later.
                    </div>
                  ) : pickupLocations.length === 0 ? (
                    <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-xl">
                      No pickup locations available yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pickupLocations.map((loc) => (
                        <label
                          key={loc._id}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPickupLocation?._id === loc._id
                              ? "border-indigo-600 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickupLocation"
                            checked={selectedPickupLocation?._id === loc._id}
                            onChange={() => setSelectedPickupLocation(loc)}
                            className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className={`font-semibold ${selectedPickupLocation?._id === loc._id ? "text-indigo-900" : "text-gray-800"}`}>
                              {loc.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">{loc.address}</p>
                          </div>
                          <span className={`font-bold whitespace-nowrap ${loc.costKes === 0 ? "text-green-600" : "text-indigo-600"}`}>
                            {loc.costKes === 0 ? "FREE" : <Price amount={loc.costKes} />}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                  Payment Method
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("paymentType") === method.id
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        {...register("paymentType", { required: true })}
                        disabled={isSubmitting}
                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${watch("paymentType") === method.id ? "text-indigo-900" : "text-gray-800"}`}>
                          {method.title}
                        </p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  Want to pay by card?{" "}
                  <a
                    href="https://wa.me/254726787330"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-600 hover:text-green-700 hover:underline"
                  >
                    Contact us on WhatsApp
                  </a>
                </p>

                {/* M-Pesa Instructions */}
                {watch("paymentType") === "mpesa" && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📱</span>
                      <h3 className="font-semibold text-green-800">Pay with M-Pesa</h3>
                    </div>
                    <ol className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Select <strong>Lipa na M-Pesa → Pay Bill</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Business Number: <strong className="bg-green-200 px-2 py-0.5 rounded">522533</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Account Number: <strong className="bg-green-200 px-2 py-0.5 rounded">8023258</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Amount: <strong className="bg-green-200 px-2 py-0.5 rounded"><Price amount={OrderTotal} /></strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        <span>Enter your M-Pesa PIN and confirm</span>
                      </li>
                    </ol>

                    <div className="mt-5 space-y-3">
                      <input
                        type="text"
                        placeholder="Phone number used for payment (e.g. 0712345678)"
                        {...register("mpesaNumber")}
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
                      />
                      <textarea
                        placeholder="Payment reference (optional)"
                        {...register("mpesaDescription")}
                        disabled={isSubmitting}
                        rows={2}
                        className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
                      />
                      <button
                        type="button"
                        onClick={handleMpesaNotification}
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        I've Made Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="sticky top-32">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>

                {/* Cart Items */}
                <div className="max-h-80 overflow-y-auto">
                  <ul className="divide-y divide-gray-100">
                    {cart.map((product) => (
                      <li key={product.id} className="p-4 flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={productImageSrc(product.imageSrc)}
                            alt={product.imageAlt}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500">
                            <Price amount={product.price} /> × {product.quantity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCart((prev) => prev.filter((i) => i.id !== product.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div className="p-6 bg-gray-50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900"><Price amount={Total} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {deliveryType === "pickup" ? (
                        selectedPickupLocation ? (
                          <span className="text-green-600">FREE</span>
                        ) : "—"
                      ) : selectedShippingMethod ? (
                        <Price amount={selectedShippingMethod.costKes ?? 0} />
                      ) : "—"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-indigo-600"><Price amount={OrderTotal} /></span>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="p-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-5 h-5" />
                        Confirm Order
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TruckIcon className="w-5 h-5 text-blue-500" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {Total < 6000 && deliveryType === "ship" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <TruckIcon className="w-5 h-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                      Add <Price amount={6000 - Total} /> more for free delivery!
                    </p>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((Total / 6000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {Total >= 6000 && deliveryType === "ship" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">You qualify for FREE delivery!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
