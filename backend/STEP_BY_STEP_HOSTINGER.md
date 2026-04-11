# Step-by-Step Hostinger Deployment (Beginner-Friendly)

Don't worry! This looks like a lot, but each step is really simple. Just follow along and you'll have it working in about 20 minutes.

## Before We Start

**What you need:**
- [ ] Hostinger account (you already have this!)
- [ ] Domain: bitglow.dev (you have this too!)
- [ ] Your Hostinger login details
- [ ] 20 minutes of time

**Important**: Take your time. You can't break anything! If something doesn't work, we can always undo it.

---

## Part 1: Check Your Hostinger Plan (2 minutes)

Node.js only works on certain Hostinger plans. Let's check:

1. **Log in to Hostinger**: https://hpanel.hostinger.com
2. Look at the top - you'll see your plan name
3. **Do you have one of these?**
   - ✅ Business
   - ✅ Cloud Startup
   - ✅ Cloud Professional
   - ✅ Cloud Enterprise

**If you have "Premium" or "Single":**
- You'll need to upgrade to Business ($3.99/month)
- Click "Upgrade" in hPanel
- Choose "Business" plan

**If you're not sure, that's okay!** We can try the next steps anyway and see what happens.

---

## Part 2: Create Your Email Account (5 minutes)

We need an email address that the contact form will send to.

### Step 2.1: Create the Email

1. In hPanel, look at the left sidebar
2. Click **"Emails"**
3. Click **"Email Accounts"**
4. Click the big blue **"Create"** or **"+ Create Email Account"** button
5. Fill in:
   - **Email**: `hello` (it will auto-add @bitglow.dev)
   - **Password**: Make a strong password (write it down!)
   - **Mailbox size**: 1 GB is fine
6. Click **"Create"**

✅ **You should now see**: `hello@bitglow.dev` in your email list

### Step 2.2: Test the Email (Optional but Recommended)

1. Click **"Webmail"** next to your new email
2. Log in with: `hello@bitglow.dev` and your password
3. Try sending yourself a test email
4. If it works, great! If not, that's okay - we'll troubleshoot later

### Step 2.3: Write Down Your Settings

**Grab a piece of paper or a note on your phone and write:**

```
SMTP_USER: hello@bitglow.dev
SMTP_PASS: [the password you just created]
```

You'll need this in a few minutes!

---

## Part 3: Prepare Your Backend Files (3 minutes)

### Step 3.1: Create Your .env File

On your computer, open the `backend` folder in your code editor.

1. You should see a file called `.env.example`
2. **Make a copy** of it and name it `.env` (without "example")
3. Open `.env` in your editor
4. **Replace the values** with these:

```env
# Server Configuration
PORT=3000

# CORS - Who can access your API
ALLOWED_ORIGINS=https://bitglow.dev,https://www.bitglow.dev,https://api.bitglow.dev

# Email Configuration - USE HOSTINGER SETTINGS!
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hello@bitglow.dev
SMTP_PASS=YOUR_PASSWORD_FROM_STEP_2

# Where to send contact form submissions
CONTACT_EMAIL=hello@bitglow.dev

# Auto-reply to people who contact you
SEND_AUTO_REPLY=true
```

**IMPORTANT**: Replace `YOUR_PASSWORD_FROM_STEP_2` with the actual password you wrote down!

4. **Save the file**

✅ **Check**: You should now have both `.env.example` AND `.env` in your backend folder

### Step 3.2: What Files to Upload

You're going to upload these files to Hostinger:
- [ ] `server.js`
- [ ] `package.json`
- [ ] `.env` (the one you just created!)
- [ ] `.gitignore`

**Don't upload**: `.env.example`, the README files, or setup scripts. We don't need those on the server.

---

## Part 4: Upload to Hostinger (5 minutes)

### Step 4.1: Open File Manager

1. In hPanel (left sidebar), click **"Files"**
2. Click **"File Manager"**
3. A new tab will open - this is like "Finder" or "File Explorer" but for your website

### Step 4.2: Navigate to Your Website Folder

1. You'll see folders like `public_html`, `domains`, etc.
2. Double-click **`public_html`**
3. You should see your website files: `index.html`, `script.js`, `styles.css`

