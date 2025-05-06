// api/send-emails.js
import { MongoClient } from 'mongodb';
import { config } from '../src/config.js';
import { generateEmailSubject, generateEmailBody } from '../src/generateEmail.js';
import { transporter } from '../src/mailer.js';

export default async function handler(req, res) {
    const auth = req.headers.authorization?.split(' ')[1];
    if (auth !== process.env.SCHEDULER_TOKEN) {
      return res.status(401).end('Unauthorized');
    }
  let client;
  try {
    // 1) Connect to MongoDB
    client = new MongoClient(config.mongoUri);
    await client.connect();
    const col = client.db(config.dbName).collection('user_queries');

    // 2) Find all docs that haven’t been emailed
    const unsent = await col.find({ emailSent: { $ne: true } }).toArray();
    let sentCount = 0;

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

      sentCount++;
      console.log(`📧 Sent to ${doc.email}`);
    }

    // 6) Return JSON so you can see the count in Vercel logs
    return res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error('❌ Error in send-emails handler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) await client.close();
  }
}
