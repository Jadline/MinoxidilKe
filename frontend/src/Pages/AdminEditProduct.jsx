import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { getProduct, updateProduct } from "../api";
import toast from "react-hot-toast";

export default function AdminEditProduct() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productFromState = location.state?.product;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const res = await getProduct(id);
      return res.data?.data?.product ?? null;
    },
    enabled: !!id && !productFromState,
  });

  const product = productFromState ?? data;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
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

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name ?? "",
      price: product.price ?? 0,
      category: product.category ?? "",
      description: product.description ?? "",
      leadTime: product.leadTime ?? "",
      quantityLabel: product.quantityLabel ?? "1 bottle",
      inStock: product.inStock !== false,
      imageSrc: product.imageSrc ?? "",
      imageAlt: product.imageAlt ?? "",
    });
  }, [product, reset]);

  const { mutateAsync: submitUpdate, isPending } = useMutation({
    mutationFn: (formData) => updateProduct(Number(id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success("Product updated.");
      navigate("/admin/products");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update product.";
      toast.error(msg);
    },
  });

  if (id && !product && (isLoading || isError)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        {isLoading && <p className="text-gray-600">Loading product…</p>}
        {isError && (
          <p className="text-red-600">
            {error?.response?.data?.message || error?.message || "Product not found."}
          </p>
        )}
        <Link to="/admin/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  if (id && !product) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">Product not found.</p>
        <Link to="/admin/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← Back to products
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Product</h1>
      <p className="text-gray-600 mb-6">
        Update details for {product?.name ?? "this product"}.
      </p>

      <form
        onSubmit={handleSubmit((data) => submitUpdate(data))}
        className="max-w-2xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Product name *</label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (KSh)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Must be ≥ 0" },
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. Minoxidil"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            {...register("description")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity label</label>
            <input
              type="text"
              {...register("quantityLabel")}
              placeholder="e.g. 1 bottle"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              {...register("imageSrc")}
              placeholder="https://..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image alt text</label>
            <input
              type="text"
              {...register("imageAlt")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
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
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
          <Link
            to="/admin/products"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
