
import axios from 'axios'
const REGISTER_URL = 'http://127.0.0.1:3000/api/v1/account/registerUser'
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