export function buildQuery({selectedFilters,sortBy,currentPage,itemsperPage}){

    const params = new URLSearchParams()

    if(selectedFilters.category?.length > 0){
        params.append('category',selectedFilters.category.join(','))
    }
    if(selectedFilters.price?.length > 0){
        const mins = selectedFilters.price.map((el) => el.min ?? 0)
        const maxs = selectedFilters.price.map((el) => el.max ?? Number.MAX_SAFE_INTEGER)

        const minPrice = Math.min(...mins)
        const maxPrice = Math.max(...maxs)

        params.append('minPrice',String(minPrice))
        if(Number.isFinite(maxPrice) && maxPrice < Number.MAX_SAFE_INTEGER){
            params.append('maxPrice',String(maxPrice))
        }
    }
    if(sortBy){
        params.append('sort',String(sortBy))
    }
    if(currentPage){
        params.append('page',currentPage)
    }
    if(itemsperPage){
        params.append('limit',itemsperPage)
    }
    return params.toString()
  

}