**If you DON'T see your website files:**
- Look for a folder called `bitglow.dev` or similar
- Double-click it
- NOW you should see your website files

### Step 4.3: Create Backend Folder

1. Click the **"+ New Folder"** button (top area)
2. Name it: `backend` (lowercase!)
3. Click **"Create"**
4. **Double-click** the new `backend` folder to go inside it

✅ **Check**: The path at the top should end with `.../public_html/backend`

### Step 4.4: Upload Backend Files

1. Click the **"Upload Files"** button
2. A dialog will appear
3. **Drag and drop** OR click to select these 4 files from your computer:
   - `server.js`
   - `package.json`
   - `.env`
   - `.gitignore`
4. Wait for upload to complete (should be instant - files are tiny!)

✅ **Check**: You should now see all 4 files listed in the backend folder

**Screenshot in your mind**: Your File Manager should show:
```
public_html/
├── index.html
├── script.js
├── styles.css
└── backend/
    ├── server.js
    ├── package.json
    ├── .env
    └── .gitignore
```

---

## Part 5: Create API Subdomain (3 minutes)

This creates `api.bitglow.dev` for your backend.

### Step 5.1: Go to Subdomains

1. Close the File Manager tab
2. Back in hPanel, look at the left sidebar
3. Click **"Domains"**
4. Click **"Subdomains"**

### Step 5.2: Create the Subdomain

1. Click **"Create Subdomain"** button
2. Fill in:
   - **Subdomain**: `api` (lowercase!)
   - **Domain**: `bitglow.dev` (select from dropdown)
   - **Document Root**: `/public_html/backend`
3. Click **"Create"**

✅ **Check**: You should see `api.bitglow.dev` in your subdomains list

**Wait 1-2 minutes** for DNS to update. Grab a coffee!

---

## Part 6: Set Up Node.js Application (5 minutes)

This is the part that might seem scary, but it's just filling in a form!

### Step 6.1: Open Node.js Manager

1. In hPanel (left sidebar), click **"Advanced"**
2. Look for **"Node.js"** and click it
3. You'll see a page that might be empty or have a "Create Application" button

**If you see an error like "Not available on your plan":**
- Your plan doesn't support Node.js
- You'll need to upgrade to Business plan
- OR consider using Formspree instead (see original FORM_SETUP.md)

### Step 6.2: Create the Application

1. Click **"Create Application"** (big blue button)
2. A form appears - fill it in **EXACTLY** like this:

**Application mode:**
- Select: **Production** (not Development)

**Application root:**
- Enter: `/public_html/backend`
- (If you see a folder picker, navigate to select the backend folder)

**Application URL:**
- Enter: `https://api.bitglow.dev`
- (If dropdown, select api.bitglow.dev)

**Application startup file:**
- Enter: `server.js`

**Node.js version:**
- Select: **18.x** or **20.x** (latest available)

**Passenger log file location:** (if asked)
- Leave as default

3. Click **"Create"** button at the bottom

✅ **Check**: You should see your new application in the list

### Step 6.3: Install Dependencies

Your app needs to download some code libraries. This is like installing apps on your phone.

