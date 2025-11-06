const express = require('express')
const cors = require('cors');
const morgan = require('morgan')
const productRouter = require('./routes/productRoute')
const paymentRouter = require('./routes/paymentRoute')
const OrderRouter = require('./routes/orderRoute')
const mpesaRouter = require('./routes/mpesaRoute')
const emailRouter = require('./routes/emailRoute')
const userRouter = require('./routes/userRoute')
const reviewRoutes = require('./routes/reviewRoutes');

const app = express()

const corsOptions = {
  origin: "*", 
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
};

app.use(cors(corsOptions));

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/v1/products',productRouter)
app.use('/api/v1/make-card-payment', paymentRouter);
app.use('/api/v1/orders',OrderRouter)
app.use('/api/v1/mpesa-notify', mpesaRouter);
app.use('/api/v1/contact',emailRouter)
app.use('/api/v1/account',userRouter)
app.use('/api/v1/reviews', reviewRoutes);




module.exports = app;