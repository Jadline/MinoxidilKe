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
import { useDarkModeStore } from "../stores/darkModeStore";

export default function AdminShippingMethods() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkModeStore();
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

  // Form field styles
  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;
  const inputClass = `mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
    isDarkMode 
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Manage Shipping Methods</h1>
          <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Configure delivery options by country and region.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add Shipping Method
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
        ) : methods.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <TruckIcon className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>No shipping methods yet</h3>
            <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Add shipping methods to enable delivery options for customers.</p>
            <button type="button" onClick={() => setAddModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all">
              <PlusIcon className="h-5 w-5" /> Add Shipping Method
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <thead className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Country</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Region / City</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Cost (KSh)</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Status</th>
                  <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {methods.map((m) => (
                  <tr key={m._id} className={`transition-colors ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{m.country || "—"}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{(m.region || m.city) ? [m.region, m.city].filter(Boolean).join(" / ") : "—"}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{m.name || "—"}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{m.costKes != null ? Number(m.costKes).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${m.inStock !== false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {m.inStock !== false ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(m)} className={`rounded-lg p-2 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-indigo-900/30 hover:text-indigo-400" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`} title="Edit"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button type="button" onClick={() => setDeleteConfirm({ id: m._id, name: m.name })} className={`rounded-lg p-2 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-red-900/30 hover:text-red-400" : "text-gray-500 hover:bg-red-50 hover:text-red-600"}`} title="Delete"><TrashIcon className="h-5 w-5" /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog" onClick={() => setAddModalOpen(false)}>
          <div className={`rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>Add shipping method</h2>
              <button type="button" onClick={() => setAddModalOpen(false)} className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addForm.handleSubmit((data) => doCreate(data))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Country *</label>
                  <input type="text" {...addForm.register("country", { required: "Required" })} className={inputClass} />
                  {addForm.formState.errors.country && <p className="mt-1 text-sm text-red-500">{addForm.formState.errors.country.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" {...addForm.register("name", { required: "Required" })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Region</label>
                  <input type="text" {...addForm.register("region")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" {...addForm.register("city")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input type="text" {...addForm.register("description")} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Cost (KSh) *</label>
                  <input type="number" min={0} step={0.01} {...addForm.register("costKes", { valueAsNumber: true, min: 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sort order</label>
                  <input type="number" {...addForm.register("sortOrder", { valueAsNumber: true })} className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="addInStock" {...addForm.register("inStock")} className="h-4 w-4 rounded border-gray-300 text-[#082567]" />
                <label htmlFor="addInStock" className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Available (in stock)</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isCreating} className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create</button>
                <button type="button" onClick={() => setAddModalOpen(false)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog" onClick={() => setEditItem(null)}>
          <div className={`rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>Edit shipping method</h2>
              <button type="button" onClick={() => setEditItem(null)} className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <form onSubmit={editForm.handleSubmit((data) => doUpdate({ id: editItem._id, data }))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Country *</label>
                  <input type="text" {...editForm.register("country", { required: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" {...editForm.register("name", { required: true })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Region</label>
                  <input type="text" {...editForm.register("region")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" {...editForm.register("city")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input type="text" {...editForm.register("description")} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Cost (KSh)</label>
                  <input type="number" min={0} {...editForm.register("costKes", { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sort order</label>
                  <input type="number" {...editForm.register("sortOrder", { valueAsNumber: true })} className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editInStock" {...editForm.register("inStock")} className="h-4 w-4 rounded border-gray-300 text-[#082567]" />
                <label htmlFor="editInStock" className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Available</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isUpdating} className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save</button>
                <button type="button" onClick={() => setEditItem(null)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog" onClick={() => setDeleteConfirm(null)}>
          <div className={`rounded-xl shadow-xl max-w-md w-full p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Delete shipping method?</h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700"}`}>Cancel</button>
              <button type="button" onClick={() => doDelete(deleteConfirm.id)} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
