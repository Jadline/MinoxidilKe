import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon, ClockIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import toast from "react-hot-toast";

export default function CartContents() {
  const {
    cart,
    setCart,
    Total,
    OrderTotal,
    setShippingCost,
    selectedCity,
    setSelectedCity,
  } = useProducts();
  const [allCities, setAllCities] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    async function fetchShippingrates() {
      try {
        const res = await fetch("./data/shippingrates.json");
        const data = await res.json();
        const cities = Object.values(data).flat();
        console.log("cities", cities);
        setAllCities(cities);
      } catch (err) {
        console.log("There was an error fetching shipping rates data", err);
      }
    }
    fetchShippingrates();
  }, []);
  useEffect(() => {
    if (!selectedCity) {
      setShippingCost(0);
      return;
    }
    const citydata = allCities.find(
      (cityitem) => cityitem.city === selectedCity
    );
    if (citydata) {
      setShippingCost(citydata.rate);
    } else {
      setShippingCost(0);
    }
  }, [allCities, selectedCity, setShippingCost]);
  useEffect(() => {
    localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  function handleDelete(id) {
    setCart((prevcart) => prevcart.filter((cartitem) => cartitem.id !== id));
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Shopping Cart
        </h1>

        <form className="mt-12">
          <div>
            <h2 className="sr-only">Items in your shopping cart</h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-t border-b border-gray-200"
            >
              {cart.length > 0 ? (
                cart.map((product, productIdx) => (
                  <li key={product.id} className="flex py-6 sm:py-10">
                    <div className="shrink-0 bg-gray-100">
                      <img
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        className="size-24 rounded-lg object-cover sm:size-32 object-contain"
                      />
                    </div>

                    <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div>
                        <div className="flex justify-between sm:grid sm:grid-cols-2">
                          <div className="pr-6">
                            <h3 className="text-sm">
                              <a
                                href={product.href}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {product.name}
                              </a>
                            </h3>

                            {product.size ? (
                              <p className="mt-1 text-sm text-gray-500">
                                {product.size}
                              </p>
                            ) : null}
                          </div>

                          <p className="text-right text-sm font-medium text-gray-900">
                            {product.price * product.quantity}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center sm:absolute sm:top-0 sm:left-1/2 sm:mt-0 sm:block">
                          <div className="inline-grid w-full max-w-16 grid-cols-1">
                            <select
                              value={product.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value);
                                setCart((prevcart) =>
                                  prevcart.map((item) =>
                                    item.id === product.id
                                      ? { ...item, quantity: newQty }
                                      : item
                                  )
                                );
                              }}
                              name={`quantity-${productIdx}`}
                              aria-label={`Quantity, ${product.name}`}
                              className="col-start-1 row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                              <option value={5}>5</option>
                              <option value={6}>6</option>
                              <option value={7}>7</option>
                              <option value={8}>8</option>
                            </select>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                          </div>

                          <button
                            type="button"
                            className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:mt-3 sm:ml-0"
                          >
                            <span onClick={() => handleDelete(product.id)}>
                              Remove
                            </span>
                          </button>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {product.inStock ? (
                          <CheckIcon
                            aria-hidden="true"
                            className="size-5 shrink-0 text-green-500"
                          />
                        ) : (
                          <ClockIcon
                            aria-hidden="true"
                            className="size-5 shrink-0 text-gray-300"
                          />
                        )}

                        <span>
                          {product.inStock
                            ? "In stock"
                            : `Ships in ${product.leadTime}`}
                        </span>
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p> Add items to Cart</p>
              )}
            </ul>
          </div>

          {/* Order summary */}
          <div className="mt-10 sm:ml-32 sm:pl-6">
            <div className="rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:p-8">
              <h2 className="sr-only">Order summary</h2>

              <div className="flow-root">
                <dl className="-my-4 divide-y divide-gray-200 text-sm">
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">Ksh {Total}</dd>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-gray-600">Select your city</dt>
                    <dd>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                      >
                        <option value="">-- Select City --</option>
                        {allCities.map(({ city, rate }) => (
                          <option key={city} value={city}>
                            {city} (Ksh {rate})
                          </option>
                        ))}
                      </select>
                    </dd>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <dt className="text-base font-medium text-gray-900">
                      Order total
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      Ksh {OrderTotal}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (cart.length === 0) {
                    toast.error(
                      "Your cart is empty. Please add items before proceeding to checkout."
                    );

                    return;
                  }
                  if (!selectedCity) {
                    toast.error("Please select your city to proceed");

                    return;
                  }
                  navigate("/checkout");
                }}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
              >
                Checkout
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                or{" "}
                <Link
                  to="/products"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
