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
      const hash = generateEmailHash(doc.email, doc.services || []);
      const existing = await col.findOne({ sentHash: hash });
      if (existing) {
        console.log(`⏩ Skipping ${doc.email} - same services already emailed.`);
        continue;
      }

      const subject = await generateEmailSubject(doc);
      const body = await generateEmailBody(doc);

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
    }

    return res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error('❌ Error in send-emails handler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) await client.close();
  }
}


// // api/send-emails.js
// import { MongoClient } from 'mongodb';
// import { config } from '../src/config.js';
// import { generateEmailSubject, generateEmailBody } from '../src/generateEmail.js';
// import { transporter } from '../src/mailer.js';

// export default async function handler(req, res) {
//   // 1) Auth check against your schedulerToken
//    const authHeader = req.headers.authorization?.split(' ')[1];
//   const authQuery  = req.query.token;
//   console.log('🔍 authHeader:', authHeader);
//   console.log('🔍 authQuery:',  authQuery);
//   console.log('🔍 config.schedulerToken:', config.schedulerToken);

//   // allow if **either** matches
//   if (authHeader !== config.schedulerToken && authQuery !== config.schedulerToken) {
//     return res.status(401).end('Unauthorized');
//   }

//   let client;
//   try {
//     // 2) Connect to MongoDB
//     client = new MongoClient(config.mongoUri /*, you can omit useUnifiedTopology now */);
//     await client.connect();
//     const col = client.db(config.dbName).collection('user_queries');
//     console.log('✅ Connected to MongoDB');

//     // 3) Fetch unsent entries
//     const unsent = await col.find({ emailSent: { $ne: true } }).toArray();
//     console.log('🔍 unsent count:', unsent.length);
//     let sentCount = 0;

//     for (const doc of unsent) {
//       // 4) Generate content
//       const subject = await generateEmailSubject(doc);
//       const body = await generateEmailBody(doc);

//       // 5) Send via Zoho SMTP
//       await transporter.sendMail({
//         from: {
//           name:    'Triad Flair',
//           address: config.zohoUser    // "connect@triadflair.com"
//         },
//         envelope: {
//           from:    config.zohoUser,   // ensures the SMTP envelope uses the same address
//           to:      doc.email
//         },
//         to:      doc.email,
//         subject: subject,
//         text:    body
//       });

//       // 6) Mark as sent
//       await col.updateOne(
//         { _id: doc._id },
//         { $set: { emailSent: true, sentAt: new Date() } }
//       );

//       sentCount++;
//       console.log(`📧 Sent to ${doc.email}`);
//     }

//     // 7) Return count for logs
//     return res.status(200).json({ sent: sentCount });
//   } catch (err) {
//     console.error('❌ Error in send-emails handler:', err);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     if (client) await client.close();
//   }
// }