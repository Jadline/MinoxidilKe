import CategoryFilters from "../Components/CategoryFilters";
import PaginationComponent from "../Components/PaginationUi";
import ProductList from "../Components/ProductList";
import PackageList from "../Components/PackageList";
import { ProductsSEO } from "../Components/SEO";

function Shop() {
  return (
    <>
      <ProductsSEO />
      {/* Packages: bundles customers can buy together (same card style as products) */}
      <PackageList />
      {/* Filters and product grid: individual products */}
      <CategoryFilters />
      <section aria-labelledby="products-heading">
        <h2 id="products-heading" className="sr-only">
          Products
        </h2>
        <ProductList />
      </section>
      <PaginationComponent />
    </>
  );
}
export default Shop;