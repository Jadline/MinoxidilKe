
import OrderSummary from "../Components/OrderSummary"

import ProductOverview from "../Components/ProductOverview"
import {loadStripe} from '@stripe/stripe-js'

import { Elements } from '@stripe/react-stripe-js'

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''
function Checkout(){
    const stripepromise = loadStripe(STRIPE_KEY)
    return (
        <>
          <Elements stripe={stripepromise}>
                 <OrderSummary />
          </Elements>
           
         
        </>
    )
}
export default Checkout