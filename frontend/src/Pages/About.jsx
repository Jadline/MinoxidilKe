import { Link } from "react-router-dom";
import {
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

function About() {
  const features = [
    {
      icon: CheckBadgeIcon,
      title: "Authentic Products",
      description:
        "We source only genuine, FDA-approved hair growth solutions directly from authorized distributors.",
    },
    {
      icon: TruckIcon,
      title: "Fast Delivery",
      description:
        "Free delivery on orders over Ksh 6,000. We deliver across Kenya within 2-5 business days.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Guaranteed",
      description:
        "All our products come with authenticity guarantees and proper storage to ensure effectiveness.",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Expert Support",
      description:
        "Our team is always ready to help you choose the right products and answer your questions.",
    },
  ];

  const stats = [
    { value: "5000+", label: "Happy Customers" },
    { value: "100%", label: "Authentic Products" },
    { value: "24/7", label: "Customer Support" },
    { value: "2-5 Days", label: "Delivery Time" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MinoxidilKe
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
              Your trusted source for premium hair growth solutions in East Africa. 
              We're dedicated to helping you achieve the healthy, fuller hair you deserve.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-gray-50"></div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
                <SparklesIcon className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Empowering Confidence Through Hair Health
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                At MinoxidilKe, we understand that hair loss can significantly impact your 
                confidence and self-esteem. That's why we've made it our mission to provide 
                East Africans with access to the same high-quality hair growth treatments 
                used worldwide.
              </p>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                We believe everyone deserves to feel confident in their appearance. Our 
                carefully curated selection of products, combined with expert guidance, 
                ensures you get the results you're looking for.
              </p>
              <div className="mt-8">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  <HeartIcon className="h-5 w-5" />
                  Explore Our Products
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <SparklesIcon className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-gray-900">
                    Trusted Since 2023
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Serving customers across Kenya
                  </p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckBadgeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Verified Seller</p>
                    <p className="text-sm text-gray-500">100% Authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose MinoxidilKe?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best hair growth solutions with 
              exceptional service every step of the way.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 px-8 py-16 text-center shadow-2xl sm:px-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Start Your Hair Growth Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Browse our collection of clinically-proven hair growth solutions 
              and take the first step towards healthier, fuller hair.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-900 shadow-lg hover:bg-gray-100 transition-all duration-200"
              >
                Shop Now
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
