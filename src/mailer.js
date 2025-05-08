// src/mailer.js
import nodemailer from 'nodemailer';
import { config } from './config.js';

const { ZOHO_USER, ZOHO_PASS } = config;

// src/mailer.js
export const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: config.zohoUser,
      pass: config.zohoPass
    },
    logger: true,    // log to console
    debug:  true, 
    defaults: {
      from: `"Triad Flair" <${ZOHO_USER}>`
    }   
    // include SMTP traffic in the logs
  });
  console.log('Using Zoho user:', config.zohoUser);
  console.log('Using Zoho pass:',   config.zohoPass.replace(/./g, '*'));
  
  // Verify connection configuration
transporter.verify()
.then(() => console.log('✅ SMTP server is ready to take messages'))
.catch(err => console.error('❌ SMTP verification error:', err));
