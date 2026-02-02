import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createPackage, getProducts, getPackageCategories, uploadPackageImage } from "../api";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export default function AdminAddPackage() {
  const navigate = useNavigate();
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-for-package"],
    queryFn: async () => {
      const res = await getProducts({ limit: 100 });
      const products = res.data?.data?.products ?? res.data?.products ?? [];
      return Array.isArray(products) ? products : [];
    },
  });

  const products = Array.isArray(productsData) ? productsData : [];

  const { data: categoriesData } = useQuery({
    queryKey: ["package-categories"],
    queryFn: async () => {
      const res = await getPackageCategories();
      return res.data?.data?.categories ?? [];
    },
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const toggleProductId = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
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

  const { mutateAsync: submitPackage, isPending } = useMutation({
    mutationFn: (data) => {
      const productIds = selectedProductIds.map(Number).filter((n) => n > 0);
      const featuresText = (data.featuresText ?? "").trim();
      const details = featuresText
        ? [{ name: "Features", items: [featuresText] }]
        : [];
      return createPackage({
        name: data.name,
        description: data.description ?? "",
        imageSrc: data.imageSrc ?? "",
        imageAlt: data.imageAlt ?? "",
        bundlePrice: Number(data.bundlePrice) ?? 0,
        quantityLabel: data.quantityLabel ?? "1 pack",
        leadTime: data.leadTime ?? "",
        category: data.category ?? "",
        inStock: data.inStock !== false,
        productIds,
        details,
      });
    },
    onSuccess: () => {
      toast.success("Package created.");
      navigate("/admin/packages");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create package.";
      toast.error(msg);
    },
  });

  const handleImageUpload = async (e) => {
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
        const base = BASE_URL.replace(/\/$/, "");
        const fullUrl = base + path;
        setValue("imageSrc", fullUrl);
        toast.success("Image uploaded.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed.";
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Package</h1>
      <p className="text-gray-600 mb-6">
        Create a bundle of products that customers can buy together at a bundle price.
      </p>

      <form
        onSubmit={handleSubmit((data) => submitPackage(data))}
        className="max-w-2xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Package name *</label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            {...register("description")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bundle price (KSh) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("bundlePrice", {
              required: "Bundle price is required",
              min: { value: 0, message: "Must be ≥ 0" },
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.bundlePrice && (
            <p className="mt-1 text-sm text-red-600">{errors.bundlePrice.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Products in this package *
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Select the products that are included in this bundle.
          </p>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">No products found. Add products first.</p>
            ) : (
              products.map((prod) => (
                <label key={prod.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(prod.id)}
                    onChange={() => toggleProductId(prod.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {prod.name} — KSh {Number(prod.price ?? 0).toLocaleString()}
                  </span>
                </label>
              ))
            )}
          </div>
          {selectedProductIds.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">Select at least one product for this package.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              {...register("imageSrc")}
              placeholder="https://... or upload below"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or upload image</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {isUploadingImage && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image alt text</label>
            <input
              type="text"
              {...register("imageAlt")}
              placeholder="Describe the image"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Features / usage information</label>
          <p className="text-sm text-gray-500 mt-0.5 mb-1">Describe how to use the products or key information. Shown on the package details page.</p>
          <textarea
            rows={4}
            {...register("featuresText")}
            placeholder="e.g. Apply minoxidil once daily. Use the shampoo 2–3 times per week. Store in a cool, dry place."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity label</label>
            <input
              type="text"
              {...register("quantityLabel")}
              placeholder="e.g. 1 pack"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lead time</label>
            <input
              type="text"
              {...register("leadTime")}
              placeholder="e.g. 2-3 days"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register("category")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__other__">Add custom category</option>
          </select>
          {watch("category") === "__other__" && (
            <input
              type="text"
              {...register("categoryCustom")}
              placeholder="Type custom category"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inStock"
            {...register("inStock")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="inStock" className="text-sm text-gray-700">In stock</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending || selectedProductIds.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create package"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/packages")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
