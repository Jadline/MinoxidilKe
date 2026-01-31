const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/** Normalize email and validate required fields. */
function normalizeAndValidateSignup(body) {
  const email = (body.email || '').trim().toLowerCase();
  const firstName = (body.firstName || '').trim();
  const lastName = (body.lastName || '').trim();
  const password = body.password;
  const confirmPassword = body.confirmPassword;

  if (!email) return { ok: false, status: 400, message: 'Email is required.' };
  if (!firstName) return { ok: false, status: 400, message: 'First name is required.' };
  if (!lastName) return { ok: false, status: 400, message: 'Last name is required.' };
  if (!password) return { ok: false, status: 400, message: 'Password is required.' };
  if (password.length < 8) return { ok: false, status: 400, message: 'Password must be at least 8 characters.' };
  if (password !== confirmPassword) return { ok: false, status: 400, message: 'Passwords do not match.' };

  return { ok: true, email, firstName, lastName, password };
}

async function signupUser(req, res) {
  try {
    const validated = normalizeAndValidateSignup(req.body);
    if (!validated.ok) {
      return res.status(validated.status).json({ status: 'fail', message: validated.message });
    }
    const { email, firstName, lastName, password } = validated;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = process.env.FIRST_ADMIN_EMAIL &&
      process.env.FIRST_ADMIN_EMAIL.trim().toLowerCase() === email
      ? 'admin'
      : 'user';

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.firstName,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Server error.',
    });
  }
}

/** Normalize email for login. */
function normalizeLogin(body) {
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return { ok: false, message: 'Email and password are required.' };
  return { ok: true, email, password };
}

async function loginUser(req, res) {
  try {
    const { ok, email, password } = normalizeLogin(req.body);
    if (!ok) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.firstName,
        role: user.role || 'user',
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Login failed.' });
  }
}

/** Return current user from req.user (set by authMiddleware). */
async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.firstName,
          role: user.role || 'user',
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Server error.' });
  }
}

module.exports = { signupUser, loginUser, getMe };
