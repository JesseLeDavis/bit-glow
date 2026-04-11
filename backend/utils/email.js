const nodemailer = require('nodemailer');

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

function formatTime12(time24) {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function emailTemplate(title, bodyHtml, borderColor = '#00e5cc') {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background-color: #0a0e27; color: #d4d4d4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1f3a; border: 2px solid ${borderColor}; padding: 30px; }
        .header { color: ${borderColor}; font-size: 20px; margin-bottom: 20px; font-weight: bold; }
        .content { line-height: 1.8; }
        .detail { margin: 8px 0; }
        .label { color: #00e5cc; font-weight: bold; }
        .highlight { background-color: #0a0e27; border-left: 3px solid #ff6b35; padding: 15px; margin: 15px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid ${borderColor}; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">${title}</div>
        <div class="content">${bodyHtml}</div>
        <div class="footer">
            BitGlow Development Studio<br>
            Salem, Oregon<br>
            <a href="https://bitglow.tech" style="color: #00e5cc;">https://bitglow.tech</a>
        </div>
    </div>
</body>
</html>`;
}

async function sendBookingConfirmation(booking) {
    const transporter = createTransporter();
    const dateFormatted = formatDate(booking.date);
    const timeFormatted = `${formatTime12(booking.start_time)} – ${formatTime12(booking.end_time)} PT`;

    await transporter.sendMail({
        from: `"BitGlow" <${process.env.SMTP_USER}>`,
        to: booking.email,
        subject: `Call Booked — ${dateFormatted}`,
        text: `Hi ${booking.name},\n\nYour call has been requested!\n\nDate: ${dateFormatted}\nTime: ${timeFormatted}\nDuration: 30 minutes\n\nI'll confirm shortly. If you need to reschedule, reply to this email.\n\n— Jesse\nBitGlow`,
        html: emailTemplate('Call Request Received', `
            <p>Hi ${booking.name},</p>
            <p>Your call has been requested!</p>
            <div class="highlight">
                <div class="detail"><span class="label">Date:</span> ${dateFormatted}</div>
                <div class="detail"><span class="label">Time:</span> ${timeFormatted}</div>
                <div class="detail"><span class="label">Duration:</span> 30 minutes</div>
            </div>
            <p>I'll confirm shortly. If you need to reschedule, just reply to this email.</p>
            <p>— Jesse</p>
        `)
    });
}

async function sendBookingNotificationToOwner(booking) {
    const transporter = createTransporter();
    const dateFormatted = formatDate(booking.date);
    const timeFormatted = `${formatTime12(booking.start_time)} – ${formatTime12(booking.end_time)} PT`;

    await transporter.sendMail({
        from: `"BitGlow Scheduler" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'hello@bitglow.tech',
        replyTo: booking.email,
        subject: `New Call Request — ${booking.name} on ${dateFormatted}`,
        text: `New booking request:\n\nName: ${booking.name}\nEmail: ${booking.email}\nDate: ${dateFormatted}\nTime: ${timeFormatted}\n\nLog in to approve: ${process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'https://bitglow.tech'}/manage-bitglow.html`,
        html: emailTemplate('New Call Request', `
            <div class="detail"><span class="label">Name:</span> ${booking.name}</div>
            <div class="detail"><span class="label">Email:</span> ${booking.email}</div>
            <div class="highlight">
                <div class="detail"><span class="label">Date:</span> ${dateFormatted}</div>
                <div class="detail"><span class="label">Time:</span> ${timeFormatted}</div>
            </div>
            <p><a href="${process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'https://bitglow.tech'}/manage-bitglow.html" style="color: #ff6b35;">Open Admin Panel</a> to approve or decline.</p>
        `, '#ff6b35')
    });
}

async function sendBookingStatusUpdate(booking, status) {
    const transporter = createTransporter();
    const dateFormatted = formatDate(booking.date);
    const timeFormatted = `${formatTime12(booking.start_time)} – ${formatTime12(booking.end_time)} PT`;

    const subjects = {
        approved: `Call Confirmed — ${dateFormatted}`,
        declined: `Call Request Update — ${dateFormatted}`
    };

    const bodies = {
        approved: `
            <p>Hi ${booking.name},</p>
            <p>Your call is confirmed!</p>
            <div class="highlight">
                <div class="detail"><span class="label">Date:</span> ${dateFormatted}</div>
                <div class="detail"><span class="label">Time:</span> ${timeFormatted}</div>
                <div class="detail"><span class="label">Duration:</span> 30 minutes</div>
            </div>
            <p>I'll reach out before the call with a link or phone number. If you need to reschedule, just reply to this email.</p>
            <p>Talk soon!<br>— Jesse</p>
        `,
        declined: `
            <p>Hi ${booking.name},</p>
            <p>Unfortunately I'm unable to make the requested time:</p>
            <div class="highlight">
                <div class="detail"><span class="label">Date:</span> ${dateFormatted}</div>
                <div class="detail"><span class="label">Time:</span> ${timeFormatted}</div>
            </div>
            <p>Feel free to <a href="https://bitglow.tech/#contact" style="color: #00e5cc;">pick another time</a> or reply to this email and we'll work something out.</p>
            <p>— Jesse</p>
        `
    };

    if (!subjects[status]) return;

    await transporter.sendMail({
        from: `"BitGlow" <${process.env.SMTP_USER}>`,
        to: booking.email,
        subject: subjects[status],
        html: emailTemplate(status === 'approved' ? 'Call Confirmed' : 'Scheduling Update', bodies[status])
    });
}

module.exports = {
    sendBookingConfirmation,
    sendBookingNotificationToOwner,
    sendBookingStatusUpdate
};
