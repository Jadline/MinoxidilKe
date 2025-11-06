const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Product = require('../models/productModel')
const fs = require('fs')

dotenv.config({path : './config.env'})

const productsdata = JSON.parse(fs.readFileSync(`${__dirname}/products.json`,'utf-8'))

const DB = process.env.DATABASE;

async function connectDB(){
    try{
        await mongoose.connect(DB)
        console.log('Database connected successfull')
    }
    catch(err){
        console.log('There was an error connecting to the database',err)
        process.exit(1)

    }
}
connectDB()



async function importData(){
    try{
       await Product.create(productsdata.products)
       console.log('data successfully imported to the db')
        process.exit()
    }
    catch(err){
       console.log('There was an error importing data',err)
        process.exit(1)
    }
}

async function deleteData(){
    try{
        await Product.deleteMany()
        console.log("Data was successfully deleted")
        process.exit()
    }
    catch(err){
        console.log('There was an error deleting data',err)
        process.exit(1)
    }
}

if(process.argv[2] === '--import'){
    importData()
}
else if(process.argv[2] === '--delete'){
    deleteData()
}

