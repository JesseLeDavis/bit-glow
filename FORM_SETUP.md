# Contact Form Setup Guide

Your contact form is ready! You just need to connect it to a backend service to receive the form submissions.

## Quick Setup Options

### Option 1: Formspree (Recommended - Easiest)

**Free tier:** 50 submissions/month

1. Go to https://formspree.io/
2. Sign up for a free account
3. Create a new form
4. Copy your form endpoint (looks like: `https://formspree.io/f/xyzabc123`)
5. Open `script.js`
6. Find line 303: `const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {`
7. Replace `YOUR_FORM_ID` with your actual form ID

**Done!** Form will now send emails to the address you used to sign up.

---

### Option 2: Netlify Forms (If hosting on Netlify)

**Free tier:** 100 submissions/month

1. In your `index.html`, find the form tag (line 199)
2. Add `data-netlify="true"` to the form:
   ```html
   <form id="contact-form" class="contact-form" data-netlify="true">
   ```
3. Deploy to Netlify
4. Go to your Netlify dashboard → Forms
5. You'll receive emails for each submission

**Note:** Remove or comment out the JavaScript form handling in `script.js` if using Netlify Forms.

---

### Option 3: Web3Forms (No account needed)

**Free tier:** Unlimited

1. Go to https://web3forms.com/
2. Enter your email and get an access key
3. In `index.html`, add a hidden input to your form:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
   ```
4. In `script.js`, change the fetch URL (line 303) to:
   ```javascript
   const response = await fetch('https://api.web3forms.com/submit', {
   ```

---

### Option 4: Your Own Backend

If you want full control, you can create your own backend:

**Using Node.js + Express:**

```javascript
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Configure nodemailer with your email service
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email provider
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
        }
    });

    const mailOptions = {
        from: email,
        to: 'hello@bitglow.dev',
        subject: `BitGlow Contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

Then update `script.js` line 303 to:
```javascript
const response = await fetch('http://localhost:3000/api/contact', {
```

---

## Testing the Form

1. Fill out all fields
2. Click [SEND MESSAGE]
3. You should see either:
   - ✓ Success message (green)
   - ✗ Error message (orange)

**If using Formspree:**
- First submission goes to a verification page
- Subsequent submissions work automatically

---

## Alternative: Simple Mailto Link

If you don't want to set up a backend at all, you can replace the form with a simple mailto link:

```html
<a href="mailto:hello@bitglow.dev?subject=Project Inquiry" class="submit-btn" style="display: inline-block; text-align: center; text-decoration: none;">
    [SEND EMAIL]
</a>
```

This opens the user's default email client. Simple but works everywhere.

---

## Recommended: Formspree

For most use cases, **Formspree** is the best choice:
- ✅ Free tier is generous (50/month)
- ✅ No coding required
- ✅ Spam protection included
- ✅ Email notifications
- ✅ Works immediately
- ✅ Can upgrade later if needed

Just sign up and add your form ID to `script.js` - takes 2 minutes!

---

## Current Status

Right now the form will show an error when submitted because `YOUR_FORM_ID` needs to be replaced with a real endpoint.

Choose one of the options above and follow the steps to activate your contact form.
