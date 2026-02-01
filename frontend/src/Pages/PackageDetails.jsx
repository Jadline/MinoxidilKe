import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PackageOverview from "../Components/PackageOverview";
import { getPackage } from "../api";

function PackageDetails() {
  const { id } = useParams();
  const location = useLocation();
  const packageFromState = location.state?.package;

  const [packageFromUrl, setPackageFromUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || packageFromState) {
      setPackageFromUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    getPackage(id)
      .then((res) => {
        const p = res.data?.data?.package ?? res.data?.package;
        if (p) setPackageFromUrl(p);
        else setError("Package not found.");
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || "Failed to load package.");
      })
      .finally(() => setLoading(false));
  }, [id, packageFromState]);

  if (id && !packageFromState && loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
        Loading package…
      </div>
    );
  }
  if (id && !packageFromState && error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return <PackageOverview package={packageFromUrl ?? packageFromState} />;
}

export default PackageDetails;
