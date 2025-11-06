import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const ordersURL = `${BASE_URL}/api/v1/orders`;

export async function getOrders() {
  try {
    const token = localStorage.getItem('userToken'); 

    const response = await axios.get(ordersURL, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return response.data?.data?.orders;
  } catch (err) {
    console.log('There was an error fetching data', err?.message);
  }
}
