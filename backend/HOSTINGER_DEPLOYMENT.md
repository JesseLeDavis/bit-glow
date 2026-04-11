# Deploy BitGlow Backend to Hostinger

Step-by-step guide to deploy your Node.js contact form backend on Hostinger.

## Prerequisites

- Hostinger hosting plan with Node.js support (Business or Cloud plans)
- Your Hostinger account credentials
- Domain already set up (e.g., bitglow.dev)

## Step 1: Prepare Your Backend

### 1.1 Create Production Environment File

In your local `backend/` directory, create a `.env` file:

```env
PORT=3000
ALLOWED_ORIGINS=https://bitglow.dev,https://www.bitglow.dev
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hello@bitglow.dev
SMTP_PASS=your-email-password
CONTACT_EMAIL=hello@bitglow.dev
SEND_AUTO_REPLY=true
```

**Important**: Use Hostinger's SMTP settings to avoid email delivery issues!

## Step 2: Upload Backend to Hostinger

### Option A: Using File Manager (Easier)

1. **Log in to Hostinger hPanel**
2. Go to **Files** → **File Manager**
3. Navigate to your domain's directory (usually `public_html/bitglow.dev`)
4. Create a new folder called `api` or `backend`
5. Upload all files from your local `backend/` folder:
   - `server.js`
   - `package.json`
   - `.env`
   - `.gitignore`

### Option B: Using Git (Recommended)

1. **Enable Git in Hostinger**:
   - Go to **Advanced** → **Git**
   - Click **Create Repository**

2. **Push your code**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend setup"
   git remote add hostinger ssh://your-username@your-domain.com/~/repositories/backend.git
   git push hostinger main
   ```

## Step 3: Set Up Node.js Application in Hostinger

1. **Log in to hPanel**
2. Go to **Advanced** → **Node.js**
3. Click **Create Application**
4. Configure:
   - **Application mode**: Production
   - **Application root**: `/public_html/bitglow.dev/backend` (or your path)
   - **Application URL**: `https://api.bitglow.dev` (create subdomain first)
   - **Application startup file**: `server.js`
   - **Node.js version**: 18.x or later

5. Click **Create**

## Step 4: Create Subdomain for API

1. In hPanel, go to **Domains** → **Subdomains**
2. Click **Create Subdomain**
3. Enter: `api` (will create `api.bitglow.dev`)
4. Point it to the backend folder: `/public_html/bitglow.dev/backend`
5. Save

## Step 5: Install Dependencies

### Via Hostinger Terminal (SSH):

1. **Enable SSH** in hPanel (Advanced → SSH Access)
2. **Connect via SSH**:
   ```bash
   ssh u123456789@your-server-ip
   ```
3. **Navigate to backend**:
   ```bash
   cd domains/bitglow.dev/public_html/backend
   ```
4. **Install packages**:
   ```bash
   npm install
   ```

### Via hPanel Node.js Manager:

1. Go to **Node.js** in hPanel
2. Find your application
3. Click **Run npm install**

## Step 6: Configure Hostinger Email (SMTP)

Hostinger provides free email hosting. Set it up:

1. **Create Email Account**:
   - Go to **Emails** → **Email Accounts**
   - Create `hello@bitglow.dev`

2. **Get SMTP Settings**:
   - **Host**: `smtp.hostinger.com`
   - **Port**: `587`
   - **Username**: `hello@bitglow.dev`
   - **Password**: Your email password

3. **Update `.env`**:
   ```env
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=hello@bitglow.dev
   SMTP_PASS=your-email-password
   ```

## Step 7: Start the Application

### Via hPanel:

1. Go to **Node.js** application manager
2. Find your app
3. Click **Start Application** or **Restart Application**

### Via SSH:

```bash
cd domains/bitglow.dev/public_html/backend
node server.js
```

For persistent running, use PM2:
```bash
npm install -g pm2
pm2 start server.js --name bitglow-backend
pm2 save
pm2 startup
```

## Step 8: Update Frontend Configuration

Update your `script.js` to use the production URL:

```javascript
// Change from:
const response = await fetch('http://localhost:3000/api/contact', {

// To:
const response = await fetch('https://api.bitglow.dev/api/contact', {
```

Or use environment detection:
```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/contact'
    : 'https://api.bitglow.dev/api/contact';

const response = await fetch(API_URL, {
```

## Step 9: Test Your Backend

### Test health check:
```bash
curl https://api.bitglow.dev/health
```

Should return:
```json
{"status":"ok","message":"BitGlow backend is running"}
```

### Test contact form:
```bash
curl -X POST https://api.bitglow.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Testing the contact form!"
  }'
```

## Alternative: Deploy Backend in Main Domain Directory

If you don't want to use a subdomain, you can deploy in the same directory:

1. Upload backend to `/public_html/bitglow.dev/api/`
2. Add `.htaccess` in `/public_html/bitglow.dev/`:

```apache
# Redirect API requests to Node.js backend
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

3. Update frontend to use:
```javascript
const response = await fetch('/api/contact', {
```

## Troubleshooting

### Backend not starting?

1. **Check logs** in hPanel → Node.js → View Logs
2. **Verify dependencies** are installed: `npm list`
3. **Check port**: Hostinger might assign a different port
4. **Permissions**: Ensure `server.js` is executable

### Emails not sending?

1. **Test SMTP connection**:
   ```bash
   telnet smtp.hostinger.com 587
   ```
2. **Check email quota** in hPanel → Emails
3. **Verify credentials** in `.env`
4. **Check spam folder**

### CORS errors?

Update `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=https://bitglow.dev,https://www.bitglow.dev,https://api.bitglow.dev
```

### SSL Certificate

Hostinger provides free SSL. Enable it:
1. Go to **SSL** in hPanel
2. Install SSL for `api.bitglow.dev`
3. Force HTTPS

## File Structure on Hostinger

```
/home/u123456789/domains/bitglow.dev/
├── public_html/
│   ├── index.html          # Your main site
│   ├── script.js
│   ├── styles.css
│   └── backend/            # Backend folder
│       ├── server.js
│       ├── package.json
│       ├── .env
│       └── node_modules/
```

## Environment Variables via hPanel

Instead of `.env` file, you can set environment variables in hPanel:

1. Go to **Node.js** application
2. Click **Edit**
3. Scroll to **Environment Variables**
4. Add each variable:
   - `SMTP_HOST` = `smtp.hostinger.com`
   - `SMTP_USER` = `hello@bitglow.dev`
   - etc.

## Keeping Backend Running

Hostinger's Node.js manager keeps apps running automatically, but for extra reliability:

```bash
# Via SSH
pm2 start server.js --name bitglow-backend
pm2 startup
pm2 save
```

## Monitoring

Check if backend is running:
```bash
# Via SSH
pm2 status
pm2 logs bitglow-backend
```

Or check in hPanel → Node.js → Application Status

## Cost

- **Hostinger Business Plan**: ~$3.99/month (includes Node.js support)
- **Email Hosting**: Free with hosting
- **SSL Certificate**: Free

## Need Help?

- Hostinger Support: https://www.hostinger.com/support
- Hostinger Node.js Docs: https://support.hostinger.com/en/articles/5637743-how-to-set-up-a-node-js-application
- Contact: hello@bitglow.dev

---

**You're all set! 🚀**

Your contact form backend is now running on Hostinger with professional email delivery.
