const dotenv = require('dotenv');
const mongoose = require('mongoose');
const redisClient = require('./redisClient');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE;

async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log('DB connected successfully');
  } catch (err) {
    console.log(' Database connection error', err);
    process.exit(1);
  }
}

connectDB();



const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 App is running on port ${port}`);
});


