import { Link } from "react-router-dom"

const collections = [
  {
    uppertext : 'Visible Growth',
    name: "in weeks",
  
    imageSrc: 'image-tile-01.jpeg',
    imageAlt: 'Woman wearing an off-white cotton t-shirt.',
  },
  {
    uppertext : 'Real growth',
    name: "Real results",
  
    imageSrc: 'image-tile-02.jpg',
    imageAlt: 'Man wearing a charcoal gray cotton t-shirt.',
  },
  {
    uppertext : 'Where confidence',
    name: 'begins',
   
    imageSrc: 'image-tile-03.jpg',
    imageAlt: 'Person sitting at a wooden desk with paper note organizer, pencil and tablet.',
  },
]
export default function HeroSection() {
  return (
    <div className="relative bg-white">
      {/* Desktop background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden sm:flex sm:flex-col min-h-[700px]"
      >
        <div className="relative w-full flex-1 bg-gray-800">
          <div className="absolute inset-0 overflow-hidden">
            <img
              alt="Minoxidil background"
              src="background-image-minoxidil.jpeg"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gray-900 opacity-50" />
        </div>
        <div className="h-32 w-full bg-white md:h-40 lg:h-48" />
      </div>

      {/* Hero text */}
      <div className="relative mx-auto max-w-3xl px-4 pb-96 text-center sm:px-6 sm:pb-0 lg:px-8">
        {/* Mobile background image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col sm:hidden"
        >
          <div className="relative w-full flex-1 bg-gray-800">
            <div className="absolute inset-0 overflow-hidden">
              <img
                alt="Minoxidil hero"
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-hero-full-width.jpg"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gray-900 opacity-50" />
          </div>
          <div className="h-48 w-full bg-white" />
        </div>

        <div className="relative py-32">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:whitespace-nowrap whitespace-normal">
            Pure Growth Pure Confidence
          </h1>
          <div className="mt-4 sm:mt-6">
            <Link
              to="/products"
              className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Collection tiles */}
      <section
        aria-labelledby="collection-heading"
        className="relative -mt-64 sm:mt-0"
      >
        <h2 id="collection-heading" className="sr-only">
          Collections
        </h2>
        <div className="mx-auto grid max-w-md grid-cols-1 gap-y-6 px-4 sm:max-w-7xl sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0 sm:px-6 lg:gap-x-8 lg:px-8">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className="group relative h-96 sm:h-96 rounded-lg bg-white shadow-xl"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 group-hover:opacity-75 transition-opacity duration-300">
                  <img
                    alt={collection.imageAlt}
                    src={collection.imageSrc}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
              </div>
              <div className="absolute inset-0 flex items-end rounded-lg p-6">
                <div>
                  <p aria-hidden="true" className="text-sm text-white">
                    {collection.uppertext}
                  </p>
                  <h3 className="mt-1 font-semibold text-white">
                    <span className="absolute inset-0" />
                    <span>{collection.name}</span>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
