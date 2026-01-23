const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    id : Number,
    name : String,
    src : String,
    alt : String,
})

const detailSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    items : [String],
})

const ProductSchema = new mongoose.Schema({
    id : {
        type : Number,
        required : true,
        unique : true,
    },
    name : {
        type : String,
        required : true
    },
    price : Number,
    quantityLabel : String,
    imageSrc : String,
    imageAlt : String,
    rating : Number,
    inStock : {
        type : Boolean,
        default : true
    },
    category : String,
    leadTime : String,
    images : [imageSchema],
    description : String,
    details : [detailSchema]
})

// Indexes to speed up filtered and sorted product queries
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ name: 1 });

const Product = mongoose.model('Product',ProductSchema);
module.exports = Product;
