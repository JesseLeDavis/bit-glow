# Hostinger Deployment Checklist

Print this out or keep it open while you work! Check off each box as you complete it.

---

## ☐ Part 1: Email Setup (5 min)

- [ ] Log in to Hostinger hPanel
- [ ] Go to Emails → Email Accounts
- [ ] Create `hello@bitglow.dev`
- [ ] Write down the password somewhere safe
- [ ] Test login to Webmail (optional)

**Password:** ________________

---

## ☐ Part 2: Prepare .env File (3 min)

- [ ] Open `backend` folder on your computer
- [ ] Copy `.env.example` → rename to `.env`
- [ ] Open `.env` in code editor
- [ ] Change `SMTP_USER` to: `hello@bitglow.dev`
- [ ] Change `SMTP_PASS` to: [your password]
- [ ] Change `SMTP_HOST` to: `smtp.hostinger.com`
- [ ] Save the file

---

## ☐ Part 3: Upload Files (5 min)

- [ ] hPanel → Files → File Manager
- [ ] Navigate to `public_html`
- [ ] Create new folder: `backend`
- [ ] Go inside `backend` folder
- [ ] Upload these 4 files:
  - [ ] `server.js`
  - [ ] `package.json`
  - [ ] `.env`
  - [ ] `.gitignore`

---

## ☐ Part 4: Create Subdomain (3 min)

- [ ] hPanel → Domains → Subdomains
- [ ] Click "Create Subdomain"
- [ ] Subdomain: `api`
- [ ] Domain: `bitglow.dev`
- [ ] Document Root: `/public_html/backend`
- [ ] Click Create
- [ ] Wait 1-2 minutes

---

## ☐ Part 5: Node.js Setup (5 min)

- [ ] hPanel → Advanced → Node.js
- [ ] Click "Create Application"
- [ ] Application mode: **Production**
- [ ] Application root: `/public_html/backend`
- [ ] Application URL: `https://api.bitglow.dev`
- [ ] Startup file: `server.js`
- [ ] Node.js version: **18.x** or **20.x**
- [ ] Click Create
- [ ] Click "Run npm install"
- [ ] Wait for completion (~1 min)
- [ ] Click "Start Application"
- [ ] Wait for status: "Running"

---

## ☐ Part 6: Enable SSL (2 min)

- [ ] hPanel → Security → SSL
- [ ] Find `api.bitglow.dev`
- [ ] Click "Install SSL" or toggle ON
- [ ] Select "Free SSL"
- [ ] Wait 1-2 minutes

---

## ☐ Part 7: TEST! (2 min)

**Test 1: Health Check**
- [ ] Open browser
- [ ] Go to: `https://api.bitglow.dev/health`
- [ ] See: `{"status":"ok","message":"BitGlow backend is running"}`

**Test 2: Contact Form**
- [ ] Go to your website
- [ ] Fill out contact form
- [ ] Submit
- [ ] See green success message
- [ ] Check `hello@bitglow.dev` Webmail for submission
- [ ] Check your personal email for auto-reply

---

## ☐ Part 8: Upload Updated Frontend (1 min)

- [ ] File Manager → `public_html`
- [ ] Upload updated `script.js` (replace existing)
- [ ] Test form again to confirm

---

## ✅ DONE!

**Your API:** https://api.bitglow.dev
**Your Email:** hello@bitglow.dev
**Status:** 🟢 Live

---

## If Something Goes Wrong

**Problem:** Application won't start
- [ ] Check `.env` file has correct password
- [ ] Run npm install again
- [ ] Check error logs in Node.js manager

**Problem:** Emails won't send
- [ ] Test login to Webmail with hello@bitglow.dev
- [ ] If can't log in → reset password
- [ ] Update password in `.env`
- [ ] Restart application

**Problem:** 502 Bad Gateway
- [ ] Start application in Node.js manager
- [ ] Wait 30 seconds
- [ ] Try again

**Problem:** CORS error
- [ ] Check ALLOWED_ORIGINS in `.env`
- [ ] Should be: `https://bitglow.dev,https://www.bitglow.dev`
- [ ] Restart application

---

## Need More Help?

See: `STEP_BY_STEP_HOSTINGER.md` for detailed instructions with explanations.

**Total Time:** ~25 minutes
**Difficulty:** ⭐⭐☆☆☆ (easier than it looks!)
