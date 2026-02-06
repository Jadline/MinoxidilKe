import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  getAllPickupLocations,
  createPickupLocation,
  updatePickupLocation,
  deletePickupLocation,
} from "../api";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDarkModeStore } from "../stores/darkModeStore";

export default function AdminPickupLocations() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkModeStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const {
    data: locationsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-pickup-locations"],
    queryFn: async () => {
      const res = await getAllPickupLocations();
      return res.data?.data?.pickupLocations ?? [];
    },
  });
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const defaultValues = {
    name: "",
    address: "",
    city: "",
    country: "",
    distanceKm: "",
    readinessText: "Usually ready in 24 hours",
    costKes: 0,
    sortOrder: 0,
    isActive: true,
  };
  const addForm = useForm({ defaultValues: { ...defaultValues } });
  const editForm = useForm({ defaultValues: { ...defaultValues } });

  useEffect(() => {
    if (!editItem) return;
    editForm.reset({
      name: editItem.name ?? "",
      address: editItem.address ?? "",
      city: editItem.city ?? "",
      country: editItem.country ?? "",
      distanceKm: editItem.distanceKm ?? "",
      readinessText: editItem.readinessText ?? "Usually ready in 24 hours",
      costKes: editItem.costKes ?? 0,
      sortOrder: editItem.sortOrder ?? 0,
      isActive: editItem.isActive !== false,
    });
  }, [editItem, editForm]);

  const { mutateAsync: doCreate, isPending: isCreating } = useMutation({
    mutationFn: (data) =>
      createPickupLocation({
        ...data,
        distanceKm:
          data.distanceKm === "" ? undefined : Number(data.distanceKm),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pickup-locations"] });
      toast.success("Pickup location created.");
      setAddModalOpen(false);
      addForm.reset();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create."
      );
    },
  });
  const { mutateAsync: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) =>
      updatePickupLocation(id, {
        ...data,
        distanceKm:
          data.distanceKm === "" ? undefined : Number(data.distanceKm),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pickup-locations"] });
      toast.success("Pickup location updated.");
      setEditItem(null);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update."
      );
    },
  });
  const { mutateAsync: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deletePickupLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pickup-locations"] });
      toast.success("Pickup location deleted.");
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete."
      );
    },
  });

  // Shared classes for form styling
  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;
  const inputClass = `mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
    isDarkMode 
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const FormFields = ({ form, prefix = "" }) => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          {...form.register("name", { required: "Required" })}
          className={inputClass}
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>Address *</label>
        <input
          type="text"
          {...form.register("address", { required: "Required" })}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>City *</label>
          <input
            type="text"
            {...form.register("city", { required: true })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input
            type="text"
            {...form.register("country", { required: true })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Cost (KSh)</label>
          <input
            type="number"
            min={0}
            {...form.register("costKes", { valueAsNumber: true })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Distance (km)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            {...form.register("distanceKm")}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Readiness text</label>
        <input
          type="text"
          {...form.register("readinessText")}
          className={inputClass}
          placeholder="e.g. Usually ready in 24 hours"
        />
      </div>
      <div>
        <label className={labelClass}>Sort order</label>
        <input
          type="number"
          {...form.register("sortOrder", { valueAsNumber: true })}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${prefix}isActive`}
          {...form.register("isActive")}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <label htmlFor={`${prefix}isActive`} className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Active (visible to customers)
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Manage Pickup Locations</h1>
          <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Configure pickup points for customer orders.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add Pickup Location
        </button>
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Loading…</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">{error?.message || "Failed to load."}</div>
        ) : locations.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <MapPinIcon className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>No pickup locations yet</h3>
            <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Add pickup locations for customers to collect their orders.</p>
            <button type="button" onClick={() => setAddModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all">
              <PlusIcon className="h-5 w-5" /> Add Pickup Location
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <thead className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Address</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>City / Country</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Cost (KSh)</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Status</th>
                  <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {locations.map((loc) => (
                  <tr key={loc._id} className={`transition-colors ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {loc.name || "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm max-w-[200px] truncate ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                      title={loc.address}
                    >
                      {loc.address || "—"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {loc.city || "—"} / {loc.country || "—"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {loc.costKes != null
                        ? Number(loc.costKes).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          loc.isActive !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {loc.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(loc)} className={`rounded-lg p-2 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-indigo-900/30 hover:text-indigo-400" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`} title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm({ id: loc._id, name: loc.name })} className={`rounded-lg p-2 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-red-900/30 hover:text-red-400" : "text-gray-500 hover:bg-red-50 hover:text-red-600"}`} title="Delete">
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

      {/* Add Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className={`rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>
                Add pickup location
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={addForm.handleSubmit((data) => doCreate(data))}
              className="space-y-4"
            >
              <FormFields form={addForm} prefix="add" />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={() => setEditItem(null)}
        >
          <div
            className={`rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>
                Edit pickup location
              </h2>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                doUpdate({ id: editItem._id, data })
              )}
              className="space-y-4"
            >
              <FormFields form={editForm} prefix="edit" />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className={`rounded-xl shadow-xl max-w-md w-full p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Delete pickup location?
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => doDelete(deleteConfirm.id)}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
