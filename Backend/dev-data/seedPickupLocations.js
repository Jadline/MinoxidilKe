/**
 * Seed pickup locations (Kenya - Nairobi + Mombasa).
 * Run from Backend: node dev-data/seedPickupLocations.js
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });
const PickupLocation = require('../models/pickupLocationModel');

const LOCATIONS = [
  { name: 'Jubilee Exchange building, Kaunda Street (CBD) | Nairobi', address: 'Kaunda Street, Nairobi CBD', city: 'Nairobi', country: 'Kenya', distanceKm: 0.8, costKes: 0, sortOrder: 1 },
  { name: 'Norwich Union building, Kimathi street (CBD) | Nairobi', address: 'Kimathi Street, Nairobi CBD', city: 'Nairobi', country: 'Kenya', distanceKm: 1, costKes: 0, sortOrder: 2 },
  { name: 'Adlife Plaza (Kilimani) | Nairobi', address: 'Kilimani, Nairobi', city: 'Nairobi', country: 'Kenya', distanceKm: 3.3, costKes: 0, sortOrder: 3 },
  { name: 'BBS Mall (Eastleigh) | Nairobi', address: 'Eastleigh, Nairobi', city: 'Nairobi', country: 'Kenya', distanceKm: 3.5, costKes: 0, sortOrder: 4 },
  { name: 'Nyali center (Nyali) | Mombasa', address: 'Nyali, Mombasa', city: 'Mombasa', country: 'Kenya', distanceKm: 443.7, costKes: 0, sortOrder: 5 },
];

async function seed() {
  const DB = process.env.DATABASE;
  if (!DB) {
    console.error('DATABASE not set in config.env');
    process.exit(1);
  }
  await mongoose.connect(DB);
  await PickupLocation.deleteMany({});
  await PickupLocation.insertMany(LOCATIONS);
  console.log(`Inserted ${LOCATIONS.length} pickup locations.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
