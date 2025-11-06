import axios from 'axios';
const ordersURL = 'http://127.0.0.1:3000/api/v1/orders';

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
