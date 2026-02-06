import { useForm } from "react-hook-form";
import { sendEmail } from "../Services/sendEmail";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const contactMethods = [
  {
    icon: PhoneIcon,
    title: "Call Us",
    description: "Mon-Sat from 8am to 6pm",
    value: "+254 726 787 330",
    href: "tel:+254726787330",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: EnvelopeIcon,
    title: "Email Us",
    description: "We'll respond within 24 hours",
    value: "hairsolutionkenya@gmail.com",
    href: "mailto:hairsolutionkenya@gmail.com",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "WhatsApp",
    description: "Quick responses on chat",
    value: "Chat with us",
    href: "https://wa.me/254726787330",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: MapPinIcon,
    title: "Visit Us",
    description: "Come say hello",
    value: "Beaver House Basement Shop B1C, Tom Mboya Street",
    href: "https://maps.google.com/?q=Beaver+House+Tom+Mboya+Street+Nairobi+Kenya",
    color: "bg-purple-50 text-purple-600",
  },
];

const benefits = [
  "Expert hair care advice",
  "Genuine products guaranteed",
  "Fast shipping across Kenya",
  "24/7 WhatsApp support",
];

export default function ContactInfo() {
  const { mutate: mutateFormdata, isPending } = useMutation({
    mutationFn: (data) => sendEmail(data),
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    },
    onError: (error) => {
      console.error("Error submitting contact form data", error?.message);
      toast.error("Failed to send message. Please try again.");
    },
  });

  const { register, formState, reset, handleSubmit } = useForm();
  const { errors } = formState;

  function onhandleContactinfo(data) {
    mutateFormdata(data);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#191970] via-[#1e3a8a] to-[#0ea5e9] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed">
              Have questions about our hair growth products? We're here to help
              you on your journey to healthier, fuller hair. Reach out anytime!
            </p>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 50L48 45.7C96 41.3 192 32.7 288 35.8C384 39 480 54 576 57.2C672 60.3 768 51.7 864 48.5C960 45.3 1056 47.7 1152 51.8C1248 56 1344 62 1392 65L1440 68V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* Contact Methods Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((method) => (
            <a
              key={method.title}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${method.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                <method.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">{method.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              <p className="text-sm font-medium text-indigo-600 mt-2 group-hover:text-indigo-700">
                {method.value}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Send us a message
              </h2>
              <p className="mt-2 text-gray-600">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <form
                onSubmit={handleSubmit(onhandleContactinfo)}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      autoComplete="given-name"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      className={`block w-full rounded-lg border ${
                        errors.firstName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      autoComplete="family-name"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className={`block w-full rounded-lg border ${
                        errors.lastName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email",
                        },
                      })}
                      className={`block w-full rounded-lg border ${
                        errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      {...register("phoneNumber", {
                        required: "Phone number is required",
                      })}
                      className={`block w-full rounded-lg border ${
                        errors.phoneNumber
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors`}
                      placeholder="+254 7XX XXX XXX"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product you're interested in
                  </label>
                  <input
                    id="product"
                    type="text"
                    {...register("product", {
                      required: "Please tell us which product you're interested in",
                    })}
                    className={`block w-full rounded-lg border ${
                      errors.product
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors`}
                    placeholder="e.g., Kirkland Minoxidil, Derma Roller"
                  />
                  {errors.product && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.product.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message", {
                      required: "Please enter your message",
                    })}
                    className={`block w-full rounded-lg border ${
                      errors.message
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-opacity-20 transition-colors resize-none`}
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full rounded-lg px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 ${
                    isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  By submitting, you agree to our{" "}
                  <Link
                    to="/terms"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="lg:pl-8">
            {/* Why Choose Us */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Why Choose MinoxidilKe?
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ClockIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-gray-500">Closed</span>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed">
                "I was skeptical at first, but after 3 months of using the
                Kirkland Minoxidil from MinoxidilKe, I'm seeing amazing results!
                The customer service was fantastic and delivery was super fast."
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                  alt="Customer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">James K.</div>
                  <div className="text-sm text-gray-500">Nairobi, Kenya</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
