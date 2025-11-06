import CategoryFilters from "../Components/CategoryFilters"
import PaginationComponent from "../Components/PaginationUi"

import ProductList from "../Components/ProductList"

function Shop(){
    return(
        <>
            
            <CategoryFilters/>
            <ProductList/>
            <PaginationComponent/>
           
        </>
    )
}
export default Shop