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
    const email = (payload.email || '').trim().toLowerCase();
    const { name, given_name, family_name } = payload;

    const firstName = given_name || name?.split(' ')[0] || 'User';
    const lastName = family_name || name?.split(' ').slice(1).join(' ') || '';

    let user = await User.findOne({ email });
    let isNew = false;

    if (!user) {
      const role =
        process.env.FIRST_ADMIN_EMAIL && process.env.FIRST_ADMIN_EMAIL.trim().toLowerCase() === email
          ? 'admin'
          : 'user';
      try {
        user = await User.create({
          firstName,
          lastName,
          email,
          password: null,
          isGoogleUser: true,
          role,
        });
        isNew = true;
      } catch (createErr) {
        if (createErr.code === 11000 || (createErr.message && createErr.message.includes('E11000'))) {
          return res.status(400).json({
            message: 'Email is already in use. Please log in with your password or use a different account.',
          });
        }
        throw createErr;
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name || user.firstName || '', role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: isNew ? 'Google sign-up successful' : 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.firstName,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    const isDuplicateEmail = error.code === 11000 || (error.message && error.message.includes('E11000'));
    res.status(400).json({
      message: isDuplicateEmail
        ? 'Email is already in use. Please log in with your password or use a different account.'
        : (error.message || 'Google sign-in failed'),
    });
  }
}

module.exports = googleLogin;
