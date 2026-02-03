import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProductOverview from "../Components/ProductOverview";
import { getProduct } from "../api";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function productImageUrl(imageSrc) {
  if (!imageSrc) return "";
  const s = String(imageSrc).trim();
  if (s.startsWith("http")) return s;
  const path = s.startsWith("/") ? s : "/" + s;
  const origin =
    BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return origin ? origin + path : path;
}

function setMeta(name, content, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const productFromState = location.state?.product;

  const [productFromUrl, setProductFromUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || productFromState) {
      setProductFromUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    getProduct(id)
      .then((res) => {
        const p = res.data?.data?.product ?? res.data?.product;
        if (p) setProductFromUrl(p);
        else setError("Product not found.");
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load product."
        );
      })
      .finally(() => setLoading(false));
  }, [id, productFromState]);

  const product = productFromUrl ?? productFromState;

  useEffect(() => {
    if (!product || typeof document === "undefined") return;
    const img =
      product.images?.[0]?.src ?? product.images?.[0]?.url ?? product.imageSrc;
    const imageUrl = productImageUrl(img);
    const title = product.name || "Product";
    const desc =
      typeof product.description === "string"
        ? product.description
            .replace(/<[^>]+>/g, "")
            .trim()
            .slice(0, 160)
        : "";
    const origin =
      BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${origin}/product-details/${product._id ?? product.id}`;

    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", url, true);
    setMeta("og:image", imageUrl, true);
    setMeta("og:type", "website", true);
  }, [product]);

  if (id && !productFromState && loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
        Loading product…
      </div>
    );
  }
  if (id && !productFromState && error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return <ProductOverview product={product} />;
}

export default ProductDetails;
