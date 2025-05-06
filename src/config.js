// src/config.js
import dotenv from 'dotenv';
dotenv.config();

console.log('Loaded ZOHO_USER:', JSON.stringify(process.env.ZOHO_USER));
console.log('Loaded ZOHO_PASS:', JSON.stringify(process.env.ZOHO_PASS));

export const config = {
  mongoUri:   process.env.MONGO_URI,
  dbName:     process.env.MONGO_DB_NAME,
  geminiKey:  process.env.GEMINI_API_KEY,
  zohoUser:   process.env.ZOHO_USER,
  zohoPass:   process.env.ZOHO_PASS,
  cronSchedule: '*/2 * * * *'
};
