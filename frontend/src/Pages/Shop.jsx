import { useState } from "react";
import CategoryFilters from "../Components/CategoryFilters";
import PaginationComponent from "../Components/PaginationUi";
import ProductList from "../Components/ProductList";
import PackageList from "../Components/PackageList";
import { ProductsSEO } from "../Components/SEO";
import { SparklesIcon, TruckIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const features = [
  {
    icon: TruckIcon,
    title: "Free Delivery",
    description: "On orders over Ksh 6,000",
  },
  {
    icon: ShieldCheckIcon,
    title: "Authentic Products",
    description: "100% genuine & certified",
  },
  {
    icon: SparklesIcon,
    title: "Clinically Proven",
    description: "FDA-approved solutions",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Expert Support",
    description: "Get personalized advice",
  },
];

function Shop() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      <ProductsSEO />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              Trusted by 10,000+ customers in Kenya
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transform Your Hair,
              <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transform Your Confidence
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 leading-relaxed">
              Discover clinically proven hair regrowth solutions formulated to stimulate follicles 
              and promote visible growth. Experience the difference with our premium Minoxidil treatments.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#products" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                Shop Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a 
                href="#packages" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                View Packages
              </a>
            </div>
          </div>
        </div>
        
        {/* Features Strip */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{feature.title}</p>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="scroll-mt-20">
        <PackageList />
      </section>

      {/* Products Section */}
      <section id="products" className="scroll-mt-20 bg-gray-50">
        <CategoryFilters />
        <div className="bg-white">
          <ProductList />
        </div>
        <PaginationComponent />
      </section>
    </>
  );
}

export default Shop;
