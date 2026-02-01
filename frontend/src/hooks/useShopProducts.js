import { useQuery } from "@tanstack/react-query";
import { buildQuery } from "../helpers/buildquery";
import { fetchProducts } from "../Services/fetchproducts";
import { useShopStore } from "../stores/shopStore";

export function useShopProducts() {
  const selectedFilters = useShopStore((state) => state.selectedFilters);
  const sortBy = useShopStore((state) => state.sortBy);
  const currentPage = useShopStore((state) => state.currentPage);
  const itemsperPage = useShopStore((state) => state.itemsperPage);

  const qs = buildQuery({ selectedFilters, sortBy, currentPage, itemsperPage });

  const {
    data,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["shopProducts", qs],
    queryFn: () => fetchProducts(qs),
    keepPreviousData: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const products = data?.products || [];
  const totalItems = data?.total || 0;

  return { products, isLoadingProducts, productsError, totalItems };
}
