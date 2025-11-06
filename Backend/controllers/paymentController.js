require("dotenv").config();
const axios = require("axios");
const https = require("https");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const { v4: uuidv4 } = require("uuid");


const PESAPAL_BASE_URL =
  process.env.PESAPAL_ENV === "production"
    ? "https://www.pesapal.com/API/PostPesapalDirectOrderV4"
    : "https://demo.pesapal.com/API/PostPesapalDirectOrderV4";


async function makePayment(req, res) {
  try {
    const { amount, description, email, phone } = req.body;

   
    const orderRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    console.log("Using consumer key:", process.env.PESAPAL_CONSUMER_KEY);

    
    const payload = {
      amount: amount.toFixed(2),
      description,
      type: "MERCHANT",
      reference: orderRef,
      first_name: "Customer",
      last_name: "Name",
      email,
      phone_number: phone,
      callback_url: process.env.PESAPAL_CALLBACK_URL,
    };

   
    const oauth = OAuth({
      consumer: {
        key: process.env.PESAPAL_CONSUMER_KEY,
        secret: process.env.PESAPAL_CONSUMER_SECRET,
      },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64");
      },
    });

    const request_data = {
      url: PESAPAL_BASE_URL,
      method: "POST",
      data: payload, 
    };

    const oauth_headers = oauth.toHeader(oauth.authorize(request_data));
    console.log("OAuth Header:", oauth_headers);

    
    const agent = new https.Agent({ rejectUnauthorized: false });

    
    const response = await axios.post(PESAPAL_BASE_URL, payload, {
      headers: {
        ...oauth_headers,
        "Content-Type": "application/json",
      },
      httpsAgent: agent,
    });

    
    res.status(200).json({ checkoutLink: response.data });
  } catch (err) {
    console.error("Pesapal card payment error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create Pesapal card payment" });
  }
}


async function pesapalCallbackHandler(req, res) {
  try {
    const paymentData = req.body;

    
    console.log("Pesapal callback received:", paymentData);

    

    res.status(200).send("Pesapal callback received");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing Pesapal callback");
  }
}

module.exports = { makePayment, pesapalCallbackHandler };
