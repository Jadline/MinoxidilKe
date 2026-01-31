import api from "../api";

export async function createOrder(newOrder) {
  const response = await api.post("/api/v1/orders", newOrder);
  return response.data?.data;
}
