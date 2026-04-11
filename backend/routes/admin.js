const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { sendBookingStatusUpdate } = require('../utils/email');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, error: 'Too many login attempts. Please try again later.' }
});

// ─── Auth ────────────────────────────────────────────────

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, error: 'Password is required' });
        }

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) {
            return res.status(500).json({ success: false, error: 'Admin not configured' });
        }

        const match = await bcrypt.compare(password, hash);
        if (!match) {
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }

        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

router.post('/verify', requireAdmin, (req, res) => {
    res.json({ valid: true });
});

// ─── Bookings ────────────────────────────────────────────

router.get('/bookings', requireAdmin, (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM bookings';
        let countQuery = 'SELECT COUNT(*) as total FROM bookings';
        const params = [];
        const countParams = [];

        if (status) {
            query += ' WHERE status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
            countParams.push(status);
        }

        query += ' ORDER BY date DESC, start_time DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const bookings = db.prepare(query).all(...params);
        const { total } = db.prepare(countQuery).get(...countParams);

        res.json({ bookings, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

router.patch('/bookings/:id', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const updates = [];
        const params = [];

        if (status) {
            const validStatuses = ['pending', 'approved', 'declined', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, error: 'Invalid status' });
            }
            updates.push('status = ?');
            params.push(status);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No updates provided' });
        }

        updates.push("updated_at = datetime('now')");
        params.push(id);

        db.prepare(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

        // Send status email if approved or declined
        if (status === 'approved' || status === 'declined') {
            sendBookingStatusUpdate(updated, status).catch(err => console.error('Status email error:', err));
        }

        res.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ success: false, error: 'Failed to update booking' });
    }
});

router.delete('/bookings/:id', requireAdmin, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, error: 'Failed to delete booking' });
    }
});

// ─── Contacts ────────────────────────────────────────────

router.get('/contacts', requireAdmin, (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM contacts';
        let countQuery = 'SELECT COUNT(*) as total FROM contacts';
        const params = [];
        const countParams = [];

        if (status) {
            query += ' WHERE status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
            countParams.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const contacts = db.prepare(query).all(...params);
        const { total } = db.prepare(countQuery).get(...countParams);

        res.json({ contacts, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
    }
});

router.patch('/contacts/:id', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'read', 'archived'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status. Use: new, read, archived' });
        }

        const result = db.prepare("UPDATE contacts SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
        }

        const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
        res.json({ success: true, contact: updated });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ success: false, error: 'Failed to update contact' });
    }
});

router.delete('/contacts/:id', requireAdmin, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, error: 'Failed to delete contact' });
    }
});

// ─── Availability ────────────────────────────────────────

router.get('/availability', requireAdmin, (req, res) => {
    try {
        const overrides = db.prepare('SELECT * FROM availability_overrides ORDER BY date ASC, start_time ASC').all();
        res.json({ overrides });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch availability' });
    }
});

router.post('/availability', requireAdmin, (req, res) => {
    try {
        const { date, day_of_week, start_time, end_time, is_blocked = 1, reason } = req.body;

        if (!date && day_of_week === undefined) {
            return res.status(400).json({ success: false, error: 'Either date or day_of_week is required' });
        }

        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, error: 'Invalid date format' });
        }

        if (day_of_week !== undefined && (day_of_week < 0 || day_of_week > 6)) {
            return res.status(400).json({ success: false, error: 'day_of_week must be 0-6' });
        }

        const result = db.prepare(`
            INSERT INTO availability_overrides (date, day_of_week, start_time, end_time, is_blocked, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(date || null, day_of_week ?? null, start_time || null, end_time || null, is_blocked ? 1 : 0, reason || null);

        const override = db.prepare('SELECT * FROM availability_overrides WHERE id = ?').get(result.lastInsertRowid);
        res.json({ success: true, override });
    } catch (error) {
        console.error('Error creating override:', error);
        res.status(500).json({ success: false, error: 'Failed to create availability override' });
    }
});

router.delete('/availability/:id', requireAdmin, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM availability_overrides WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Override not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting override:', error);
        res.status(500).json({ success: false, error: 'Failed to delete override' });
    }
});

// ─── Stats ───────────────────────────────────────────────

router.get('/stats', requireAdmin, (req, res) => {
    try {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get().count;
        const weekBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE date >= ?").get(weekAgoStr).count;
        const unreadContacts = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'new'").get().count;
        const nextBooking = db.prepare("SELECT * FROM bookings WHERE date >= ? AND status IN ('pending', 'approved') ORDER BY date ASC, start_time ASC LIMIT 1").get(todayStr);

        res.json({
            pendingBookings,
            weekBookings,
            unreadContacts,
            nextBooking: nextBooking || null
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

module.exports = router;
