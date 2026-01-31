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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
          <p className="text-gray-600 mt-1">
            Bundles of products that customers can buy together.
          </p>
        </div>
        <Link
          to="/admin/add-package"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add package
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading packages…</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.response?.data?.message || error?.message || "Failed to load packages."}
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No packages yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Create a package to sell products together at a bundle price.
            </p>
            <Link
              to="/admin/add-package"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="h-5 w-5" />
              Add package
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Package
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bundle price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {pkg.imageSrc ? (
                          <img
                            src={pkg.imageSrc}
                            alt={pkg.imageAlt || pkg.name}
                            className="h-10 w-10 rounded object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <CubeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      KSh {Number(pkg.bundlePrice ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Array.isArray(pkg.productIds) ? pkg.productIds.length : 0} product(s)
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/packages/${pkg.id}/edit`)}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={isDeleting}
                          className="rounded p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
