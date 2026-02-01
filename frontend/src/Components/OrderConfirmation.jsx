import { useLocation } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import Spinner from "./Spinner";

export default function OrderConfirmation() {
  const location = useLocation();
  const { orders, isLoadingOrders, ordersError } = useOrders();

  // Prefer order passed from checkout (avoids race with orders list refetch)
  const orderFromState = location.state?.order;
  const latestOrder = orderFromState ?? (orders?.length ? orders[orders.length - 1] : null);

  if (orderFromState) {
    // We have the order from checkout; no need to wait for useOrders
  } else if (!orders || orders.length === 0) {
    if (!isLoadingOrders) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <p className="text-gray-500 text-lg">
            No recent order found. Please place an order first.
          </p>
        </div>
      );
    }
  }
  if (!latestOrder && isLoadingOrders) return <Spinner />;
  if (!latestOrder && ordersError) return <p>There is an error loading orders</p>;
  if (!latestOrder) return <Spinner />;
  console.log("latest order", latestOrder);
  const paymentMethod = latestOrder.paymentType;
  let payinfo = null;

  if (paymentMethod === "credit-card") {
    const transactionId = latestOrder?.paymentTransactionId;
    const trans4 = transactionId.slice(-4);
    payinfo = trans4;
  } else if (paymentMethod === "mpesa") {
    const mpesaNumber = latestOrder.mpesaDetails;
    payinfo = mpesaNumber ? mpesaNumber.slice(-4) : "";
  } else if (paymentMethod === "pay-on-delivery") {
    payinfo = "payment to be made on delivery";
  }
  const Total = latestOrder.Total;
  const shippingCost = latestOrder.shippingCost;
  const OrderTotal = latestOrder.OrderTotal;

  const orderLeadTime = latestOrder?.orderItems?.reduce((maxLead, item) => {
    if (!item.leadTime) return maxLead;

    const leadDays = item.leadTime.split("-").map((n) => parseInt(n));
    const upperBound = leadDays[1] || leadDays[0];

    return Math.max(maxLead, upperBound);
  }, 0);

  console.log("latestorder", latestOrder);
  console.log(orders);
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-base font-medium text-indigo-600">Thank you!</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            It's on the way!
          </p>
          <p className="mt-2 text-base text-gray-500">
            Your order{" "}
            <span className="font-medium text-green-500">
              {latestOrder.orderNumber}
            </span>{" "}
            has shipped and will be with you soon. You will also receive an
            email at{" "}
            <span className="font-medium text-indigo-500">
              {latestOrder.email}
            </span>{" "}
            when your product arrives.
          </p>

          <dl className="mt-12 text-sm font-medium">
            <dt className="text-gray-900">Tracking number</dt>
            <dd className="mt-2 text-indigo-600">
              {latestOrder.trackingNumber}
            </dd>
          </dl>
        </div>

        <div className="mt-10 border-t border-gray-200">
          <h2 className="sr-only">Your order</h2>

          <h3 className="sr-only">Items</h3>
          {latestOrder?.orderItems?.map((product) => (
            <div
              key={product.id}
              className="flex space-x-6 border-b border-gray-200 py-10"
            >
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="size-20 flex-none rounded-lg bg-gray-100 object-cover sm:size-40"
              />
              <div className="flex flex-auto flex-col">
                <div>
                  <h4 className="font-medium text-gray-900">
                    <p>{product.name}</p>
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {product.description}
                  </p>
                </div>
                <div className="mt-6 flex flex-1 items-end">
                  <dl className="flex divide-x divide-gray-200 text-sm">
                    <div className="flex pr-4 sm:pr-6">
                      <dt className="font-medium text-gray-900">Quantity</dt>
                      <dd className="ml-2 text-gray-700">{product.quantity}</dd>
                    </div>
                    <div className="flex pl-4 sm:pl-6">
                      <dt className="font-medium text-gray-900">Price</dt>
                      <dd className="ml-2 text-gray-700">
                        {product.price * product.quantity}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ))}

          <div className="sm:ml-40 sm:pl-6">
            <h3 className="sr-only">Your information</h3>

            <h4 className="sr-only">Addresses</h4>
            <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm"></dl>

            <h4 className="sr-only">Payment</h4>
            <dl className="grid grid-cols-2 gap-x-6 border-t border-gray-200 py-10 text-sm">
              <div>
                <dt className="font-medium text-gray-900">Payment method</dt>
                <dd className="mt-2 text-gray-700">
                  <p>{paymentMethod}</p>
                  <p>{latestOrder.phoneNumber}</p>
                  <p>
                    <span aria-hidden="true">••••</span>
                    <span className="sr-only">Ending in </span>
                    {paymentMethod === "credit-card" &&
                      `TransactionId: ${payinfo}`}
                    {paymentMethod === "mpesa" && `Tel: ${payinfo}`}
                    {paymentMethod === "pay-on-delivery" && payinfo}
                  </p>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Delivery</dt>
                <dd className="mt-2 text-gray-700">
                  {latestOrder.deliveryType === "pickup" ? (
                    <p>{latestOrder.pickupLocationName || "Pick up"}</p>
                  ) : (
                    <>
                      <p>{latestOrder.shippingMethodName || "Shipping"}</p>
                      {orderLeadTime != null && <p>Takes up to {orderLeadTime} working days</p>}
                    </>
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="sr-only">Summary</h3>

            <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Subtotal</dt>
                <dd className="text-gray-700">Ksh {Total}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Shipping</dt>
                <dd className="text-gray-700">Ksh {shippingCost}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Total</dt>
                <dd className="text-gray-900">Ksh {OrderTotal}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
