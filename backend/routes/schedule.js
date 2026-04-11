const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { getAvailableSlots, getAvailableDates, isSlotAvailable, computeEndTime } = require('../utils/availability');
const { sendBookingConfirmation, sendBookingNotificationToOwner } = require('../utils/email');

const router = express.Router();

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { success: false, error: 'Too many booking attempts. Please try again later.' }
});

// GET /api/schedule/available-dates?month=2026-04
router.get('/available-dates', (req, res) => {
    try {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

        let startDate, endDate;
        if (req.query.month) {
            const [year, month] = req.query.month.split('-').map(Number);
            startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            // If requested month's start is before today, use today
            if (startDate < todayStr) startDate = todayStr;
            const lastDay = new Date(year, month, 0).getDate();
            endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        } else {
            startDate = todayStr;
            const end = new Date(now);
            end.setDate(end.getDate() + 30);
            endDate = end.toISOString().split('T')[0];
        }

        const dates = getAvailableDates(startDate, endDate);
        res.json({ dates });
    } catch (error) {
        console.error('Error fetching available dates:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch available dates' });
    }
});

// GET /api/schedule/slots/:date
router.get('/slots/:date', (req, res) => {
    try {
        const { date } = req.params;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const slots = getAvailableSlots(date);
        res.json({ date, slots });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch time slots' });
    }
});

// POST /api/schedule/book
router.post('/book', bookingLimiter, (req, res) => {
    try {
        const { name, email, date, start_time } = req.body;
        const errors = [];

        if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
        if (name && name.length > 100) errors.push('Name is too long');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) errors.push('Valid email is required');
        if (email && email.length > 100) errors.push('Email is too long');

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Valid date is required (YYYY-MM-DD)');
        if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) errors.push('Valid start time is required (HH:MM)');

        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
        }

        // Atomically check + insert
        const book = db.transaction(() => {
            if (!isSlotAvailable(date, start_time)) {
                return null;
            }

            const end_time = computeEndTime(start_time);
            const ip = req.ip || req.connection.remoteAddress;

            const result = db.prepare(`
                INSERT INTO bookings (name, email, date, start_time, end_time, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(name.trim(), email.trim(), date, start_time, end_time, ip);

            return {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: email.trim(),
                date,
                start_time,
                end_time,
                status: 'pending'
            };
        });

        const booking = book();

        if (!booking) {
            return res.status(409).json({ success: false, error: 'This time slot is no longer available. Please choose another.' });
        }

        // Send emails (non-blocking — don't fail the booking if email fails)
        Promise.all([
            sendBookingConfirmation(booking),
            sendBookingNotificationToOwner(booking)
        ]).catch(err => console.error('Booking email error:', err));

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
});

module.exports = router;
