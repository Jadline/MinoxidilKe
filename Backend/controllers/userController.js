const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function signupUser(req,res){
    try{
        const {firstName,lastName,email,password} = req.body

    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
            message : 'Email is already in use'
        })
    }
    const hashedpassword = await bcrypt.hash(password,10)

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password : hashedpassword
    }
   )
   res.status(201).json({
    message : 'User was registered successfully',
    user : {id : newUser._id,email : newUser.email}
    
   })

    }
    catch(error){
         res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function loginUser(req,res){
   try{
     const {email,password} = req.body 

    const user = await User.findOne({email})
    if(!user){
       return  res.status(404).json({
            message : 'user not found'
        })
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(401).json({
            message : 'Invalid credentials'
        })
    }
    const token = jwt.sign(
        {
            id : user._id,
            email : user.email,
            name : user.firstName
        },
        process.env.JWT_SECRET,
        {expiresIn : '1d'}
    )
    res.status(200).json({
        message : 'Login was successful!',
        token,
        user : {
            id : user._id,
            email:user.email,
            name : user.firstName
        }
    })
   }catch(err){
    res.status(500).json({
        status : 'fail',
        message : err.message
    })
   }
}
module.exports ={ signupUser,loginUser};