1. Find your application in the list
2. Look for a button that says **"Run npm install"** or **"Install Dependencies"**
3. Click it
4. Wait 30-60 seconds while it installs (you'll see a loading spinner)

✅ **Check**: When done, you should see "npm install completed" or similar

**If you don't see that button:**
- Look for **"Actions"** or **"..."** menu
- OR look for **"Edit"** → then find "Run npm install"

### Step 6.4: Start the Application

1. Look for **"Start Application"** or **"Restart Application"** button
2. Click it
3. Wait 10-20 seconds

✅ **Check**: The status should change to **"Running"** or show a green indicator

---

## Part 7: Enable SSL (2 minutes)

This adds the "https" lock icon to your API.

### Step 7.1: Install SSL Certificate

1. In hPanel sidebar, click **"Security"**
2. Click **"SSL"**
3. Find `api.bitglow.dev` in the list
4. Click **"Install SSL"** or toggle the SSL switch to ON
5. Select **"Free SSL"** if asked
6. Wait 1-2 minutes for installation

✅ **Check**: You should see a green checkmark next to api.bitglow.dev

**Hostinger usually does this automatically!** If api.bitglow.dev already has a checkmark, you're good!

---

## Part 8: TEST EVERYTHING! (2 minutes)

### Test 8.1: Check API Health

1. Open a new browser tab
2. Go to: `https://api.bitglow.dev/health`
3. **You should see:**
   ```json
   {"status":"ok","message":"BitGlow backend is running"}
   ```

**If you see that** → 🎉 YOUR BACKEND IS WORKING!

**If you see an error:**
- Wait 2 more minutes (server might still be starting)
- Try again
- Still broken? See "Troubleshooting" below

### Test 8.2: Test Contact Form

1. Open your website: `https://bitglow.dev`
2. Scroll to the contact form
3. Fill it out with:
   - Name: Test User
   - Email: your-personal-email@gmail.com (use your real email!)
   - Subject: Testing
   - Message: Testing the contact form!
4. Click **[SEND MESSAGE]**

**What should happen:**
1. Button shows "Sending..."
2. Green success message appears
3. You receive 2 emails:
   - One at `hello@bitglow.dev` (the submission)
   - One at your personal email (auto-reply confirmation)

**Check both emails!** Log into Hostinger Webmail to check hello@bitglow.dev

---

## Part 9: Update Your Frontend (1 minute)

Good news! I already updated your `script.js` to auto-detect the environment, so it will automatically use `https://api.bitglow.dev/api/contact` when you deploy.

### Just upload your updated files:

1. Go back to File Manager
2. Navigate to `public_html` (where index.html is)
3. Upload your updated `script.js` (drag and drop to replace)
4. That's it!

---

## 🎉 YOU'RE DONE!

Your contact form is now live and working with your own backend!

**What you accomplished:**
- ✅ Set up professional email hosting
- ✅ Deployed a Node.js backend server
- ✅ Created API subdomain with SSL
- ✅ Configured SMTP for email delivery
- ✅ Made your website fully functional

**Pretty cool, right?**

---

## Troubleshooting

### "Application failed to start"

**Check 1**: Did you upload `.env` file?
- Go to File Manager → backend folder
- Make sure `.env` is there
- Open it and verify your password is correct

**Check 2**: Install dependencies
- Go to Node.js manager
- Click "Run npm install" again
- Wait for completion
- Click "Restart Application"

**Check 3**: Check the logs
- In Node.js manager, click your app
- Look for "View Logs" or "Error Log"
- Share the last few lines if you need help

### "Cannot send emails" / "SMTP error"

**Check 1**: Email credentials
- Log in to Hostinger Webmail with hello@bitglow.dev
- If you can't log in, your password is wrong
- Reset password in hPanel → Emails

**Check 2**: Check .env file
- File Manager → backend → .env
- Right-click → Edit
- Make sure SMTP_PASS has the correct password
- Save
- Restart application in Node.js manager

### "502 Bad Gateway" or "Service Unavailable"

- Application isn't running
- Go to Node.js manager
- Click "Start Application"
- Wait 30 seconds and try again

### "CORS error" in browser console

- Check ALLOWED_ORIGINS in .env file
- Make sure it includes your domain exactly:
  ```
  ALLOWED_ORIGINS=https://bitglow.dev,https://www.bitglow.dev
  ```
- Restart application

### Still stuck?

**Don't panic!** Here's what to do:

1. **Take a screenshot** of the error
2. **Check the Node.js error logs** in hPanel
3. **Email me** the details and I'll help debug

**Or consider the simpler option:**
- Use Formspree instead (see FORM_SETUP.md)
- Free, no server needed, works in 2 minutes
- Just replace the form endpoint

---

## Quick Reference

**Your Settings:**
- API URL: `https://api.bitglow.dev`
- Health Check: `https://api.bitglow.dev/health`
- Contact Endpoint: `https://api.bitglow.dev/api/contact`
- Email: `hello@bitglow.dev`
- SMTP: `smtp.hostinger.com:587`

**Where Things Are:**
- Backend files: `/public_html/backend`
- Node.js manager: hPanel → Advanced → Node.js
- Email manager: hPanel → Emails
- File manager: hPanel → Files

**Common Commands:**
- Restart backend: Node.js manager → Restart Application
- Check logs: Node.js manager → View Logs
- Check email: hPanel → Emails → Webmail

---

You got this! 💪
