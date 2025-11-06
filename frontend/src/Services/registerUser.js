
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL;
const REGISTER_URL = `${BASE_URL}/api/v1/account/registerUser`
export async function registerUser(registrationinfo){
    try{
        const response = await axios.post(REGISTER_URL,registrationinfo,{
            headers : {
                "Content-Type": "application/json"
            }
        })
        return response.data

    }catch(err){
        console.log('There was an error registering user',err?.message)

    }
}