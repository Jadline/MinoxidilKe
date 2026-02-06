// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // 60s – helps when Render free tier is waking from sleep
});

// Attach Bearer token from localStorage when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      err.config?.url !== "/api/v1/account/loginUser"
    ) {
      localStorage.removeItem("userToken");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const getProducts = (params) => api.get("/api/v1/products", { params });
export const getProduct = (id) => api.get(`/api/v1/products/${id}`);
export const createOrder = (data) => api.post("/api/v1/orders", data);
// Admin: list all orders
export const getAdminOrders = () => api.get("/api/v1/orders/admin");
// Admin: update order (paymentStatus and/or orderStatus; id = order._id)
export const updateOrder = (id, data) =>
  api.patch(`/api/v1/orders/${id}`, data);

// Admin product CRUD (requires admin role on backend)
export const createProduct = (data) => api.post("/api/v1/products", data);
export const updateProduct = (id, data) =>
  api.patch(`/api/v1/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/v1/products/${id}`);

export const getMe = () => api.get("/api/v1/account/me");

// Reviews (public read; create requires auth)
export const getReviewsByProduct = (productId) =>
  api.get(`/api/v1/reviews/${productId}`);
export const createReview = (data) => api.post("/api/v1/reviews", data);

// Package reviews (public read; create requires auth)
export const getReviewsByPackage = (packageId) =>
  api.get(`/api/v1/package-reviews/${packageId}`);
export const createPackageReview = (data) =>
  api.post("/api/v1/package-reviews", data);

// Packages (bundles of products)
export const getPackages = (params) => api.get("/api/v1/packages", { params });
export const getPackageCategories = () =>
  api.get("/api/v1/packages/categories");
export const getPackage = (id) => api.get(`/api/v1/packages/${id}`);
export const createPackage = (data) => api.post("/api/v1/packages", data);
export const updatePackage = (id, data) =>
  api.patch(`/api/v1/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/api/v1/packages/${id}`);

/** Upload package image (admin). FormData with field "image". Returns { path }. Clear Content-Type so browser sends multipart/form-data with boundary. */
export const uploadPackageImage = (formData) =>
  api.post("/api/v1/upload/package", formData, { headers: { "Content-Type": undefined } });

/** Upload product image (admin). FormData with field "image". Returns { path }. Clear Content-Type so browser sends multipart/form-data with boundary. */
export const uploadProductImage = (formData) =>
  api.post("/api/v1/upload/product", formData, { headers: { "Content-Type": undefined } });

// Shipping methods (public, by country/city)
export const getShippingMethods = (params) =>
  api.get("/api/v1/shipping-methods", { params });
// Admin shipping methods (all, CRUD)
export const getAllShippingMethods = () =>
  api.get("/api/v1/shipping-methods/admin");
export const createShippingMethod = (data) =>
  api.post("/api/v1/shipping-methods", data);
export const updateShippingMethod = (id, data) =>
  api.patch(`/api/v1/shipping-methods/${id}`, data);
export const deleteShippingMethod = (id) =>
  api.delete(`/api/v1/shipping-methods/${id}`);

// Pickup locations (public, by country/city)
export const getPickupLocations = (params) =>
  api.get("/api/v1/pickup-locations", { params });
// Admin pickup locations (all, CRUD)
export const getAllPickupLocations = () =>
  api.get("/api/v1/pickup-locations/admin");
export const createPickupLocation = (data) =>
  api.post("/api/v1/pickup-locations", data);
export const updatePickupLocation = (id, data) =>
  api.patch(`/api/v1/pickup-locations/${id}`, data);
export const deletePickupLocation = (id) =>
  api.delete(`/api/v1/pickup-locations/${id}`);
// User addresses (requires auth)
export const getAddresses = () => api.get("/api/v1/addresses");
export const createAddress = (data) => api.post("/api/v1/addresses", data);
export const updateAddress = (id, data) =>
  api.patch(`/api/v1/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/api/v1/addresses/${id}`);

// Settings (public)
export const getPublicSettings = () => api.get("/api/v1/settings/public");

// Settings (admin)
export const getAllSettings = () => api.get("/api/v1/settings");
export const getSetting = (key) => api.get(`/api/v1/settings/${key}`);
export const updateSetting = (key, value) =>
  api.put(`/api/v1/settings/${key}`, { value });
export const updatePromoBanner = (data) =>
  api.put("/api/v1/settings/promo-banner/update", data);

export default api;
