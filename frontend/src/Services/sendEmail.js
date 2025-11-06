import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL;
const CONTACT_URL = `${BASE_URL}/api/v1/contact`
export async function sendEmail(formdata){
    try{
        const response = axios.post(CONTACT_URL,formdata,{
            headers : {
                "Content-Type" : "application/json"
            }
        })
        return response.data
    }catch(err){
        console.log('There was an error submitting contact form data',err?.message)

    }
}