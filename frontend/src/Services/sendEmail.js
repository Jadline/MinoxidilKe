import axios from 'axios'

const CONTACT_URL = 'http://127.0.0.1:3000/api/v1/contact'
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