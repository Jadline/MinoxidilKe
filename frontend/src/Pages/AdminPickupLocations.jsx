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

export default function AdminPickupLocations() {
  const queryClient = useQueryClient();
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

  const FormFields = ({ form, prefix = "" }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          {...form.register("name", { required: "Required" })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address *
        </label>
        <input
          type="text"
          {...form.register("address", { required: "Required" })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            {...form.register("city", { required: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <input
            type="text"
            {...form.register("country", { required: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cost (KSh)
          </label>
          <input
            type="number"
            min={0}
            {...form.register("costKes", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Distance (km)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            {...form.register("distanceKm")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Readiness text
        </label>
        <input
          type="text"
          {...form.register("readinessText")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. Usually ready in 24 hours"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sort order
        </label>
        <input
          type="number"
          {...form.register("sortOrder", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${prefix}isActive`}
          {...form.register("isActive")}
          className="h-4 w-4 rounded border-gray-300 text-[#082567]"
        />
        <label htmlFor={`${prefix}isActive`} className="text-sm text-gray-700">
          Active (visible to customers)
        </label>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Manage Pickup Locations
          </h1>
          <p className="text-white/80 mt-1">
            Configure pickup points for customer orders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#082567] px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-white/95"
        >
          <PlusIcon className="h-5 w-5" />
          Add pickup location
        </button>
      </div>

      <div className="rounded-xl border border-[#191970]/30 bg-white shadow-xl overflow-hidden transition-all duration-200 hover:shadow-2xl hover:border-[#191970]/50">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.message || "Failed to load."}
          </div>
        ) : locations.length === 0 ? (
          <div className="p-12 text-center">
            <MapPinIcon className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-2 text-white">No pickup locations yet.</p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#12125c] transition-colors"
            >
              <PlusIcon className="h-5 w-5" /> Add pickup location
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#191970]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    City / Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Cost (KSh)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/15 divide-y divide-white/20">
                {locations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-[#191970]/5 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {loc.name || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate"
                      title={loc.address}
                    >
                      {loc.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {loc.city || "—"} / {loc.country || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
                        <button
                          type="button"
                          onClick={() => setEditItem(loc)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-[#082567]/10 hover:text-[#082567]"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({ id: loc._id, name: loc.name })
                          }
                          className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
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

      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#082567]">
                Add pickup location
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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
                  className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => setEditItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#082567]">
                Edit pickup location
              </h2>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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
                  className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Delete pickup location?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
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
