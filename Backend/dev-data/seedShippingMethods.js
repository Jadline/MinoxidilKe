/**
 * Seed shipping methods for Kenya (Nairobi + regions), Uganda, Tanzania.
 * Run from Backend: node dev-data/seedShippingMethods.js
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });
const ShippingMethod = require('../models/shippingMethodModel');

const METHODS = [
  // Nairobi (from screenshots)
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi CBD', description: 'CBD', costKes: 100, sortOrder: 1 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi - Kilimani', description: 'Kilimani', costKes: 200, sortOrder: 2 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi - Super Metro', description: 'Around Nairobi', costKes: 250, sortOrder: 3 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi - Pickup Mtaani', description: 'Around Nairobi', costKes: 300, sortOrder: 4 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 1 (Ngong Road) - (Juja Road) - (Mombasa Road)', description: 'SouthC/SouthB/Parklands/Westlands/Kileleshwa/Adams Arcade/Lavington/Upperhill/Mbagathi/Ngumo/Kibera/Pangani/Eastleigh', costKes: 300, sortOrder: 5 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 2 (Ngong road) - (Outer ring road) - (Langata road) - (Waiyaki way)', description: 'Junction mall/Langata/Buruburu/Umoja/Ridgeways-Muthaiga', costKes: 400, sortOrder: 6 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 5 - Mombasa Road, Thika Road, Runda, Mirema Drive, Komarock, Donholm', description: '', costKes: 500, sortOrder: 7 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 7 - Ruaka & Ruiru - By Wells Fargo Courier', description: '', costKes: 520, sortOrder: 8 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 3 (Ngong Rd) - (Kiambu Rd) - (Mombasa Rd) - (Langata Rd) - (Waiyaki way) - (Thika Rd)', description: 'Karen, Dagoretti Corner, Kinoo, Zimmerman, Kasarani', costKes: 600, sortOrder: 9 },
  { country: 'Kenya', region: 'Nairobi', city: 'Nairobi', name: 'Nairobi 4 (Ngong Rd) - (Kiambu Rd)', description: 'Utawala, Mlolongo, Syokimau', costKes: 1500, sortOrder: 10 },
  // Kenya other cities (flat rate by city name)
  { country: 'Kenya', region: 'Central', city: 'Thika', name: 'Thika', description: 'Central', costKes: 350, sortOrder: 21 },
  { country: 'Kenya', region: 'Central', city: "Murang'a", name: "Murang'a", description: 'Central', costKes: 370, sortOrder: 22 },
  { country: 'Kenya', region: 'Central', city: 'Nyeri', name: 'Nyeri', description: 'Central', costKes: 400, sortOrder: 23 },
  { country: 'Kenya', region: 'Central', city: 'Kiambu', name: 'Kiambu', description: 'Central', costKes: 330, sortOrder: 24 },
  { country: 'Kenya', region: 'Coast', city: 'Mombasa', name: 'Mombasa', description: 'Coast', costKes: 500, sortOrder: 30 },
  { country: 'Kenya', region: 'Rift Valley', city: 'Nakuru', name: 'Nakuru', description: 'Rift Valley', costKes: 400, sortOrder: 40 },
  { country: 'Kenya', region: 'Nyanza', city: 'Kisumu', name: 'Kisumu', description: 'Nyanza', costKes: 450, sortOrder: 50 },
  // Uganda
  { country: 'Uganda', region: 'Kampala', city: 'Kampala', name: 'Uganda - Mash Poa', description: '', costKes: 900, sortOrder: 1 },
  { country: 'Uganda', region: 'Kampala', city: 'Kampala', name: 'Kampala - Standard', description: '', costKes: 850, sortOrder: 2 },
  // Tanzania
  { country: 'Tanzania', region: 'Dar es Salaam', city: 'Dar es Salaam', name: 'Tanzania - By Border line courier', description: '', costKes: 1100, sortOrder: 1 },
  { country: 'Tanzania', region: 'Dar es Salaam', city: 'Dar es Salaam', name: 'Dar es Salaam - Standard', description: '', costKes: 1050, sortOrder: 2 },
];

async function seed() {
  const DB = process.env.DATABASE;
  if (!DB) {
    console.error('DATABASE not set in config.env');
    process.exit(1);
  }
  await mongoose.connect(DB);
  await ShippingMethod.deleteMany({});
  await ShippingMethod.insertMany(METHODS);
  console.log(`Inserted ${METHODS.length} shipping methods.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
