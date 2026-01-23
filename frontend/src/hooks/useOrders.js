import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../Services/fetchOrders";

export function useOrders() {
  const {
    data: orders,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    keepPreviousData: true,
  });

  return { orders, isLoadingOrders, ordersError };
}
