import { useState, useEffect } from "react";
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
import { useDarkModeStore } from "../stores/darkModeStore";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

function packageImageSrc(imageSrc) {
  if (!imageSrc) return "";
  if (String(imageSrc).startsWith("http")) return imageSrc;
  const path = imageSrc.startsWith("/") ? imageSrc : "/" + imageSrc;
  const origin =
    path.startsWith("/uploads/") && BASE_URL
      ? BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : BASE_URL || "";
  return origin ? origin + path : path;
}

function truncate(str, maxLen = 40) {
  if (str == null || str === "") return "—";
  const s = String(str).trim();
  return s.length <= maxLen ? s : s.slice(0, maxLen) + "…";
}

export default function AdminPackagesList() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkModeStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteConfirmPackage, setDeleteConfirmPackage] = useState(null);
  const [addSelectedProductIds, setAddSelectedProductIds] = useState([]);
  const [editSelectedProductIds, setEditSelectedProductIds] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  };

  const closeEditModal = () => {
    setEditPackage(null);
    editReset();
    setEditSelectedProductIds([]);
    setIsUploadingImage(false);
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
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadPackageImage(formData);
      const path = res.data?.data?.path;
      if (path) {
        // Cloudinary returns full URL (https://...), disk storage returns /uploads/...
        const imageSrc = path.startsWith("http") ? path : (path.startsWith("/") ? path : "/" + path);
        addSetValue("imageSrc", imageSrc);
        toast.success("Image uploaded.");
      } else {
        toast.error("Upload failed.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload failed."
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (jpg, png, webp, gif).");
      return;
    }
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      // #region agent log
      console.log("[DEBUG] handleEditImageUpload: Starting upload", { fileName: file.name, fileSize: file.size });
      fetch('http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPackagesList.jsx:handleEditImageUpload:before-upload',message:'Starting package image upload',data:{fileName:file.name,fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const res = await uploadPackageImage(formData);
      // #region agent log
      console.log("[DEBUG] handleEditImageUpload: API response", { responseData: res.data, path: res.data?.data?.path });
      fetch('http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPackagesList.jsx:handleEditImageUpload:after-upload',message:'Upload API response',data:{responseData:res.data,path:res.data?.data?.path},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const path = res.data?.data?.path;
      if (path) {
        // Cloudinary returns full URL (https://...), disk storage returns /uploads/...
        const imageSrc = path.startsWith("http") ? path : (path.startsWith("/") ? path : "/" + path);
        // #region agent log
        console.log("[DEBUG] handleEditImageUpload: Setting imageSrc", { originalPath: path, finalImageSrc: imageSrc, startsWithHttp: path.startsWith("http") });
        fetch('http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPackagesList.jsx:handleEditImageUpload:set-value',message:'Setting imageSrc value',data:{originalPath:path,finalImageSrc:imageSrc,startsWithHttp:path.startsWith("http")},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        editSetValue("imageSrc", imageSrc);
        toast.success("Image uploaded.");
      } else {
        console.log("[DEBUG] handleEditImageUpload: No path in response!", { responseData: res.data });
        toast.error("Upload failed.");
      }
    } catch (err) {
      // #region agent log
      console.error("[DEBUG] handleEditImageUpload: Upload error", { error: err?.message, responseData: err?.response?.data });
      fetch('http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPackagesList.jsx:handleEditImageUpload:error',message:'Upload error',data:{error:err?.message,responseData:err?.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      toast.error(
        err?.response?.data?.message || err?.message || "Upload failed."
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
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
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "AdminPackagesList.jsx:submitAddPackage",
              message: "Frontend submit add package",
              data: {
                imageSrc: data?.imageSrc,
                isFullUrl:
                  typeof data?.imageSrc === "string" &&
                  data?.imageSrc?.startsWith("http"),
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              hypothesisId: "H2",
            }),
          }
        ).catch(() => {});
        // #endregion
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
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "AdminPackagesList.jsx:submitEditPackage",
              message: "Frontend submit edit package",
              data: {
                imageSrc: rest?.imageSrc,
                isFullUrl:
                  typeof rest?.imageSrc === "string" &&
                  rest?.imageSrc?.startsWith("http"),
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              hypothesisId: "H2",
            }),
          }
        ).catch(() => {});
        // #endregion
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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Manage Packages</h1>
          <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Bundles of products that customers can buy together.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          Add Package
        </button>
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Loading packages…</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load packages."}
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <CubeIcon className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>No packages yet</h3>
            <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Create a package to sell products together at a bundle price.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Add Package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <thead className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Package</th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Bundle price</th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Description</th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Stock</th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Category</th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Products</th>
                  <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className={`transition-colors ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`relative h-12 w-12 shrink-0 rounded-xl overflow-hidden ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
                          {pkg.imageSrc ? (
                            <img
                              src={packageImageSrc(pkg.imageSrc)}
                              alt={pkg.imageAlt || pkg.name}
                              className="h-12 w-12 object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CubeIcon className="h-6 w-6 text-indigo-400" />
                            </div>
                          )}
                        </div>
                        <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>KSh {Number(pkg.bundlePrice ?? 0).toLocaleString()}</span>
                    </td>
                    <td className={`px-4 py-3 text-sm max-w-[180px] ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} title={pkg.description || ""}>
                      {truncate(pkg.description, 35)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pkg.inStock !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {pkg.inStock !== false ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{pkg.category || "—"}</span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="inline-flex items-center gap-1.5">
                        <CubeIcon className={`h-4 w-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                        {Array.isArray(pkg.productIds) ? pkg.productIds.length : 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => setEditPackage(pkg)} className={`rounded-lg p-2 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-indigo-900/30 hover:text-indigo-400" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`} title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteClick(pkg.id, pkg.name)} disabled={isDeleting} className={`rounded-lg p-2 disabled:opacity-50 transition-colors ${isDarkMode ? "text-gray-400 hover:bg-red-900/30 hover:text-red-400" : "text-gray-500 hover:bg-red-50 hover:text-red-600"}`} title="Delete">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-package-title"
          onClick={handleDeleteCancel}
        >
          <div
            className={`rounded-xl shadow-xl max-w-md w-full p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-package-title"
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Delete package?
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Delete package &quot;{deleteConfirmPackage.name}&quot;? This
              cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={closeAddModal}
        >
          <div
            className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>Add package</h2>
              <button
                type="button"
                onClick={closeAddModal}
                className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
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
                <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Package name *
                </label>
                <input
                  type="text"
                  {...addRegister("name", { required: "Name is required" })}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                />
                {addErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {addErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  {...addRegister("description")}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                />
                {addErrors.bundlePrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {addErrors.bundlePrice.message}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Products in this package *
                </label>
                <p className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Select the products included in this bundle.
                </p>
                <div className={`max-h-48 overflow-y-auto border rounded-md p-3 space-y-2 ${isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200"}`}>
                  {products.length === 0 ? (
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Package image
                  </label>
                  <div className="mt-1 flex items-start gap-3">
                    <label className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${isDarkMode ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-[#082567]/30 bg-[#082567]/5 text-[#082567] hover:bg-[#082567]/10"}`}>
                      <PlusIcon className="h-4 w-4" />
                      {isUploadingImage ? "Uploading…" : "Choose image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={isUploadingImage}
                        onChange={handleAddImageUpload}
                      />
                    </label>
                    {addWatch("imageSrc") && (
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={packageImageSrc(addWatch("imageSrc"))}
                          alt="Preview"
                          className={`h-12 w-12 rounded-lg object-cover border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {addWatch("imageSrc")}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    JPG, PNG, WebP or GIF, max 5MB
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Image alt text
                  </label>
                  <input
                    type="text"
                    {...addRegister("imageAlt")}
                    placeholder="Describe the image for accessibility"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Features / usage information
                </label>
                <p className={`text-sm mt-0.5 mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Describe how to use the products or key information. Shown on
                  the package details page.
                </p>
                <textarea
                  rows={4}
                  {...addRegister("featuresText")}
                  placeholder="e.g. Apply minoxidil once daily. Use the shampoo 2–3 times per week."
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Quantity label
                  </label>
                  <input
                    type="text"
                    {...addRegister("quantityLabel")}
                    placeholder="e.g. 1 pack"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Lead time
                  </label>
                  <input
                    type="text"
                    {...addRegister("leadTime")}
                    placeholder="e.g. 2-3 days"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Category
                </label>
                <select
                  {...addRegister("category")}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
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
                    className={`mt-2 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addPkgInStock"
                  {...addRegister("inStock")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="addPkgInStock"
                  className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  In stock
                </label>
              </div>
              <div className={`flex gap-3 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  type="submit"
                  disabled={
                    isAddingPackage || addSelectedProductIds.length === 0
                  }
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {isAddingPackage ? "Creating…" : "Create package"}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={closeEditModal}
        >
          <div
            className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-[#082567]"}`}>Edit package</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className={`rounded-lg p-2 ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
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
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Package name *
                  </label>
                  <input
                    type="text"
                    {...editRegister("name", { required: "Name is required" })}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {editErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    {...editRegister("description")}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                  {editErrors.bundlePrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {editErrors.bundlePrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Products in this package *
                  </label>
                  <div className={`max-h-48 overflow-y-auto border rounded-md p-3 space-y-2 ${isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200"}`}>
                    {products.length === 0 ? (
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Package image
                    </label>
                    <div className="mt-1 flex items-start gap-3">
                      <label className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${isDarkMode ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-[#082567]/30 bg-[#082567]/5 text-[#082567] hover:bg-[#082567]/10"}`}>
                        <PlusIcon className="h-4 w-4" />
                        {isUploadingImage ? "Uploading…" : "Change image"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          disabled={isUploadingImage}
                          onChange={handleEditImageUpload}
                        />
                      </label>
                      {editWatch("imageSrc") && (
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={packageImageSrc(editWatch("imageSrc"))}
                            alt="Preview"
                            className={`h-12 w-12 rounded-lg object-cover border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {editWatch("imageSrc")}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      JPG, PNG, WebP or GIF, max 5MB
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Image alt text
                    </label>
                    <input
                      type="text"
                      {...editRegister("imageAlt")}
                      placeholder="Describe the image for accessibility"
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Features / usage information
                  </label>
                  <p className={`text-sm mt-0.5 mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Describe how to use the products or key information. Shown
                    on the package details page.
                  </p>
                  <textarea
                    rows={4}
                    {...editRegister("featuresText")}
                    placeholder="e.g. Apply minoxidil once daily. Use the shampoo 2–3 times per week."
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Rating (read-only)
                    </label>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {editPackageData?.rating != null &&
                      editPackageData?.rating !== ""
                        ? Number(editPackageData.rating).toFixed(1)
                        : "—"}{" "}
                      — Updated by customer reviews
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Quantity label
                    </label>
                    <input
                      type="text"
                      {...editRegister("quantityLabel")}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Lead time
                    </label>
                    <input
                      type="text"
                      {...editRegister("leadTime")}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Category
                  </label>
                  <select
                    {...editRegister("category")}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
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
                      className={`mt-2 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" : "border-gray-300 focus:border-[#082567] focus:ring-[#082567]"}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editPkgInStock"
                    {...editRegister("inStock")}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="editPkgInStock"
                    className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    In stock
                  </label>
                </div>
                <div className={`flex gap-3 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    type="submit"
                    disabled={
                      isUpdatingPackage || editSelectedProductIds.length === 0
                    }
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isUpdatingPackage ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
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
