// api/send-emails.js
import { MongoClient } from 'mongodb';
import { config } from '../src/config.js';
import { generateEmailSubject, generateEmailBody } from '../src/generateEmail.js';
import { transporter } from '../src/mailer.js';

export default async function handler(req, res) {
  // 1) Auth check against your schedulerToken
  const authHeader = req.headers.authorization?.split(' ')[1];
  const authQuery  = req.query.token;
  console.log('🔍 authHeader:', authHeader);
  console.log('🔍 authQuery:',  authQuery);
  console.log('🔍 config.schedulerToken:', config.schedulerToken);

  if (authHeader !== config.schedulerToken && authQuery !== config.schedulerToken) {
    return res.status(401).end('Unauthorized');
  }

  let client;
  let sentCount = 0;
  try {
    // 2) Connect to MongoDB
    client = new MongoClient(config.mongoUri);
    await client.connect();
    const col = client.db(config.dbName).collection('user_queries');
    console.log('✅ Connected to MongoDB');

    // 3) Atomically claim and process one record per invocation
    const batchSize = 1;
    while (sentCount < batchSize) {
      // Find and mark in one atomic operation
      const result = await col.findOneAndUpdate(
        { emailSent: { $ne: true } },
        { $set: { emailSent: true, sentAt: new Date() } },
        { returnDocument: 'before' }
      );
      const doc = result.value;
      if (!doc) break;

      // 4) Generate content
      const subject = await generateEmailSubject(doc);
      const body    = await generateEmailBody(doc);

      // 5) Send via Zoho SMTP
      await transporter.sendMail({
        from: { name: 'Triad Flair', address: config.zohoUser },
        envelope: { from: config.zohoUser, to: doc.email },
        to: doc.email,
        subject,
        text: body
      });

      console.log(`📧 Sent to ${doc.email}`);
      sentCount++;
    }

    // 6) Return count for logs
    return res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error('❌ Error in send-emails handler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) await client.close();
  }
}
