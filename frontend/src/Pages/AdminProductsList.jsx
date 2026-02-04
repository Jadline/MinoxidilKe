import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
} from "../api";
import toast from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZES = [10, 25, 50, 100];

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function productImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
  // /uploads/... are on the backend; plain filenames (e.g. minoxidilformen.png) are in frontend public/
  const origin =
    path.startsWith("/uploads/") && BASE_URL
      ? BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : BASE_URL || "";
  return origin ? origin + path : path;
}

function truncate(str, max = 40) {
  if (!str) return "—";
  const s = String(str).trim();
  return s.length <= max ? s : s.slice(0, max) + "…";
}

export default function AdminProductsList() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await getProducts({ limit: 100 });
      return res.data?.data?.products ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const products = Array.isArray(data) ? data : [];

  const DEFAULT_CATEGORIES = [
    "Hair Growth Treatments",
    "Scalp Tools",
    "Hair Supplements",
    "Natural Oils",
    "Shampoos & Cleansers",
  ];
  const existingCategories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const combined = [...new Set([...DEFAULT_CATEGORIES, ...fromProducts])];
    return combined.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const displayedProducts = products.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openAddModal, location.pathname, navigate]);

  const { mutateAsync: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted.");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete product.";
      toast.error(msg);
    },
  });

  const addProductForm = useForm({
    defaultValues: {
      name: "",
      price: 0,
      category: "",
      description: "",
      leadTime: "",
      quantityLabel: "1 bottle",
      inStock: true,
      imageSrc: "",
      imageAlt: "",
    },
  });
  const {
    register: addRegister,
    handleSubmit: addHandleSubmit,
    formState: { errors: addErrors },
    reset: addReset,
    setValue: addSetValue,
    watch: addWatch,
  } = addProductForm;
  const addFormImageSrc = addWatch("imageSrc");
  const addFormCategory = addWatch("category");
  const isNewCategory =
    addFormCategory === "" || !existingCategories.includes(addFormCategory);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { mutateAsync: submitAddProduct, isPending: isAddingProduct } =
    useMutation({
      mutationFn: (data) => createProduct(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        setAddModalOpen(false);
        addReset();
        setUploadingImage(false);
        toast.success("Product created successfully.");
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create product.";
        toast.error(msg);
      },
    });

  const editProductForm = useForm({
    defaultValues: {
      name: "",
      price: 0,
      category: "",
      description: "",
      leadTime: "",
      quantityLabel: "1 bottle",
      inStock: true,
      imageSrc: "",
      imageAlt: "",
    },
  });
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors },
    reset: editReset,
    setValue: editSetValue,
    watch: editWatch,
  } = editProductForm;
  const editFormImageSrc = editWatch("imageSrc");
  const editFormCategory = editWatch("category");
  const isEditNewCategory =
    editFormCategory === "" || !existingCategories.includes(editFormCategory);

  useEffect(() => {
    if (!editProduct) return;
    editReset({
      name: editProduct.name ?? "",
      price: editProduct.price ?? 0,
      category: editProduct.category ?? "",
      description: editProduct.description ?? "",
      leadTime: editProduct.leadTime ?? "",
      quantityLabel: editProduct.quantityLabel ?? "1 bottle",
      inStock: editProduct.inStock !== false,
      imageSrc: editProduct.imageSrc ?? "",
      imageAlt: editProduct.imageAlt ?? "",
    });
  }, [editProduct, editReset]);

  const { mutateAsync: submitEditProduct, isPending: isUpdatingProduct } =
    useMutation({
      mutationFn: ({ id, ...data }) => updateProduct(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        setEditProduct(null);
        editReset();
        setUploadingImage(false);
        toast.success("Product updated.");
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update product.";
        toast.error(msg);
      },
    });

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await doDelete(productToDelete.id);
      setProductToDelete(null);
    } catch (_) {}
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Products</h1>
          <p className="text-white/80 mt-1">
            View, edit, or remove products from your shop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#082567] px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-white/95 hover:shadow-lg transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add product
        </button>
      </div>

      <div className="rounded-xl border border-[#191970]/30 bg-white shadow-xl overflow-hidden w-full transition-all duration-200 hover:shadow-2xl hover:border-[#191970]/50">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            Loading products…
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load products."}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-2 text-white">No products yet.</p>
            <p className="mt-1 text-sm text-white/80">
              Add your first product to get started.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#12125c] transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add product
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
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    Price
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
                    Qty label
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
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/15 divide-y divide-white/20">
                {products.map((p) => {
                  const rawImage =
                    p.imageSrc ?? p.images?.[0]?.src ?? p.images?.[0]?.url;
                  const imageUrl = rawImage ? productImageSrc(rawImage) : "";
                  return (
                    <tr
                      key={p.id ?? p._id}
                      className="hover:bg-[#191970]/5 transition-colors duration-150 cursor-default"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {p.id ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#082567]/10">
                            {imageUrl ? (
                              <>
                                <img
                                  src={imageUrl}
                                  alt={p.imageAlt || p.name}
                                  className="h-10 w-10 object-cover relative z-10 bg-white"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <div
                                  className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
                                  aria-hidden
                                >
                                  <CubeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <CubeIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        <span className="inline-block">
                          <span className="block leading-tight">KSh</span>
                          <span className="block leading-tight">
                            {Number(p.price ?? 0).toLocaleString()}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.category || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.quantityLabel || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.leadTime || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600 max-w-[200px]"
                        title={p.description || ""}
                      >
                        {truncate(p.description, 50)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600 max-w-[180px]"
                        title={(() => {
                          const featuresDetail = (p.details || []).find(
                            (d) => d.name === "Features"
                          );
                          const items = featuresDetail?.items || [];
                          return items.join("\n") || "—";
                        })()}
                      >
                        {(() => {
                          const featuresDetail = (p.details || []).find(
                            (d) => d.name === "Features"
                          );
                          const items = featuresDetail?.items || [];
                          return items.length
                            ? truncate(items.join(", "), 40)
                            : "—";
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.rating != null && p.rating !== ""
                          ? Number(p.rating).toFixed(1)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.inStock !== false
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.inStock !== false ? "In stock" : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditProduct(p)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-[#191970]/10 hover:text-[#191970] transition-colors"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setProductToDelete({ id: p.id, name: p.name })
                            }
                            disabled={isDeleting}
                            className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span>–
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{total}</span> products
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Per page
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-[#191970] focus:outline-none focus:ring-1 focus:ring-[#191970]"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => {
            setAddModalOpen(false);
            addReset();
            setUploadingImage(false);
            setEditProduct(null);
            editReset();
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#082567]">Add product</h2>
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  addReset();
                  setUploadingImage(false);
                  setEditProduct(null);
                  editReset();
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={addHandleSubmit((data) => submitAddProduct(data))}
              className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product name *
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...addRegister("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Must be ≥ 0" },
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                  {addErrors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {addErrors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={
                      existingCategories.includes(addFormCategory)
                        ? addFormCategory
                        : "__new__"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__new__") addSetValue("category", "");
                      else addSetValue("category", v);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  >
                    {existingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">Add new category…</option>
                  </select>
                  {isNewCategory && (
                    <input
                      type="text"
                      {...addRegister("category")}
                      placeholder="Type new category name"
                      className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  )}
                </div>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity label
                  </label>
                  <input
                    type="text"
                    {...addRegister("quantityLabel")}
                    placeholder="e.g. 1 bottle"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product image
                  </label>
                  <div className="mt-1 flex items-start gap-3">
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#082567]/30 bg-[#082567]/5 px-3 py-2 text-sm font-medium text-[#082567] hover:bg-[#082567]/10">
                      <PlusIcon className="h-4 w-4" />
                      {uploadingImage ? "Uploading…" : "Choose image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const formData = new FormData();
                            formData.append("image", file);
                            const res = await uploadProductImage(formData);
                            const path = res.data?.data?.path;
                            if (path) addSetValue("imageSrc", path);
                            else toast.error("Upload failed.");
                          } catch (err) {
                            toast.error(
                              err?.response?.data?.message ||
                                err?.message ||
                                "Upload failed."
                            );
                          } finally {
                            setUploadingImage(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {addFormImageSrc && (
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={productImageSrc(addFormImageSrc)}
                          alt="Preview"
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="text-xs text-gray-500 truncate">
                          {addFormImageSrc}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WebP or GIF, max 5MB
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image alt text
                  </label>
                  <input
                    type="text"
                    {...addRegister("imageAlt")}
                    placeholder="Describe the image for accessibility"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addProductInStock"
                  {...addRegister("inStock")}
                  className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                />
                <label
                  htmlFor="addProductInStock"
                  className="text-sm text-gray-700"
                >
                  In stock
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#061d4d] disabled:opacity-50"
                >
                  {isAddingProduct ? "Creating…" : "Create product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    addReset();
                    setUploadingImage(false);
                    setEditProduct(null);
                    editReset();
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => {
            setEditProduct(null);
            editReset();
            setUploadingImage(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#082567]">Edit product</h2>
              <button
                type="button"
                onClick={() => {
                  setEditProduct(null);
                  editReset();
                  setUploadingImage(false);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={editHandleSubmit((data) =>
                submitEditProduct({ id: editProduct.id, ...data })
              )}
              className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product name *
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...editRegister("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Must be ≥ 0" },
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                  {editErrors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {editErrors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={
                      existingCategories.includes(editFormCategory)
                        ? editFormCategory
                        : "__new__"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__new__") editSetValue("category", "");
                      else editSetValue("category", v);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  >
                    {existingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">Add new category…</option>
                  </select>
                  {isEditNewCategory && (
                    <input
                      type="text"
                      {...editRegister("category")}
                      placeholder="Type new category name"
                      className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                    />
                  )}
                </div>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lead time
                  </label>
                  <input
                    type="text"
                    {...editRegister("leadTime")}
                    placeholder="e.g. 2-3 days"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity label
                  </label>
                  <input
                    type="text"
                    {...editRegister("quantityLabel")}
                    placeholder="e.g. 1 bottle"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product image
                  </label>
                  <div className="mt-1 flex items-start gap-3">
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#082567]/30 bg-[#082567]/5 px-3 py-2 text-sm font-medium text-[#082567] hover:bg-[#082567]/10">
                      <PlusIcon className="h-4 w-4" />
                      {uploadingImage ? "Uploading…" : "Change image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const formData = new FormData();
                            formData.append("image", file);
                            const res = await uploadProductImage(formData);
                            const path = res.data?.data?.path;
                            if (path) editSetValue("imageSrc", path);
                            else toast.error("Upload failed.");
                          } catch (err) {
                            toast.error(
                              err?.response?.data?.message ||
                                err?.message ||
                                "Upload failed."
                            );
                          } finally {
                            setUploadingImage(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {editFormImageSrc && (
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={productImageSrc(editFormImageSrc)}
                          alt="Preview"
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="text-xs text-gray-500 truncate">
                          {editFormImageSrc}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WebP or GIF, max 5MB
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image alt text
                  </label>
                  <input
                    type="text"
                    {...editRegister("imageAlt")}
                    placeholder="Describe the image for accessibility"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#082567] focus:ring-1 focus:ring-[#082567]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editProductInStock"
                  {...editRegister("inStock")}
                  className="h-4 w-4 rounded border-gray-300 text-[#082567] focus:ring-[#082567]"
                />
                <label
                  htmlFor="editProductInStock"
                  className="text-sm text-gray-700"
                >
                  In stock
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className="rounded-lg bg-[#082567] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#061d4d] disabled:opacity-50"
                >
                  {isUpdatingProduct ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditProduct(null);
                    editReset();
                    setUploadingImage(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete product?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete &quot;{productToDelete.name}
                  &quot;? This cannot be undone.
                </p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setProductToDelete(null)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
