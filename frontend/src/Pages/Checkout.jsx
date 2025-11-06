
import OrderSummary from "../Components/OrderSummary"

import ProductOverview from "../Components/ProductOverview"
import {loadStripe} from '@stripe/stripe-js'

import { Elements } from '@stripe/react-stripe-js'

const STRIPE_KEY = 'pk_test_51SOdsiEfzUxOuGaAMBUT8SOnOuKpJXhubrGGQSwHxTeL0wdreSbHIkD5sbsaXE65KuARjzdZ7HC2ChfnZUW84gEB00c0XL5ZRX'
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