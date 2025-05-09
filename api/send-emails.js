import { MongoClient } from 'mongodb';
import { config } from '../src/config.js';
import { generateEmailSubject, generateEmailBody } from '../src/generateEmail.js';
import { transporter } from '../src/mailer.js';
import crypto from 'crypto';

function generateEmailHash(email, services = []) {
  const normalized = [...services].sort().join(',').trim().toLowerCase();
  return crypto.createHash('sha256').update(`${email}-${normalized}`).digest('hex');
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization?.split(' ')[1];
  const authQuery = req.query.token;
  console.log('🔍 authHeader:', authHeader);
  console.log('🔍 authQuery:', authQuery);
  console.log('🔍 config.schedulerToken:', config.schedulerToken);

  if (authHeader !== config.schedulerToken && authQuery !== config.schedulerToken) {
    return res.status(401).end('Unauthorized');
  }

  let client;
  try {
    client = new MongoClient(config.mongoUri);
    await client.connect();
    const col = client.db(config.dbName).collection('user_queries');
    console.log('✅ Connected to MongoDB');

    const unsent = await col.find({ emailSent: { $ne: true } }).toArray();
    console.log('🔍 unsent count:', unsent.length);
    let sentCount = 0;

    for (const doc of unsent) {
      try {
        const hash = generateEmailHash(doc.email, doc.services || []);
        const existing = await col.findOne({ sentHash: hash });
        if (existing) {
          console.log(`⏩ Skipping ${doc.email} - same services already emailed.`);
          continue;
        }

        const subject = await generateEmailSubject(doc).catch(err => {
          console.error('❌ Failed to generate subject:', err.message);
          return 'Thanks for reaching out to Triad Flair';
        });

        const body = await generateEmailBody(doc).catch(err => {
          console.error('❌ Failed to generate body:', err.message);
          return `Hi ${doc.name},\n\nThanks for your interest in ${doc.services}. We'll follow up shortly.\n\nBest,\nTriad Flair\nhttps://www.triadflair.com/`;
        });

        await transporter.sendMail({
          from: {
            name: 'Triad Flair',
            address: config.zohoUser
          },
          envelope: {
            from: config.zohoUser,
            to: doc.email
          },
          to: doc.email,
          subject: subject,
          text: body
        });

        await col.updateOne(
          { _id: doc._id },
          { $set: { emailSent: true, sentAt: new Date(), sentHash: hash } }
        );

        sentCount++;
        console.log(`📧 Sent to ${doc.email}`);
      } catch (innerErr) {
        console.error(`❌ Failed for ${doc.email}:`, innerErr.message);
        continue;
      }
    }

    return res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error('❌ Error in send-emails handler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) await client.close();
  }
}