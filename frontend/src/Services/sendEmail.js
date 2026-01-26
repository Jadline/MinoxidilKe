import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL;
const CONTACT_URL = `${BASE_URL}/api/v1/contact`

export async function sendEmail(formdata){
  const response = await axios.post(CONTACT_URL, formdata, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}
