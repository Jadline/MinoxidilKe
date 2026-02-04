import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { TrashIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useProducts } from "../Contexts/productContext";
import { createOrder } from "../Services/createOrder";
import { createPayment } from "../Services/createPayment";
import { createMpesaPayment } from "../Services/creatempesaPayment";

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
  { id: "credit-card", title: "Credit card" },
  { id: "mpesa", title: "M-Pesa" },
  { id: "pay-on-delivery", title: "Pay on Delivery" },
];

export default function OrderSummary() {
  const {
    cart,
    Total,
    OrderTotal,
    shippingCost,
    setCart,
    selectedCity,

    setSelectedCity,
  } = useProducts();

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState } = useForm();
  const { errors } = formState;
  const paymentType = watch("paymentType");

  const { mutateAsync: createPaymentIntent } = useMutation({
    mutationFn: (data) => createPayment(data),
  });
  const { mutateAsync: mutateMpesaPayment } = useMutation({
    mutationFn: (data) => createMpesaPayment(data),
  });

  const { mutate: saveOrder } = useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: () => {
      alert("✅ Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setCart([]);
      setSelectedCity("");
      navigate("/order-confirmation");
    },
    onError: (err) => {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save order");
    },
  });

  async function onhandleSubmit(data) {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const newOrder = {
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      trackingNumber: "TRK-" + Math.random().toString().slice(2, 14),
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
      shippingCost,
      city: selectedCity,
      OrderTotal,
      Total,
      email: data.email,
      date: new Date().toISOString(),
      paymentType: data.paymentType,
      mpesaDetails: data.mpesaNumber || null,
    };

    if (data.paymentType === "credit-card") {
      if (!stripe || !elements) {
        alert("Stripe is not loaded yet.");
        return;
      }

      try {
        const amountInCents = Math.round(OrderTotal * 100);

        const payment = { amount: amountInCents, currency: "kes" };

        const response = await createPaymentIntent(payment);
        const clientSecret = response?.clientSecret;

        if (!clientSecret) {
          alert("Payment initialization failed. Try again.");
          return;
        }

        const cardElement = elements.getElement(CardElement);
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: { card: cardElement },
          }
        );

        if (error) {
          alert(error.message);
          return;
        }

        if (paymentIntent.status === "succeeded") {
          alert("💳 Payment successful!");

          saveOrder({
            ...newOrder,
            paymentProvider: "stripe",
            paymentStatus: paymentIntent.status,
            paymentTransactionId: paymentIntent.id,
          });
        }
      } catch (err) {
        console.error(err);
        alert("Error processing payment");
      }
      return;
    }
    if (data.paymentType === "mpesa") {
      try {
        const mpesaPayment = {
          amount: Math.round(OrderTotal),
          phone: data.mpesaNumber.replace(/^0/, "254"),
        };

        const response = await mutateMpesaPayment(mpesaPayment);

        if (response.ResponseCode === "0") {
          alert("📲 Check your phone to complete the payment.");

          saveOrder({
            ...newOrder,
            paymentProvider: "mpesa",
            paymentStatus: "pending",
            transactionId: response.CheckoutRequestID,
          });
        } else {
          alert(
            "M-Pesa payment failed: " + (response.errorMessage || "Try again.")
          );
        }
      } catch (err) {
        console.error(err);
        alert("Error initiating M-Pesa payment");
      }
      return;
    }

    saveOrder(newOrder);
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <h2 className="sr-only">Checkout</h2>

        <form
          onSubmit={handleSubmit(onhandleSubmit)}
          className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
        >
          <div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Contact information
              </h2>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "This field is required" })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  {...register("email", { required: "This field is required" })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phoneNumber", {
                    required: "This field is required",
                  })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.phoneNumber && (
                  <p className="text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-lg font-medium text-gray-900">Payment</h2>

              <fieldset className="mt-4">
                <legend className="sr-only">Payment type</legend>
                <div className="space-y-4 sm:flex sm:space-x-10 sm:space-y-0">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="radio"
                        value={method.id}
                        {...register("paymentType", {
                          required: "Select a payment method",
                        })}
                        className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {method.title}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {paymentType === "credit-card" && (
                <div className="mt-6 border rounded-md p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card details
                  </label>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#1f2937",
                          "::placeholder": { color: "#9ca3af" },
                        },
                        invalid: { color: "#ef4444" },
                      },
                    }}
                  />
                </div>
              )}

              {paymentType === "mpesa" && (
                <div className="mt-6 space-y-3 bg-gray-50 p-4 rounded-md border">
                  <p className="text-gray-700">
                    You’ll be prompted to confirm payment via M-Pesa.
                  </p>
                  <input
                    type="tel"
                    placeholder="Enter M-Pesa phone number"
                    {...register("mpesaNumber", {
                      required: "M-Pesa number is required",
                      pattern: {
                        value: /^0\d{9}$/,
                        message: "Enter a valid Kenyan phone number",
                      },
                    })}
                    className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.mpesaNumber && (
                    <p className="text-red-600">{errors.mpesaNumber.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-4 rounded-lg border bg-white shadow-sm">
              <ul role="list" className="divide-y divide-gray-200">
                {cart.map((product) => (
                  <li key={product.id} className="flex px-4 py-6 sm:px-6">
                    <img
                      src={productImageSrc(product.imageSrc)}
                      alt={product.imageAlt}
                      className="w-20 rounded-md"
                    />
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          {product.title}
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
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.price} × {product.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="space-y-3 border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-sm">
                  <dt>Subtotal</dt>
                  <dd>Ksh {Total}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt>Shipping</dt>
                  <dd>Ksh {shippingCost}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-medium">
                  <dt>Total</dt>
                  <dd>Ksh {OrderTotal}</dd>
                </div>
              </dl>

              <div className="border-t px-4 py-6 sm:px-6">
                <button
                  type="submit"
                  className="w-full rounded-md bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700"
                >
                  Confirm order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
