import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const categories = [
  {
    name: "Rogaine for Men",
    description: "FDA-approved formula",
    href: "/products",
    imageSrc: "rogaine.png",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Minoxidil for Men",
    description: "Professional strength",
    href: "/products",
    imageSrc: "minoxidilformen.png",
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Minoxidil for Women",
    description: "Gentle & effective",
    href: "/products",
    imageSrc: "minoxidilforwomen.png",
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Rosemary Oil",
    description: "Natural growth booster",
    href: "/products",
    imageSrc: "rosemary.png",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "DHT Blockers",
    description: "Hair loss prevention",
    href: "/products",
    imageSrc: "dhtblockerscomplex.png",
    color: "from-amber-500 to-orange-600",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
              Top Sellers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Our Featured Products
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl">
              Clinically proven solutions trusted by thousands for visible hair regrowth results.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group"
          >
            View all products
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category, idx) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Image Container */}
                <div className="relative aspect-square p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                  <img
                    alt={category.name}
                    src={category.imageSrc}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="p-4 text-center border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Browse All Products
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
