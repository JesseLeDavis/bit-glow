require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const scheduleRoutes = require('./routes/schedule');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - prevent spam
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        error: 'Too many contact form submissions. Please try again later.'
    }
});

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Validation helper
const validateContactForm = (data) => {
    const { name, email, subject, message } = data;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email address is required');
    }

    if (!subject || subject.trim().length < 3) {
        errors.push('Subject must be at least 3 characters long');
    }

    if (!message || message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }

    // Check for max lengths to prevent abuse
    if (name.length > 100) errors.push('Name is too long');
    if (email.length > 100) errors.push('Email is too long');
    if (subject.length > 200) errors.push('Subject is too long');
    if (message.length > 5000) errors.push('Message is too long');

    return errors;
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'BitGlow backend is running' });
});

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        const validationErrors = validateContactForm(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Create email transporter
        const transporter = createTransporter();

        // Email to you (the site owner)
        const mailToOwner = {
            from: `"${name}" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || 'hello@bitglow.dev',
            replyTo: email,
            subject: `BitGlow Contact: ${subject}`,
            text: `
New contact form submission from BitGlow website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from BitGlow contact form
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background-color: #0a0e27; color: #d4d4d4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1f3a; border: 2px solid #ff6b35; padding: 30px; }
        .header { color: #ff6b35; font-size: 24px; margin-bottom: 20px; }
        .field { margin: 15px 0; }
        .label { color: #00e5cc; font-weight: bold; }
        .value { color: #d4d4d4; margin-top: 5px; }
        .message-box { background-color: #0a0e27; border-left: 3px solid #00e5cc; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ff6b35; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">📧 New Contact Form Submission</div>

        <div class="field">
            <div class="label">FROM:</div>
            <div class="value">${name}</div>
        </div>

        <div class="field">
            <div class="label">EMAIL:</div>
            <div class="value">${email}</div>
        </div>

        <div class="field">
            <div class="label">SUBJECT:</div>
            <div class="value">${subject}</div>
        </div>

        <div class="field">
            <div class="label">MESSAGE:</div>
            <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="footer">
            Sent from BitGlow contact form
        </div>
    </div>
</body>
</html>
            `
        };

        // Auto-reply to the sender (optional)
        const mailToSender = {
            from: `"BitGlow" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Thanks for contacting BitGlow!',
            text: `
Hi ${name},

Thanks for reaching out! We've received your message and will get back to you within 24 hours.

Here's a copy of what you sent:

Subject: ${subject}
Message: ${message}

Best regards,
The BitGlow Team

---
BitGlow Development Studio
Salem, Oregon
https://bitglow.dev
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background-color: #0a0e27; color: #d4d4d4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1f3a; border: 2px solid #00e5cc; padding: 30px; }
        .header { color: #00e5cc; font-size: 24px; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .message-box { background-color: #0a0e27; border-left: 3px solid #ff6b35; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #00e5cc; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Thanks for contacting BitGlow! ⚡</div>

        <div class="content">
            <p>Hi ${name},</p>
            <p>Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p>
            <p><strong>Here's a copy of what you sent:</strong></p>

            <div class="message-box">
                <strong>Subject:</strong> ${subject}<br><br>
                <strong>Message:</strong><br>
                ${message.replace(/\n/g, '<br>')}
            </div>

            <p>Best regards,<br>The BitGlow Team</p>
        </div>

        <div class="footer">
            BitGlow Development Studio<br>
            Salem, Oregon<br>
            <a href="https://bitglow.dev" style="color: #00e5cc;">https://bitglow.dev</a>
        </div>
    </div>
</body>
</html>
            `
        };

        // Save to database
        try {
            const ip = req.ip || req.connection.remoteAddress;
            db.prepare(`
                INSERT INTO contacts (name, email, subject, message, ip_address)
                VALUES (?, ?, ?, ?, ?)
            `).run(name, email, subject, message, ip);
        } catch (dbError) {
            console.error('Error saving contact to DB:', dbError);
            // Don't fail the request if DB save fails — email is the priority
        }

        // Send both emails
        await transporter.sendMail(mailToOwner);

        // Send auto-reply (optional - can be disabled)
        if (process.env.SEND_AUTO_REPLY !== 'false') {
            await transporter.sendMail(mailToSender);
        }

        res.json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later or email us directly at hello@bitglow.dev'
        });
    }
});

// Schedule & Admin routes
app.use('/api/schedule', scheduleRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ BitGlow backend server running on port ${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ Contact endpoint: http://localhost:${PORT}/api/contact`);
});
