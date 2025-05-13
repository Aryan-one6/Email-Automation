# 📧 Email Automation with MongoDB + Vercel + CronJobs.org

This project automates sending personalized emails to users based on entries in a MongoDB database.

## 🚀 Tech Stack
- **Backend:** Node.js
- **Database:** MongoDB (Atlas or self-hosted)
- **Email Provider:** Zoho SMTP
- **AI:** Google Gemini API for dynamic content
- **Scheduler:** CronJobs.org (triggers Vercel endpoint)

---

## 📂 Project Structure
```
├── api/
│   └── send-emails.js        # Main API endpoint triggered by CronJobs.org
├── src/
│   ├── config.js             # Environment config loader
│   ├── generateEmail.js      # Email subject/body generation using Gemini
│   ├── mailer.js             # Nodemailer + Zoho SMTP
├── .env                      # Environment variables (never commit)
├── README.md                 # Project documentation
├── .gitignore                # Files to exclude from Git
```

---

## 🧠 How It Works
1. A user fills out a form or submits a request → saved in `user_queries` collection in MongoDB.
2. Every 5 minutes, **CronJobs.org** calls the `/api/send-emails` endpoint.
3. The endpoint:
   - Fetches entries where `emailSent: false`
   - Sends a personalized email using Gemini API + Zoho SMTP
   - Updates the document with `emailSent: true` and `sentAt`

---

## 🛡️ Environment Variables (`.env`)
```
MONGO_URI=your_mongo_connection_string
MONGO_DB_NAME=emailDB
GEMINI_API_KEY=your_gemini_api_key
ZOHO_USER=connect@triadflair.com
ZOHO_PASS=your_zoho_app_password
SCHEDULER_TOKEN=some_secure_random_token
```

---

## 🧪 Testing Locally
```bash
npm install
vercel dev
# OR
node api/send-emails.js  # Not recommended; use HTTP trigger with token
```

Use Postman or CURL:
```bash
curl https://your-vercel-app.vercel.app/api/send-emails?token=SCHEDULER_TOKEN
```

---

## 🔐 Notes
- Protects the endpoint with `SCHEDULER_TOKEN`
- Only sends **one email per email address**
- Fallback text is provided if Gemini API fails

---

## 📝 License
MIT License. Use freely, but protect your keys!

---

Need help deploying on Vercel or troubleshooting? Ping @Naresh Sharma 😉
