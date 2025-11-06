const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function makePayment(req,res){
      try {
    const { amount, currency } = req.body; 
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create PaymentIntent' });
  }

}
module.exports = makePayment