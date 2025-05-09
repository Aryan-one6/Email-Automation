// src/config.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri:   process.env.MONGO_URI,
  dbName:     process.env.MONGO_DB_NAME,
  geminiKey:  process.env.GEMINI_API_KEY,
  zohoUser:   process.env.ZOHO_USER,
  zohoPass:   process.env.ZOHO_PASS,
  schedulerToken:  process.env.SCHEDULER_TOKEN
};
