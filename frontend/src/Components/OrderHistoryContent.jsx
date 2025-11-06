import { Link } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";

export default function OrderHistoryContent() {
  const { orders } = useProducts();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Order history
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Check the status of recent orders, manage returns, and download
            invoices.
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {orders.map((order) => (
            <div key={order.orderNumber}>
              <div className="rounded-lg bg-gray-50 px-4 py-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:space-x-6">
                  <div className="mb-2 sm:mb-0">
                    <dt className="font-medium text-gray-900">Date placed</dt>
                    <dd className="text-sm text-gray-600">
                      <time dateTime={new Date(order.date).toISOString()}>
                        {new Date(order.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </dd>
                  </div>
                  <div className="mb-2 sm:mb-0">
                    <dt className="font-medium text-gray-900">Order number</dt>
                    <dd className="text-sm text-gray-600">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Total amount</dt>
                    <dd className="text-sm text-gray-600">
                      {order.OrderTotal}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 px-4 text-left">
                        Product
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        Quantity
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        Price
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        Shipping
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {order.orderItems.map((product) => (
                      <tr key={product.id}>
                        <td className="py-4 px-4 flex items-center space-x-4">
                          <img
                            src={product.imageSrc}
                            alt={product.imageAlt}
                            className="w-16 h-16 rounded-sm object-cover"
                          />
                          <span className="font-medium text-gray-900 text-left">
                            {product.name}
                          </span>
                        </td>
                        <td className="py-4 px-4 ">{product.quantity}</td>
                        <td className="py-4 px-4">{product.price}</td>
                        <td className="py-4 px-4">{order.shippingCost}</td>
                        <td className="py-4 px-4">{order.paymentStatus}</td>
                        <td className="py-4 px-4 text-right"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
