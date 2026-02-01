/**
 * Set a new password (and promote to admin) for the user with FIRST_ADMIN_EMAIL.
 * Use when you can't remember the password for your admin account.
 * Run from Backend folder: node dev-data/setAdminPassword.js "YourNewPassword"
 * (Password must be at least 8 characters.)
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });
const User = require('../models/userModel');

async function setAdminPassword() {
  const newPassword = process.argv[2];
  if (!newPassword || newPassword.length < 8) {
    console.error('Usage: node dev-data/setAdminPassword.js "YourNewPassword"');
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const email = (process.env.FIRST_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.error('FIRST_ADMIN_EMAIL is not set in config.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin', password: hashedPassword } },
      { new: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✓ Password updated and ${user.email} is an admin.`);
    console.log('  Log in with that email and the new password you just set.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setAdminPassword();
