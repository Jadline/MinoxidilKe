const axios = require("axios");

const consumerSecret = process.env.CONSUMER_SECRET;
const consumerKey = process.env.CONSUMER_KEY;

async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

async function registerUrl(req, res) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
      {
        ShortCode: "600998",
        ResponseType: "Completed",
         ConfirmationURL: "https://loud-cases-wear.loca.lt/api/v1/payments/confirmation",
        ValidationURL: "https://loud-cases-wear.loca.lt/api/v1/payments/validation"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("🔴 M-PESA ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to register URL", details: err.response?.data || err.message });
  }
}

async function stkPush(req, res) {
  try {
    const { amount, phone } = req.body; 

    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const shortcode = "174379"; 
    const passkey = process.env.MPESA_PASSKEY;

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone, 
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://loud-cases-wear.loca.lt/api/v1/payments/stk_callback",
        AccountReference: "Minoxidil KE",
        TransactionDesc: "Payment for product",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("🔴 STK PUSH ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "STK Push failed", details: err.response?.data || err.message });
  }
}


module.exports = { registerUrl, stkPush };

