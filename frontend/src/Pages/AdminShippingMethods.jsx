import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from "../api";
import toast from "react-hot-toast";
import {
  TruckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AdminShippingMethods() {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: methodsData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-shipping-methods"],
    queryFn: async () => {
      const res = await getAllShippingMethods();
      return res.data?.data?.shippingMethods ?? [];
    },
  });
  const methods = Array.isArray(methodsData) ? methodsData : [];

  const addForm = useForm({
    defaultValues: {
      country: "",
      region: "",
      city: "",
      name: "",
      description: "",
      costKes: 0,
      sortOrder: 0,
      inStock: true,
    },
  });
  const editForm = useForm({
    defaultValues: {
      country: "",
      region: "",
      city: "",
      name: "",
      description: "",
      costKes: 0,
      sortOrder: 0,
      inStock: true,
    },
  });

  useEffect(() => {
    if (!editItem) return;
    editForm.reset({
      country: editItem.country ?? "",
      region: editItem.region ?? "",
      city: editItem.city ?? "",
      name: editItem.name ?? "",
      description: editItem.description ?? "",
      costKes: editItem.costKes ?? 0,
      sortOrder: editItem.sortOrder ?? 0,
      inStock: editItem.inStock !== false,
    });
  }, [editItem, editForm]);

  const { mutateAsync: doCreate, isPending: isCreating } = useMutation({
    mutationFn: (data) => createShippingMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      toast.success("Shipping method created.");
      setAddModalOpen(false);
      addForm.reset();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create.");
    },
  });
  const { mutateAsync: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => updateShippingMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      toast.success("Shipping method updated.");
      setEditItem(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update.");
    },
  });
  const { mutateAsync: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteShippingMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      toast.success("Shipping method deleted.");
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete.");
    },
  });

  const fields = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Country *</label>
          <input
            type="text"
            {...addForm.register("country", { required: "Required" })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {addForm.formState.errors.country && (
            <p className="mt-1 text-sm text-red-600">{addForm.formState.errors.country.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input type="text" {...addForm.register("name", { required: "Required" })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <input type="text" {...addForm.register("region")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input type="text" {...addForm.register("city")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input type="text" {...addForm.register("description")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost (KSh) *</label>
          <input type="number" min={0} step={0.01} {...addForm.register("costKes", { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sort order</label>
          <input type="number" {...addForm.register("sortOrder", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="addInStock" {...addForm.register("inStock")} className="h-4 w-4 rounded border-gray-300 text-[#082567]" />
        <label htmlFor="addInStock" className="text-sm text-gray-700">Available (in stock)</label>
      </div>
    </>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Shipping Methods</h1>
          <p className="text-white/80 mt-1">Configure delivery options by country and region.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#082567] px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-white/95"
        >
          <PlusIcon className="h-5 w-5" />
          Add shipping method
        </button>
      </div>

      <div className="rounded-xl border border-white/15 bg-[#e8ecf4] shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">{error?.message || "Failed to load."}</div>
        ) : methods.length === 0 ? (
          <div className="p-12 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-[#082567]/50" />
            <p className="mt-2 text-gray-600">No shipping methods yet.</p>
            <button type="button" onClick={() => setAddModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#082567] px-4 py-2.5 text-sm font-semibold text-white">
              <PlusIcon className="h-5 w-5" /> Add shipping method
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#082567]/15">
              <thead className="bg-[#082567]/15">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase">Region / City</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase">Cost (KSh)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#082567] uppercase">Status</th>
                  <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white/80 divide-y divide-gray-200">
                {methods.map((m) => (
                  <tr key={m._id} className="hover:bg-[#082567]/5">
                    <td className="px-4 py-3 text-sm text-gray-900">{m.country || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(m.region || m.city) ? [m.region, m.city].filter(Boolean).join(" / ") : "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{m.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.costKes != null ? Number(m.costKes).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${m.inStock !== false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {m.inStock !== false ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(m)} className="rounded-lg p-2 text-gray-600 hover:bg-[#082567]/10 hover:text-[#082567]" title="Edit"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button type="button" onClick={() => setDeleteConfirm({ id: m._id, name: m.name })} className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600" title="Delete"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#082567]">Add shipping method</h2>
              <button type="button" onClick={() => setAddModalOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addForm.handleSubmit((data) => doCreate(data))} className="space-y-4">
              {fields}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isCreating} className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create</button>
                <button type="button" onClick={() => setAddModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#082567]">Edit shipping method</h2>
              <button type="button" onClick={() => setEditItem(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <form onSubmit={editForm.handleSubmit((data) => doUpdate({ id: editItem._id, data }))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <input type="text" {...editForm.register("country", { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input type="text" {...editForm.register("name", { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="block text-sm font-medium text-gray-700">Region</label><input type="text" {...editForm.register("region")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700">City</label><input type="text" {...editForm.register("city")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700">Description</label><input type="text" {...editForm.register("description")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="block text-sm font-medium text-gray-700">Cost (KSh)</label><input type="number" min={0} {...editForm.register("costKes", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Sort order</label><input type="number" {...editForm.register("sortOrder", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editInStock" {...editForm.register("inStock")} className="h-4 w-4 rounded border-gray-300 text-[#082567]" />
                <label htmlFor="editInStock" className="text-sm text-gray-700">Available</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isUpdating} className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save</button>
                <button type="button" onClick={() => setEditItem(null)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900">Delete shipping method?</h2>
            <p className="mt-2 text-sm text-gray-600">Delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
              <button type="button" onClick={() => doDelete(deleteConfirm.id)} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
