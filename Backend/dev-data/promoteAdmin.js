/**
 * Promote the user with FIRST_ADMIN_EMAIL to admin role.
 * Use this if you already registered that email before setting FIRST_ADMIN_EMAIL.
 * Run from Backend folder: node dev-data/promoteAdmin.js
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });
const User = require('../models/userModel');

async function promoteAdmin() {
  const email = (process.env.FIRST_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.error('FIRST_ADMIN_EMAIL is not set in config.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to DB');

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✓ ${user.email} is now an admin. Log in again to access /admin`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

promoteAdmin();
