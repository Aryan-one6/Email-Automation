// src/index.js
import { MongoClient } from 'mongodb';
import cron from 'node-cron';
// api/send-emails.js
import { config } from './config.js';
import { generateEmailSubject, generateEmailBody } from './generateEmail.js';
import { transporter } from './mailer.js';

async function startPolling() {
  // 1) Connect to MongoDB
  const client = new MongoClient(config.mongoUri, { useUnifiedTopology: true });
  await client.connect();
  const col = client.db(config.dbName).collection('user_queries');
  console.log('✅ Connected to MongoDB, polling every 5 minutes…');

  // 2) Schedule the job
  cron.schedule(config.cronSchedule, async () => {
    try {
      // Find all docs that haven’t been emailed yet
      const unsent = await col.find({ emailSent: { $ne: true } }).toArray();
      for (const doc of unsent) {
        // 3) Generate subject & body
        const subject = await generateEmailSubject(doc);
        const body    = await generateEmailBody(doc);

        // 4) Send via Zoho SMTP
        await transporter.sendMail({
          from:    config.zohoUser,
          to:      doc.email,
          subject,
          text:    body,
        });

        // 5) Mark as sent
        await col.updateOne(
          { _id: doc._id },
          { $set: { emailSent: true, sentAt: new Date() } }
        );

        console.log(`📧 Sent to ${doc.email}`);
      }
    } catch (err) {
      console.error('Error in polling job:', err);
    }
  });
}

startPolling().catch(err => {
  console.error('Fatal error starting mailer:', err);
  process.exit(1);
});
