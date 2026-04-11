# BitGlow Backend - Contact Form Server

Custom Node.js backend for handling contact form submissions from the BitGlow website.

## Features

✅ Express.js REST API
✅ Email sending via Nodemailer
✅ Rate limiting (3 submissions per 15 minutes)
✅ Input validation and sanitization
✅ Auto-reply emails to senders
✅ Beautiful HTML email templates
✅ CORS protection
✅ Environment-based configuration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your email settings.

### 3. Email Provider Setup

#### Option A: Gmail (Recommended for Testing)

1. Go to your Google Account settings
2. Enable 2-factor authentication if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Copy the 16-character password

Update your `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
CONTACT_EMAIL=hello@bitglow.dev
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Update your `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
CONTACT_EMAIL=hello@bitglow.dev
```

#### Option C: Other Providers

- **Outlook/Hotmail**: smtp.office365.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Mailgun**: smtp.mailgun.org:587
- **Amazon SES**: email-smtp.us-east-1.amazonaws.com:587

### 4. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Test the Backend

Check if the server is running:
```bash
curl http://localhost:3000/health
```

Test the contact endpoint:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the contact form."
  }'
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "BitGlow backend is running"
}
```

### `POST /api/contact`

Submit a contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss a project..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully!"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email address is required", "Message is too short"]
}
```

## Security Features

- **Rate Limiting**: 3 submissions per IP address every 15 minutes
- **Input Validation**: All fields are validated for length and format
- **CORS Protection**: Only configured origins can access the API
- **No Sensitive Data Logging**: Emails and personal info are never logged

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `ALLOWED_ORIGINS` | No | * | Comma-separated list of allowed origins |
| `SMTP_HOST` | Yes | - | SMTP server hostname |
| `SMTP_PORT` | No | 587 | SMTP server port |
| `SMTP_SECURE` | No | false | Use TLS (true for port 465) |
| `SMTP_USER` | Yes | - | SMTP username/email |
| `SMTP_PASS` | Yes | - | SMTP password/API key |
| `CONTACT_EMAIL` | No | hello@bitglow.dev | Where to send submissions |
| `SEND_AUTO_REPLY` | No | true | Send auto-reply to sender |

## Deployment

### Deploy to Production

1. **Update ALLOWED_ORIGINS** in `.env`:
   ```env
   ALLOWED_ORIGINS=https://bitglow.dev,https://www.bitglow.dev
   ```

2. **Update frontend** (`script.js`) to use production URL:
   ```javascript
   const response = await fetch('https://api.bitglow.dev/api/contact', {
   ```

### Hosting Options

#### Option 1: Hostinger (Recommended)

**See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for complete step-by-step guide.**

Quick steps:
1. Upload backend files to your Hostinger hosting
2. Create subdomain `api.bitglow.dev`
3. Set up Node.js application in hPanel
4. Configure Hostinger email (SMTP)
5. Install dependencies and start the app

Hostinger provides:
- ✅ Node.js hosting (Business plan)
- ✅ Free email with SMTP
- ✅ Free SSL certificates
- ✅ Easy deployment via hPanel or Git

#### Option 2: Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

#### Option 2: Heroku

1. Create `Procfile`:
   ```
   web: node server.js
   ```
2. Deploy:
   ```bash
   heroku create bitglow-backend
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_USER=your-email@gmail.com
   # ... set other env vars
   git push heroku main
   ```

#### Option 3: DigitalOcean App Platform

1. Connect your GitHub repo
2. Set environment variables in the dashboard
3. Deploy automatically on push

#### Option 4: VPS (DigitalOcean, Linode, AWS EC2)

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name bitglow-backend
pm2 startup
pm2 save
```

## Troubleshooting

### Emails not sending

1. **Check SMTP credentials**: Make sure `SMTP_USER` and `SMTP_PASS` are correct
2. **Gmail users**: Use an App Password, not your regular password
3. **Check spam folder**: Auto-replies might be filtered
4. **Test SMTP connection**:
   ```bash
   node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:'your-email',pass:'your-password'}}).verify().then(console.log).catch(console.error)"
   ```

### CORS errors

Make sure `ALLOWED_ORIGINS` in `.env` matches your frontend URL exactly (including protocol and port).

### Rate limiting too strict

Edit `server.js` line 17-18 to adjust limits:
```javascript
windowMs: 15 * 60 * 1000, // 15 minutes
max: 3, // Max requests per window
```

## Development

**File structure:**
```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .env               # Environment variables (create from .env.example)
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Support

For issues or questions:
- Email: hello@bitglow.dev
- Check server logs for detailed error messages
- Make sure all environment variables are set correctly

---

**Built with ❤️ for BitGlow**
