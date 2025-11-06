import { FaArrowRight } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import Reviews from "./Reviews";
import { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useProducts } from "../contexts/ProductContext";

const defaultproduct = {
  name: "Kirkland minoxidil for men",
  price: "Ksh 2600",
  rating: 4,
  images: [
    {
      id: 1,
      name: "Angled view",
      src: "minoxidilformen.png",
      alt: "Angled front view with bag zipped and handles upright.",
    },
  ],

  colors: [
    {
      id: "washed-black",
      name: "Washed Black",
      classes: "bg-gray-700 checked:outline-gray-700",
    },
    {
      id: "white",
      name: "White",
      classes: "bg-white checked:outline-gray-400",
    },
    {
      id: "washed-gray",
      name: "Washed Gray",
      classes: "bg-gray-500 checked:outline-gray-500",
    },
  ],
  description: `
    <p>Kirkland Minoxidil 5% Foam is a fast-absorbing hair regrowth treatment for men dealing with thinning or hereditary hair loss. It reactivates dormant follicles to promote thicker, fuller hair. The foam is gentle, quick-drying, and ideal for everyday use.</p>
  `,
  details: [
    {
      name: "Features",
      items: [
        "Contains 5% Minoxidil for effective hair regrowth.",
        "Dries quickly with no greasy residue",
        "Mess-free design suitable for daily routines.",
        "Alcohol-free and safe for sensitive skin.",
        "Noticeable improvement within 3–6 months of consistent use",
        "Offers quality results at a lower cost compared to branded options.",
      ],
    },

    {
      name: "Shipping",
      items: [
        "Free shipping on orders over Ksh 5000",
        "International shipping available",
        "1–2 business days within Nairobi.",
        "2–4 days nationwide",
      ],
    },
    {
      name: "Returns",
      items: [
        "Easy return requests",
        "Eligible for return or exchange within 7 days if unopened.",
        "60 day return window",
      ],
    },
    {
      name: "Reviews",
      items: [
        "James K. –“This product really works! My hair started filling in after 2 months of consistent use.”",
        "Brian M. – “Good value for money. I’ve tried Rogaine before but Kirkland gives the same results for less.”",
        "Kelvin O. – “Fast delivery and original product. Customer service was super helpful too!”",
        "Samuel N. – “Noticed reduced shedding after 3 weeks. The foam feels light and non-greasy.”",
        "Peter M. – “Highly recommend! Genuine Kirkland minoxidil and affordable pricing.”",
      ],
    },
  ],
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview() {
  const { setCart } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || defaultproduct;

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:3000/api/v1/reviews/${product._id}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (data.reviews) {
          setReviews(data.reviews);
        } else {
          console.warn("Unexpected reviews format:", data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [product._id]);

  const images = product.images?.length
    ? product.images
    : [
        {
          id: 1,
          name: product.name,
          src: product.imageSrc || "default-image.png",
          alt: product.imageAlt || product.name,
        },
      ];

  console.log(product);

  const handleAddReview = async (reviewData) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        alert("Please log in to submit a review.");
        navigate("/login");
        return;
      }

      const res = await fetch("http://127.0.0.1:3000/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();
      console.log("Review response:", data);
      if (data && data._id) {
        setReviews((prev) => [data, ...prev]);
      } else {
        alert(data.message || "Error submitting review.");
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  if (!product) <p>Loading....</p>;
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <TabGroup className="flex flex-col-reverse">
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {images?.map((image) => (
                  <Tab
                    key={image.id}
                    className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:ring-3 focus:ring-indigo-500/50 focus:ring-offset-4 focus:outline-hidden"
                  >
                    <span className="sr-only">{image.name}</span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <img
                        alt=""
                        src={image.src}
                        className="size-full object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2 group-data-selected:ring-indigo-500"
                    />
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels>
              {images.map((image) => (
                <TabPanel key={image.id}>
                  <img
                    alt={image.alt}
                    src={image.src}
                    className="aspect-square w-full object-contain sm:rounded-lg bg-gradient-to-t from-black/20 via-[#ffff]/10 to-black/10"
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                Ksh {product.price}
              </p>
            </div>

            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      aria-hidden="true"
                      className={classNames(
                        product.rating > rating
                          ? "text-indigo-500"
                          : "text-gray-300",
                        "size-5 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{product.rating} out of 5 stars</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="space-y-6 text-base text-gray-700"
              />
            </div>

            <form className="mt-6">
              <div>
                <fieldset
                  aria-label="Choose a color"
                  className="mt-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                >
                  <a
                    href={`https://wa.me/254796866058?text=Hi! I’d like to know more about this product.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <FaWhatsapp size="32" color="green" />
                    <span className="text-blue-600">
                      Redirect to WhatsApp for more info
                    </span>
                    <FaArrowRight />
                  </a>
                </fieldset>
              </div>

              <div className="mt-10 flex">
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    setCart((prevcart) => {
                      const existingproduct = prevcart.find(
                        (item) => item.id === product.id
                      );
                      if (existingproduct) {
                        return prevcart.map((item) =>
                          item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                        );
                      } else {
                        return [...prevcart, { ...product, quantity: 1 }];
                      }
                    });
                  }}
                  className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden sm:w-full"
                >
                  Add to Cart
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/products");
                  }}
                  className="ml-4 flex items-center justify-center rounded-md px-3 py-3 text-white gap-2 bg-indigo-600"
                >
                  Continue Shopping <FaArrowRight />
                </button>
              </div>
            </form>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t border-gray-200">
                {product.details.map((detail) => (
                  <Disclosure key={detail.name} as="div">
                    <h3>
                      <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                        <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                          {detail.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      <ul
                        role="list"
                        className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
                      >
                        {detail.items.map((item) => (
                          <li key={item} className="pl-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div>
              <Reviews
                productId={product._id}
                reviews={reviews}
                onAddReview={handleAddReview}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
