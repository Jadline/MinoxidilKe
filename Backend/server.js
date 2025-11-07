
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const redis = require('redis')

dotenv.config({path : './config.env'})

const app = require('./app')

const DB = process.env.DATABASE

async function connectDB(){
    try {
        await mongoose.connect(DB)
        console.log('DB connected successfully')
    }
    catch(err){
        console.log('database connection error',err)
        process.exit(1)
    }
}

connectDB()

const redisClient = redis.createClient({
    url : process.env.REDIS_URL,
      socket: {
    tls: true, 
    rejectUnauthorized: false,
  },
})

redisClient.connect()
    .then(() => console.log('Connected to redis'))
    .catch((error) => console.error('There was an error connecting to redis',error))


const port = process.env.PORT || 3000

app.listen(port,() => {
    console.log('app is running on port',port)
})

module.exports = redisClient;