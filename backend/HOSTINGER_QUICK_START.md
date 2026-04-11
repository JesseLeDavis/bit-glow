# Hostinger Quick Start Guide

## 1. Prerequisites

- Hostinger Business plan or higher (for Node.js support)
- Domain: `bitglow.dev`
- Email account created: `hello@bitglow.dev`

## 2. Hostinger Email Settings

Add these to your `.env` file:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hello@bitglow.dev
SMTP_PASS=your_email_password
CONTACT_EMAIL=hello@bitglow.dev
```

**Where to find your email password:**
- Log in to Hostinger hPanel
- Go to **Emails** → **Email Accounts**
- If you forgot password, click **Manage** → **Change Password**

## 3. Upload to Hostinger

### Via File Manager:

1. Log in to hPanel
2. Go to **Files** → **File Manager**
3. Navigate to `public_html/`
4. Create folder: `backend`
5. Upload all files:
   - `server.js`
   - `package.json`
   - `.env` (with your settings!)

### Via Git:

```bash
git init
git add .
git commit -m "Backend setup"
git remote add hostinger ssh://u123456@srv123.hostinger.com/~/public_html/backend
git push hostinger main
```

## 4. Create API Subdomain

1. hPanel → **Domains** → **Subdomains**
2. Create: `api` → `api.bitglow.dev`
3. Point to: `/public_html/backend`
4. Enable SSL (automatic with Hostinger)

## 5. Set Up Node.js App

1. hPanel → **Advanced** → **Node.js**
2. Click **Create Application**
3. Settings:
   - **Mode**: Production
   - **Root**: `/public_html/backend`
   - **URL**: `https://api.bitglow.dev`
   - **Startup file**: `server.js`
   - **Node version**: 18.x or 20.x
4. Click **Create**
5. Click **Run npm install**
6. Click **Start Application**

## 6. Test

Visit: `https://api.bitglow.dev/health`

Should see:
```json
{"status":"ok","message":"BitGlow backend is running"}
```

## 7. Update Frontend

Your `script.js` is already configured to auto-detect:
- Development: `http://localhost:3000/api/contact`
- Production: `https://api.bitglow.dev/api/contact`

Just upload your site and it will work!

## Common Issues

### "Cannot find module"
- Solution: Run `npm install` in hPanel Node.js manager

### "Port already in use"
- Solution: Hostinger assigns ports automatically, don't worry about it

### Emails not sending
- Solution: Double-check `.env` has correct email password
- Test: Send email from hPanel → Emails → Webmail

### 502 Bad Gateway
- Solution: App not started. Go to hPanel → Node.js → Start Application

## File Structure on Server

```
/public_html/
├── index.html
├── script.js
├── styles.css
└── backend/
    ├── server.js
    ├── package.json
    ├── .env
    └── node_modules/
```

## Support

- Full guide: `HOSTINGER_DEPLOYMENT.md`
- Hostinger support: https://www.hostinger.com/support
- Email: hello@bitglow.dev

---

**Total setup time: ~15 minutes** ⚡
