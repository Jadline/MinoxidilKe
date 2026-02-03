import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  getPackages,
  getPackage,
  getPackageCategories,
  getProducts,
  deletePackage,
  createPackage,
  updatePackage,
  uploadPackageImage,
} from "../api";
import toast from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
  const origin =
    BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return origin ? origin + path : path;
}

function truncate(str, maxLen = 40) {
  if (str == null || str === "") return "—";
  const s = String(str).trim();
  return s.length <= maxLen ? s : s.slice(0, maxLen) + "…";
}

export default function AdminPackagesList() {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteConfirmPackage, setDeleteConfirmPackage] = useState(null);
  const [addSelectedProductIds, setAddSelectedProductIds] = useState([]);
  const [editSelectedProductIds, setEditSelectedProductIds] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [addImageFileName, setAddImageFileName] = useState(null);
  const [editImageFileName, setEditImageFileName] = useState(null);
  const addImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const res = await getPackages({ limit: 100 });
      return res.data?.data?.packages ?? [];
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-for-package"],
    queryFn: async () => {
      const res = await getProducts({ limit: 100 });
      const products = res.data?.data?.products ?? res.data?.products ?? [];
      return Array.isArray(products) ? products : [];
    },
  });

  const { data: editPackageData } = useQuery({
    queryKey: ["admin-package", editPackage?.id],
    queryFn: async () => {
      const res = await getPackage(editPackage.id);
      return res.data?.data?.package ?? null;
    },
    enabled: !!editPackage?.id,
  });

  const products = Array.isArray(productsData) ? productsData : [];
  const packages = Array.isArray(data) ? data : [];

  const { data: categoriesData } = useQuery({
    queryKey: ["package-categories"],
    queryFn: async () => {
      const res = await getPackageCategories();
      return res.data?.data?.categories ?? [];
    },
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const closeAddModal = () => {
    setAddModalOpen(false);
    addReset();
    setAddSelectedProductIds([]);
    setIsUploadingImage(false);
    setAddImageFileName(null);
    if (addImageInputRef.current) addImageInputRef.current.value = "";
  };

  const closeEditModal = () => {
    setEditPackage(null);
    editReset();
    setEditSelectedProductIds([]);
    setIsUploadingImage(false);
    setEditImageFileName(null);
    if (editImageInputRef.current) editImageInputRef.current.value = "";
  };

  const addForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      imageSrc: "",
      imageAlt: "",
      bundlePrice: 0,
      quantityLabel: "1 pack",
      leadTime: "",
      category: "",
      categoryCustom: "",
      inStock: true,
      featuresText: "",
    },
  });
  const {
    register: addRegister,
    handleSubmit: addHandleSubmit,
    reset: addReset,
    setValue: addSetValue,
    watch: addWatch,
    formState: { errors: addErrors },
  } = addForm;

  const editForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      imageSrc: "",
      imageAlt: "",
      bundlePrice: 0,
      quantityLabel: "1 pack",
      leadTime: "",
      category: "",
      categoryCustom: "",
      inStock: true,
      featuresText: "",
    },
  });
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    setValue: editSetValue,
    watch: editWatch,
    formState: { errors: editErrors },
  } = editForm;

  useEffect(() => {
    if (!editPackageData) return;
    const featuresDetail = (editPackageData.details || []).find(
      (d) => d.name === "Features"
    );
    const featureItems = featuresDetail?.items ?? [];
    const featuresText = featureItems.length > 0 ? featureItems[0] ?? "" : "";
    const cat = (editPackageData.category ?? "").trim();
    const categoryValue = categories.includes(cat)
      ? cat
      : cat
      ? "__other__"
      : "";
    const categoryCustom = categories.includes(cat) ? "" : cat;
    editReset({
      name: editPackageData.name ?? "",
      description: editPackageData.description ?? "",
      imageSrc: editPackageData.imageSrc ?? "",
      imageAlt: editPackageData.imageAlt ?? "",
      bundlePrice: editPackageData.bundlePrice ?? 0,
      quantityLabel: editPackageData.quantityLabel ?? "1 pack",
      leadTime: editPackageData.leadTime ?? "",
      category: categoryValue,
      categoryCustom,
      inStock: editPackageData.inStock !== false,
      featuresText,
    });
    setEditSelectedProductIds(
      Array.isArray(editPackageData.productIds)
        ? [...editPackageData.productIds]
        : []
    );
  }, [editPackageData, categories, editReset]);

  const toggleAddProductId = (id) => {
    setAddSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };
  const toggleEditProductId = (id) => {
    setEditSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const handleAddImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (jpg, png, webp, gif).");
      return;
    }
    setAddImageFileName(file.name);
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadPackageImage(formData);
      const path = res.data?.data?.path;
      if (path) {
        const fullUrl = BASE_URL
          ? BASE_URL + (path.startsWith("/") ? path : "/" + path)
          : path;
        addSetValue("imageSrc", fullUrl);
        toast.success("Image uploaded.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Upload failed.";
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
      setAddImageFileName(null);
      if (addImageInputRef.current) addImageInputRef.current.value = "";
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (jpg, png, webp, gif).");
      return;
    }
    setEditImageFileName(file.name);
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadPackageImage(formData);
      const path = res.data?.data?.path;
      if (path) {
        const fullUrl = BASE_URL
          ? BASE_URL + (path.startsWith("/") ? path : "/" + path)
          : path;
        editSetValue("imageSrc", fullUrl);
        toast.success("Image uploaded.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Upload failed.";
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
      setEditImageFileName(null);
      if (editImageInputRef.current) editImageInputRef.current.value = "";
    }
  };

  const { mutateAsync: submitAddPackage, isPending: isAddingPackage } =
    useMutation({
      mutationFn: (data) => {
        const productIds = addSelectedProductIds
          .map(Number)
          .filter((n) => n > 0);
        const featuresText = (data.featuresText ?? "").trim();
        const details = featuresText
          ? [{ name: "Features", items: [featuresText] }]
          : [];
        const category =
          data.category === "__other__"
            ? (data.categoryCustom ?? "").trim()
            : data.category ?? "";
        return createPackage({
          name: data.name,
          description: data.description ?? "",
          imageSrc: data.imageSrc ?? "",
          imageAlt: data.imageAlt ?? "",
          bundlePrice: Number(data.bundlePrice) ?? 0,
          quantityLabel: data.quantityLabel ?? "1 pack",
          leadTime: data.leadTime ?? "",
          category: category || "",
          inStock: data.inStock !== false,
          productIds,
          details,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
        toast.success("Package created.");
        closeAddModal();
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create package.";
        toast.error(msg);
      },
    });

  const { mutateAsync: submitEditPackage, isPending: isUpdatingPackage } =
    useMutation({
      mutationFn: (data) => {
        const productIds = editSelectedProductIds
          .map(Number)
          .filter((n) => n > 0);
        const featuresText = (data.featuresText ?? "").trim();
        const details = featuresText
          ? [{ name: "Features", items: [featuresText] }]
          : [];
        const category =
          data.category === "__other__"
            ? (data.categoryCustom ?? "").trim()
            : data.category ?? "";
        const {
          featuresText: _ft,
          category: _cat,
          categoryCustom: _cc,
          ...rest
        } = data;
        return updatePackage(Number(editPackage.id), {
          ...rest,
          productIds,
          details,
          category,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
        queryClient.invalidateQueries({
          queryKey: ["admin-package", editPackage?.id],
        });
        toast.success("Package updated.");
        closeEditModal();
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update package.";
        toast.error(msg);
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
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete package.";
      toast.error(msg);
    },
  });

  const handleDeleteClick = (id, name) => {
    setDeleteConfirmPackage({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPackage) return;
    try {
      await doDelete(deleteConfirmPackage.id);
      setDeleteConfirmPackage(null);
    } catch {
      // Error already shown by mutation onError
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmPackage(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Packages</h1>
          <p className="text-white/80 mt-1">
            Bundles of products that customers can buy together.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#082567] px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-white/95 hover:shadow-lg transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add package
        </button>
      </div>

      <div className="rounded-xl border border-[#191970]/30 bg-white shadow-xl overflow-hidden w-full transition-all duration-200 hover:shadow-2xl hover:border-[#191970]/50">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            Loading packages…
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load packages."}
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-2 text-white">No packages yet.</p>
            <p className="mt-1 text-sm text-white/80">
              Create a package to sell products together at a bundle price.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#12125c] transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#191970]">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Package
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Bundle price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Features
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Lead time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/15 divide-y divide-white/20">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-[#191970]/5 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#082567]/10">
                          {pkg.imageSrc ? (
                            <>
                              <img
                                src={packageImageSrc(pkg.imageSrc)}
                                alt={pkg.imageAlt || pkg.name}
                                className="h-10 w-10 object-cover relative z-10"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div
                                className="absolute inset-0 flex items-center justify-center z-0"
                                aria-hidden
                              >
                                <CubeIcon className="h-5 w-5 text-[#082567]/40" />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-[#082567]/40" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {pkg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      <span className="inline-block">
                        <span className="block leading-tight">KSh</span>
                        <span className="block leading-tight">
                          {Number(pkg.bundlePrice ?? 0).toLocaleString()}
                        </span>
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600 max-w-[180px]"
                      title={pkg.description || ""}
                    >
                      {truncate(pkg.description, 35)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(() => {
                        const featuresDetail = (pkg.details || []).find(
                          (d) => d.name === "Features"
                        );
                        const items = featuresDetail?.items ?? [];
                        const text =
                          items.length > 0 ? (items[0] ?? "").trim() : "";
                        return text ? truncate(text, 35) : "—";
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pkg.rating != null && pkg.rating !== ""
                        ? Number(pkg.rating).toFixed(1)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pkg.inStock !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pkg.inStock !== false ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pkg.leadTime || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pkg.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Array.isArray(pkg.productIds)
                        ? pkg.productIds.length
                        : 0}{" "}
                      product(s)
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditPackage(pkg)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-[#082567]/15 hover:text-[#082567] transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(pkg.id, pkg.name)}
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

      {/* Delete package confirmation modal */}
      {deleteConfirmPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-package-title"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-package-title"
              className="text-lg font-semibold text-gray-900"
            >
              Delete package?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Delete package &quot;{deleteConfirmPackage.name}&quot;? This
              cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add package modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={closeAddModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#082567]">Add package</h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={addHandleSubmit((data) => submitAddPackage(data))}
              className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Package name *
                </label>
                <input
                  type="text"
                  {...addRegister("name", { required: "Name is required" })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                />
                {addErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {addErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...addRegister("description")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bundle price (KSh) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...addRegister("bundlePrice", {
                    required: "Bundle price is required",
                    min: { value: 0, message: "Must be ≥ 0" },
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                />
                {addErrors.bundlePrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {addErrors.bundlePrice.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Products in this package *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Select the products included in this bundle.
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                  {products.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No products found. Add products first.
                    </p>
                  ) : (
                    products.map((prod) => (
                      <label
                        key={prod.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={addSelectedProductIds.includes(prod.id)}
                          onChange={() => toggleAddProductId(prod.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                        />
                        <span className="text-sm text-gray-700">
                          {prod.name} — KSh{" "}
                          {Number(prod.price ?? 0).toLocaleString()}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {addSelectedProductIds.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Select at least one product for this package.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    {...addRegister("imageSrc")}
                    placeholder="https://... or upload below"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or upload image
                    </label>
                    <input
                      ref={addImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAddImageUpload}
                      disabled={isUploadingImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#082567]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#082567]"
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      {isUploadingImage && "Uploading…"}
                      {!isUploadingImage && addImageFileName && (
                        <span className="text-[#082567]">
                          Selected: {addImageFileName}
                        </span>
                      )}
                      {!isUploadingImage &&
                        !addImageFileName &&
                        addWatch("imageSrc") && (
                          <span className="text-green-600">
                            ✓ Image URL set above — add package to keep it.
                          </span>
                        )}
                      {!isUploadingImage &&
                        !addImageFileName &&
                        !addWatch("imageSrc") && (
                          <span className="text-gray-500">No file chosen</span>
                        )}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image alt text
                  </label>
                  <input
                    type="text"
                    {...addRegister("imageAlt")}
                    placeholder="Describe the image"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features / usage information
                </label>
                <p className="text-sm text-gray-500 mt-0.5 mb-1">
                  Describe how to use the products or key information. Shown on
                  the package details page.
                </p>
                <textarea
                  rows={4}
                  {...addRegister("featuresText")}
                  placeholder="e.g. Apply minoxidil once daily. Use the shampoo 2–3 times per week."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity label
                  </label>
                  <input
                    type="text"
                    {...addRegister("quantityLabel")}
                    placeholder="e.g. 1 pack"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lead time
                  </label>
                  <input
                    type="text"
                    {...addRegister("leadTime")}
                    placeholder="e.g. 2-3 days"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  {...addRegister("category")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__other__">Add custom category</option>
                </select>
                {addWatch("category") === "__other__" && (
                  <input
                    type="text"
                    {...addRegister("categoryCustom")}
                    placeholder="Type custom category"
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addPkgInStock"
                  {...addRegister("inStock")}
                  className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                />
                <label
                  htmlFor="addPkgInStock"
                  className="text-sm text-gray-700"
                >
                  In stock
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    isAddingPackage || addSelectedProductIds.length === 0
                  }
                  className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#061d4d] disabled:opacity-50"
                >
                  {isAddingPackage ? "Creating…" : "Create package"}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit package modal */}
      {editPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#082567]">Edit package</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {!editPackageData ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Loading package…
              </div>
            ) : (
              <form
                onSubmit={editHandleSubmit((data) => submitEditPackage(data))}
                className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Package name *
                  </label>
                  <input
                    type="text"
                    {...editRegister("name", { required: "Name is required" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {editErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    {...editRegister("description")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bundle price (KSh) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...editRegister("bundlePrice", {
                      required: "Bundle price is required",
                      min: { value: 0, message: "Must be ≥ 0" },
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                  {editErrors.bundlePrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {editErrors.bundlePrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Products in this package *
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                    {products.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No products found.
                      </p>
                    ) : (
                      products.map((prod) => (
                        <label
                          key={prod.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editSelectedProductIds.includes(prod.id)}
                            onChange={() => toggleEditProductId(prod.id)}
                            className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                          />
                          <span className="text-sm text-gray-700">
                            {prod.name} — KSh{" "}
                            {Number(prod.price ?? 0).toLocaleString()}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  {editSelectedProductIds.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                      Select at least one product.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="url"
                      {...editRegister("imageSrc")}
                      placeholder="https://... or upload below"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Or upload image
                      </label>
                      <input
                        ref={editImageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleEditImageUpload}
                        disabled={isUploadingImage}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#082567]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#082567]"
                      />
                      <p className="mt-1 text-sm text-gray-600">
                        {isUploadingImage && "Uploading…"}
                        {!isUploadingImage && editImageFileName && (
                          <span className="text-[#082567]">
                            Selected: {editImageFileName}
                          </span>
                        )}
                        {!isUploadingImage &&
                          !editImageFileName &&
                          editWatch("imageSrc") && (
                            <span className="text-green-600">
                              ✓ Image URL set above — save package to keep it.
                            </span>
                          )}
                        {!isUploadingImage &&
                          !editImageFileName &&
                          !editWatch("imageSrc") && (
                            <span className="text-gray-500">
                              No file chosen
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image alt text
                    </label>
                    <input
                      type="text"
                      {...editRegister("imageAlt")}
                      placeholder="Describe the image"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Features / usage information
                  </label>
                  <p className="text-sm text-gray-500 mt-0.5 mb-1">
                    Describe how to use the products or key information. Shown
                    on the package details page.
                  </p>
                  <textarea
                    rows={4}
                    {...editRegister("featuresText")}
                    placeholder="e.g. Apply minoxidil once daily. Use the shampoo 2–3 times per week."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rating (read-only)
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      {editPackageData?.rating != null &&
                      editPackageData?.rating !== ""
                        ? Number(editPackageData.rating).toFixed(1)
                        : "—"}{" "}
                      — Updated by customer reviews
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity label
                    </label>
                    <input
                      type="text"
                      {...editRegister("quantityLabel")}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lead time
                    </label>
                    <input
                      type="text"
                      {...editRegister("leadTime")}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    {...editRegister("category")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__other__">Add custom category</option>
                  </select>
                  {editWatch("category") === "__other__" && (
                    <input
                      type="text"
                      {...editRegister("categoryCustom")}
                      placeholder="Type custom category"
                      className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editPkgInStock"
                    {...editRegister("inStock")}
                    className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                  />
                  <label
                    htmlFor="editPkgInStock"
                    className="text-sm text-gray-700"
                  >
                    In stock
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={
                      isUpdatingPackage || editSelectedProductIds.length === 0
                    }
                    className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#061d4d] disabled:opacity-50"
                  >
                    {isUpdatingPackage ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
