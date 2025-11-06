import axios from 'axios'

const MPESA_STK_URL = 'http://localhost:3000/api/v1/payments/stkpush'

export async function createMpesaPayment(paymentinfo) {
  try {
    const response = await axios.post(MPESA_STK_URL, paymentinfo, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (err) {
    console.error("There was an error making mpesa payment", err?.message);
    return { error: true, message: err?.message || "Payment request failed" };
  }
}