import axios from 'axios'
const paymentURL ='http://127.0.0.1:3000/api/v1/create-payment-intent'

export async function createPayment(payment){
    try{
        const response = await axios.post(paymentURL,payment,{
            headers : {
                "Content-Type" : 'application/json'
            }
        })
        console.log(response.data)
        return response.data

    }
    catch(err){
        console.log('There was an error', err?.message)

    }
}