# PHP Contact Form - Super Simple Deployment

**Good news!** PHP is WAY easier than Node.js. No setup needed - just upload and it works! ✨

---

## What You Need (5 Minutes Total!)

- [x] Hostinger account (any plan - PHP works on all of them!)
- [x] Email: `hello@bitglow.tech` (create if you don't have it)
- [x] 2 files to upload

That's it!

---

## Step 1: Configure the PHP File (2 minutes)

1. **Open** `contact.php` in your code editor
2. **Find line 27** - it says:
   ```php
   define('CONTACT_EMAIL', 'hello@bitglow.tech');
   ```
3. **Make sure** that's the email where you want to receive messages
4. **Optional**: Change line 28 if you want a different "from" address:
   ```php
   define('FROM_EMAIL', 'noreply@bitglow.tech');
   ```
5. **Save** the file

**That's it for configuration!** No .env files, no environment variables. Done!

---

## Step 2: Upload to Hostinger (3 minutes)

### Option A: File Manager (Easier!)

1. **Log in** to Hostinger hPanel
2. **Click** Files → File Manager
3. **Navigate** to `public_html` (or your domain folder)
4. **Upload** these 2 files:
   - `contact.php` ← The backend
   - `script.js` ← Updated frontend (optional if you already have it)
5. **Upload** `index.html` if you haven't already

**That's it!** Your contact form now works! 🎉

### Option B: FTP (If you prefer)

1. Use FileZilla or any FTP client
2. Connect to your Hostinger account
3. Navigate to `public_html`
4. Upload `contact.php` and `script.js`
5. Done!

---

## Step 3: Create Email Account (If You Haven't)

**Skip this if you already have `hello@bitglow.tech`**

1. hPanel → **Emails** → **Email Accounts**
2. Click **Create**
3. Email: `hello` (becomes hello@bitglow.tech)
4. Password: Make one (you don't need to remember it!)
5. Click **Create**

✅ Done!

---

## Step 4: Test It! (1 minute)

1. **Go to your website**: `https://bitglow.tech`
2. **Scroll** to the contact form
3. **Fill it out** with your personal email
4. **Click** [SEND MESSAGE]
5. **You should see**: Green success message ✓

**Check your email!** You should get:
- **hello@bitglow.tech** receives the submission
- **Your personal email** receives a confirmation

---

## Troubleshooting

### "Failed to send message"

**Problem**: Email isn't sending

**Fix 1**: Check email exists
- Go to hPanel → Emails
- Make sure `hello@bitglow.tech` exists
- If not, create it (Step 3 above)

**Fix 2**: Check contact.php configuration
- Open `contact.php` on the server
- Line 27: Make sure email is correct
- Re-upload if needed

**Fix 3**: Check server email settings (rare)
- Some servers block mail() function
- Contact Hostinger support (they'll fix it in 5 min)

### "404 Not Found" on form submit

**Problem**: Can't find contact.php

**Fix**:
- Make sure `contact.php` is in the **same folder** as `index.html`
- Check filename is exactly `contact.php` (lowercase, no spaces)

### No error, but no email received

**Problem**: Email going to spam or not sent

**Fix**:
1. Check spam/junk folder
2. Check Hostinger Webmail (hPanel → Emails → Webmail)
3. Try a different "to" email in contact.php

---

## File Structure on Server

Your `public_html` folder should look like:

```
public_html/
├── index.html
├── script.js
├── styles.css
└── contact.php     ← Your new backend!
```

**That's it!** No `backend` folder needed, no Node.js, no complicated setup!

---

## Why PHP is Better for This:

✅ **Simpler** - Just upload one file
✅ **Works on any plan** - No upgrade needed
✅ **No server management** - It just works
✅ **Built-in email** - PHP mail() function included
✅ **Instant deploy** - Upload and done
✅ **Free** - No extra costs

---

## Advanced Options (Optional)

### Want to change the email design?

Open `contact.php` and look for the functions:
- `getOwnerEmailTemplate()` - Email you receive
- `getAutoReplyTemplate()` - Email sender receives

Edit the HTML inside!

### Want to disable auto-reply?

Line 29 in `contact.php`:
```php
define('SEND_AUTO_REPLY', false);  // Change true to false
```

### Want to change rate limiting?

Lines 30-31 in `contact.php`:
```php
define('RATE_LIMIT_MAX', 5);      // Allow 5 instead of 3
define('RATE_LIMIT_WINDOW', 600);  // In 10 minutes instead of 15
```

### Want to log submissions?

Line 469 in `contact.php`, uncomment this line:
```php
file_put_contents($logFile, $logEntry, FILE_APPEND);
```

---

## Testing Locally (Optional)

Want to test before deploying?

1. **Install PHP** (if you don't have it)
   - Mac: Already installed!
   - Windows: Download from php.net

2. **Start PHP server**:
   ```bash
   cd /Users/jesse/Desktop/code/personal/bit_glow
   php -S localhost:8000
   ```

3. **Open browser**: `http://localhost:8000`

4. **Test the form!**

---

## Need Help?

**Hostinger Support**: https://www.hostinger.com/support
They're really helpful and usually respond in minutes!

**Or email me**: hello@bitglow.tech (once it's working! 😄)

---

## Summary

1. ✅ Configure `contact.php` (1 line - your email)
2. ✅ Upload `contact.php` to Hostinger
3. ✅ Upload `script.js` (updated)
4. ✅ Create email account if needed
5. ✅ Test the form

**Total time: 5 minutes**
**Difficulty: ⭐☆☆☆☆ (super easy!)**

You got this! 💪
