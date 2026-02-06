import { useEffect } from "react";

/**
 * SEO Component - Sets page title and meta tags
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} keywords - Meta keywords (comma-separated)
 * @param {string} image - OG image URL
 * @param {string} url - Canonical URL
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}) {
  const siteName = "MinoxidilKe";
  const defaultDescription =
    "Your trusted source for Minoxidil and hair growth solutions in Kenya and East Africa. Shop genuine products with fast delivery.";
  const defaultKeywords =
    "minoxidil, hair growth, hair loss treatment, Kenya, East Africa, Kirkland, beard growth";
  const defaultImage = "/og-image.png";

  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageImage = image || defaultImage;
  const pageUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    // Set document title
    document.title = pageTitle;

    // Helper to set or create meta tag
    const setMetaTag = (name, content, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Standard meta tags
    setMetaTag("description", pageDescription);
    setMetaTag("keywords", pageKeywords);

    // Open Graph tags
    setMetaTag("og:title", pageTitle, true);
    setMetaTag("og:description", pageDescription, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:url", pageUrl, true);
    setMetaTag("og:image", pageImage, true);
    setMetaTag("og:site_name", siteName, true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", pageTitle);
    setMetaTag("twitter:description", pageDescription);
    setMetaTag("twitter:image", pageImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    return () => {
      // Reset to defaults on unmount (optional)
    };
  }, [pageTitle, pageDescription, pageKeywords, pageImage, pageUrl, type]);

  return null;
}

// Pre-configured SEO for common pages
export function HomeSEO() {
  return (
    <SEO
      title="Hair Growth Solutions"
      description="Shop genuine Minoxidil and hair growth products in Kenya. Fast delivery across East Africa. Trusted by thousands of customers."
      keywords="minoxidil kenya, hair growth products, kirkland minoxidil, beard growth, hair loss treatment nairobi"
    />
  );
}

export function ProductsSEO() {
  return (
    <SEO
      title="Shop Products"
      description="Browse our collection of hair growth products including Minoxidil, derma rollers, and beard growth solutions. All products are genuine with fast delivery."
      keywords="buy minoxidil kenya, hair growth products, minoxidil price kenya, derma roller"
    />
  );
}

export function ProductDetailSEO({ product }) {
  if (!product) return null;
  return (
    <SEO
      title={product.name}
      description={product.description || `Buy ${product.name} in Kenya. Genuine product with fast delivery.`}
      keywords={`${product.name}, buy ${product.name} kenya, ${product.category || "hair growth"}`}
      image={product.imageSrc}
      type="product"
    />
  );
}

export function CartSEO() {
  return (
    <SEO
      title="Shopping Cart"
      description="Review your cart and checkout securely. Fast delivery across Kenya and East Africa."
    />
  );
}

export function ContactSEO() {
  return (
    <SEO
      title="Contact Us"
      description="Get in touch with MinoxidilKe. We're here to help with your hair growth journey. WhatsApp, email, or visit our store."
      keywords="contact minoxidilke, hair growth support, customer service kenya"
    />
  );
}
