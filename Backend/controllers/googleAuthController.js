const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

   
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, given_name, family_name } = payload;


    const firstName = given_name || name?.split(" ")[0] || "User";
    const lastName = family_name || name?.split(" ").slice(1).join(" ") || " ";

    
    let user = await User.findOne({ email });

  
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: null,
        isGoogleUser: true,
      });
    }

   
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name : user.firstName
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: user.isNew ? 'Google sign-up successful' : 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(400).json({
      message: 'Google sign-in failed',
      error: error.message,
    });
  }
}

module.exports = googleLogin;
