// src/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL, // now all requests will prepend this
});

// Example functions
export const getProducts = () => api.get('/api/v1/products'); 
export const getProduct = (id) => api.get(`/api/v1/products/${id}`);
export const createOrder = (data) => api.post('/api/v1/orders', data);

export default api;
