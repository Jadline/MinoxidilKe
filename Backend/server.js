
const dotenv = require('dotenv')
const mongoose = require('mongoose')

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



const port = 3000;

app.listen(port,() => {
    console.log('app is running on port',port)
})