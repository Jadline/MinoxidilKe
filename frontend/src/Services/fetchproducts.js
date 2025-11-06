import axios from 'axios'
 export async function fetchProducts(qs){
    try {
        const response = await  axios.get(`http://127.0.0.1:3000/api/v1/products?${qs}`)
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
