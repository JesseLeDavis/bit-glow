const db = require('../db');

// Default schedule: Mon-Fri, 9:00-17:00, 30-min slots
const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';
const SLOT_DURATION = 30; // minutes
const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon=1 ... Fri=5
const BOOKING_BUFFER_HOURS = 1; // minimum hours ahead to book

function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + SLOT_DURATION <= end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const nextH = Math.floor((current + SLOT_DURATION) / 60);
        const nextM = (current + SLOT_DURATION) % 60;
        slots.push({
            start: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            end: `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`
        });
        current += SLOT_DURATION;
    }
    return slots;
}

function getDefaultSlots(dateStr) {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    if (!BUSINESS_DAYS.includes(dayOfWeek)) return [];
    return generateTimeSlots(DEFAULT_START, DEFAULT_END);
}

function getAvailableSlots(dateStr) {
    // Start with default slots for this day
    let slots = getDefaultSlots(dateStr);
    if (slots.length === 0) return [];

    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay();

    // Get overrides for this specific date or recurring day
    const overrides = db.prepare(`
        SELECT * FROM availability_overrides
        WHERE date = ? OR (date IS NULL AND day_of_week = ?)
    `).all(dateStr, dayOfWeek);

    for (const override of overrides) {
        if (override.is_blocked) {
            if (!override.start_time && !override.end_time) {
                // Entire day blocked
                return [];
            }
            // Block specific time range
            slots = slots.filter(slot => {
                return slot.end <= override.start_time || slot.start >= override.end_time;
            });
        }
    }

    // Remove slots that already have pending/approved bookings
    const bookings = db.prepare(`
        SELECT start_time, end_time FROM bookings
        WHERE date = ? AND status IN ('pending', 'approved')
    `).all(dateStr);

    for (const booking of bookings) {
        slots = slots.filter(slot => {
            return slot.start !== booking.start_time;
        });
    }

    // Remove past slots if the date is today
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    if (dateStr === todayStr) {
        const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const bufferMinutes = pacificNow.getHours() * 60 + pacificNow.getMinutes() + (BOOKING_BUFFER_HOURS * 60);
        slots = slots.filter(slot => {
            const [h, m] = slot.start.split(':').map(Number);
            return (h * 60 + m) >= bufferMinutes;
        });
    }

    return slots;
}

function getAvailableDates(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');

    while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const slots = getAvailableSlots(dateStr);
        if (slots.length > 0) {
            dates.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function isSlotAvailable(dateStr, startTime) {
    const slots = getAvailableSlots(dateStr);
    return slots.some(slot => slot.start === startTime);
}

function computeEndTime(startTime) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + SLOT_DURATION;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

module.exports = {
    getDefaultSlots,
    getAvailableSlots,
    getAvailableDates,
    isSlotAvailable,
    computeEndTime
};
