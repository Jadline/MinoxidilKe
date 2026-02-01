import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getPackages, deletePackage } from "../api";
import toast from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  return BASE_URL ? BASE_URL + (imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc) : imageSrc;
}

export default function AdminPackagesList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const res = await getPackages({ limit: 100 });
      return res.data?.data?.packages ?? [];
    },
  });

  const { mutateAsync: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast.success("Package deleted.");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to delete package.";
      toast.error(msg);
    },
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete package "${name}"? This cannot be undone.`)) return;
    await doDelete(id);
  };

  const packages = Array.isArray(data) ? data : [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Packages</h1>
          <p className="text-white/80 mt-1">
            Bundles of products that customers can buy together.
          </p>
        </div>
        <Link
          to="/admin/add-package"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#082567] px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-white/95 hover:shadow-lg transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add package
        </Link>
      </div>

      <div className="rounded-xl border border-white/15 bg-[#e8ecf4] shadow-xl overflow-hidden w-full">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading packages…</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.response?.data?.message || error?.message || "Failed to load packages."}
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="mx-auto h-12 w-12 text-[#005f69]/50" />
            <p className="mt-2 text-gray-600">No packages yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Create a package to sell products together at a bundle price.
            </p>
            <Link
              to="/admin/add-package"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#005f69] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#061d4d] transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add package
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#082567]/15">
              <thead className="bg-[#082567]/15">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase tracking-wider">
                    Package
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase tracking-wider">
                    Bundle price
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#e8ecf4]/60 divide-y divide-[#082567]/10">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-[#082567]/8 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#082567]/10">
                          {pkg.imageSrc ? (
                            <>
                              <img
                                src={packageImageSrc(pkg.imageSrc)}
                                alt={pkg.imageAlt || pkg.name}
                                className="h-10 w-10 object-cover relative z-10"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center z-0" aria-hidden>
                                <CubeIcon className="h-5 w-5 text-[#082567]/40" />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-[#082567]/40" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      <span className="inline-block">
                        <span className="block leading-tight">KSh</span>
                        <span className="block leading-tight">{Number(pkg.bundlePrice ?? 0).toLocaleString()}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Array.isArray(pkg.productIds) ? pkg.productIds.length : 0} product(s)
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/packages/${pkg.id}/edit`)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-[#082567]/15 hover:text-[#082567] transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={isDeleting}
                          className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
