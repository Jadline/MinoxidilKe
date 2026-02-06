import CartContents from '../Components/CartContents'
import { CartSEO } from '../Components/SEO'

function ShoppingCart(){
    return(
        <>
           <CartSEO />
           <CartContents />
        </>
    )
}
export default ShoppingCart