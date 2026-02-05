const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: './config.env' });

// #region agent log - startup check
const debugLogPath = path.join(__dirname, '..', '.cursor', 'debug.log');
const debugLogDir = path.dirname(debugLogPath);
if (!fs.existsSync(debugLogDir)) fs.mkdirSync(debugLogDir, { recursive: true });
fs.appendFileSync(debugLogPath, JSON.stringify({ location: 'server.js:startup', message: 'Backend server starting', timestamp: Date.now(), cwd: process.cwd(), dirname: __dirname }) + '\n');
console.log('[DEBUG] Wrote startup log to:', debugLogPath);
// #endregion

const app = require('./app');

const DB = process.env.DATABASE;

async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log('DB connected successfully');
  } catch (err) {
    console.log('Database connection error', err);
    process.exit(1);
  }
}

connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 App is running on port ${port}`);
});
