import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log('base url',BASE_URL)
 export async function fetchProducts(qs){
    try {
        const response = await  axios.get(`${BASE_URL}/api/v1/products?${qs}`)
        const {data,total} = await response.data
        
        return {
            products : data.products,
            total
        }
    }catch(err){
        console.log('There was an error fetching  products data',err)
        throw err;
    }
}
