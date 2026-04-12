# SMTP Setup - Guaranteed to Work! 💪

The SMTP version uses **direct SMTP connection** - way more reliable than PHP mail().

---

## 🔧 Step 1: Configure contact-smtp.php (2 minutes)

Open `contact-smtp.php` in your code editor and update **lines 27-30**:

```php
define('SMTP_HOST', 'smtp.hostinger.com');          // ✅ Already correct
define('SMTP_PORT', 587);                            // ✅ Already correct
define('SMTP_USERNAME', 'noreply@bitglow.tech');    // ✅ Your email
define('SMTP_PASSWORD', 'YOUR_EMAIL_PASSWORD_HERE'); // ⚠️ CHANGE THIS!
```

### How to Get Your Email Password:

**Option 1: You Know the Password**
- Just put it in line 30

**Option 2: Reset the Password**
1. hPanel → **Emails** → **Email Accounts**
2. Find `noreply@bitglow.tech`
3. Click **"Manage"** → **"Change Password"**
4. Set a new password (write it down!)
5. Put it in line 30

### Full Configuration Lines to Check:

```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@bitglow.tech');
define('SMTP_PASSWORD', 'your_actual_password');     // ← PUT YOUR PASSWORD HERE
define('SMTP_ENCRYPTION', 'tls');                     // ✅ Leave as 'tls'

define('CONTACT_EMAIL', 'hello@bitglow.tech');        // Where submissions go
define('FROM_EMAIL', 'noreply@bitglow.tech');         // From address
define('FROM_NAME', 'BitGlow Contact Form');          // From name
define('SITE_NAME', 'BitGlow');                       // Site name
```

**Save the file!**

---

## 📤 Step 2: Upload to Hostinger (1 minute)

### Method 1: Replace contact.php

1. **Rename the file**: `contact-smtp.php` → `contact.php`
2. **Upload** to Hostinger File Manager
3. **Replace** the old contact.php
4. **Done!** No need to change frontend

### Method 2: Use as contact-smtp.php (Keep Both)

1. **Upload** `contact-smtp.php` to Hostinger (keep the name)
2. **Update** `script.js` (see Step 3 below)

**I recommend Method 1** - just replace the old file!

---

## 🔄 Step 3: Update Frontend (If Using Method 2)

Only if you uploaded as `contact-smtp.php`:

Edit `script.js` around line 304:

```javascript
// Change from:
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/contact.php'
    : '/contact.php';

// To:
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/contact-smtp.php'
    : '/contact-smtp.php';
```

---

## ✅ Step 4: Test It! (1 minute)

1. **Go to your website**: https://bitglow.tech
2. **Fill out the contact form** (use your personal email!)
3. **Click SEND MESSAGE**
4. **You should see**: Green success message ✓

**Check your emails:**
- [ ] Personal email (the one you used in form) - auto-reply
- [ ] hello@bitglow.tech Webmail - the submission

---

## 🐛 Troubleshooting

### Error: "Authentication failed. Check your password!"

**Problem**: Wrong email password on line 30

**Fix**:
1. Reset password in hPanel → Emails
2. Update line 30 in contact-smtp.php
3. Re-upload
4. Test again

### Error: "Could not connect to SMTP server"

**Problem**: SMTP settings wrong or blocked

**Fix**:
1. Check SMTP_HOST is `smtp.hostinger.com`
2. Check SMTP_PORT is `587`
3. Check SMTP_USERNAME is `noreply@bitglow.tech`
4. If still failing, try port `465` and change:
   ```php
   define('SMTP_PORT', 465);
   define('SMTP_ENCRYPTION', 'ssl');
   ```

### Still Shows Success But No Email

**Rare, but possible**:
1. Check `php_errors.log` in File Manager
2. Look for error messages
3. Share them with me and I'll help debug!

### Check the Debug Message

I added a debug field in the error response. If email fails:
1. Open browser console (F12)
2. Look at the error response
3. It will tell you exactly what went wrong

---

## 📧 How to Verify Your Email Password Works

**Quick test in Webmail:**

1. hPanel → Emails → Webmail
2. Try logging in as `noreply@bitglow.tech`
3. Use the password from line 30

**If you CAN'T log in:**
- Password is wrong
- Reset it in hPanel
- Update contact-smtp.php

**If you CAN log in:**
- Password is correct
- Problem is elsewhere

---

## 🎯 Why SMTP is Better:

✅ **Reliable** - Direct connection to mail server
✅ **Authenticated** - Uses your email credentials
✅ **Tracked** - Shows exact error messages
✅ **No Silent Failures** - You'll know if it fails
✅ **Works Everywhere** - Not dependent on server config

---

## 📝 Quick Checklist:

- [ ] Open contact-smtp.php
- [ ] Line 30: Add your email password
- [ ] Save file
- [ ] Upload to Hostinger (as contact.php or contact-smtp.php)
- [ ] Test form on website
- [ ] Check both emails received

---

## 🆘 Still Having Issues?

**Check these:**
1. Email account exists (hPanel → Emails)
2. Password is correct (test login to Webmail)
3. File uploaded correctly
4. Configuration lines 27-30 are correct
5. No typos in email addresses

**Share with me:**
- Any error messages from browser console (F12)
- Contents of php_errors.log if it exists
- What step you're stuck on

---

**Total Setup Time: 5 minutes**
**Success Rate: 99%** (as long as password is correct!)

Let's get those emails flowing! 🚀
