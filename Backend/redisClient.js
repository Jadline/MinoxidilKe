// redisClient.js
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.on('connect', () => console.log('Connected to Redis successfully'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
