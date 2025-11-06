import axios from "axios";

const ordersURL = "http://127.0.0.1:3000/api/v1/orders";

export async function createOrder(newOrder) {
  try {
    const token = localStorage.getItem("userToken"); 

    const response = await axios.post(ordersURL, newOrder, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
    });

    return response.data?.data;
  } catch (err) {
    console.log("There was an error", err?.message);
  }
}
