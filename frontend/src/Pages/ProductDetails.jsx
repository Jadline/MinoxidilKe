import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProductOverview from "../Components/ProductOverview";
import { getProduct } from "../api";

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
        setError(err?.response?.data?.message || err?.message || "Failed to load product.");
      })
      .finally(() => setLoading(false));
  }, [id, productFromState]);

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

  return <ProductOverview product={productFromUrl ?? productFromState} />;
}

export default ProductDetails;
