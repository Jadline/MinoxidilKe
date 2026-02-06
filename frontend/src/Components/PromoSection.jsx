import { Link } from "react-router-dom";
import { StarIcon, TruckIcon, ShieldCheckIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    id: 1,
    quote: "After just 3 months, I noticed significant regrowth in my thinning areas. Best investment I've ever made for my confidence!",
    author: "Sarah Peters",
    location: "Westlands, Nairobi",
    avatar: "S",
    rating: 5,
  },
  {
    id: 2,
    quote: "The shipping was super fast, and the product quality exceeded my expectations. Will definitely be ordering again!",
    author: "Kelly McPherson",
    location: "Parklands, Nairobi",
    avatar: "K",
    rating: 5,
  },
  {
    id: 3,
    quote: "I was skeptical at first, but the results speak for themselves. My hairline is visibly fuller after 4 months of use.",
    author: "Chris Paul",
    location: "Nakuru",
    avatar: "C",
    rating: 5,
  },
];

const features = [
  {
    icon: TruckIcon,
    title: "Free Delivery",
    description: "On orders over Ksh 6,000",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: ShieldCheckIcon,
    title: "Authentic Products",
    description: "100% genuine & certified",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: SparklesIcon,
    title: "Proven Results",
    description: "94% customer satisfaction",
    color: "bg-purple-100 text-purple-600",
  },
];

export default function PromoSection() {
  return (
    <>
      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 lg:py-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4" />
                Limited Time Offer
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Start Your Hair Growth Journey Today
              </h2>
              <p className="mt-6 text-lg text-white/80 max-w-lg mx-auto lg:mx-0">
                Join thousands of satisfied customers who have transformed their hair and confidence 
                with our premium Minoxidil treatments.
              </p>
              
              {/* Features */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">{feature.title}</p>
                      <p className="text-white/70 text-xs">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Shop Now
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Get Free Consultation
                </Link>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white">10K+</p>
                <p className="mt-2 text-white/70">Happy Customers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white">94%</p>
                <p className="mt-2 text-white/70">Success Rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white">4.9</p>
                <p className="mt-2 text-white/70">Average Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white">50+</p>
                <p className="mt-2 text-white/70">Premium Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4">
              Customer Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Real results from real people. See why thousands trust us for their hair growth journey.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">Ready to start your transformation?</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              Start Shopping
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
