// BitGlow Admin Panel
// Change this to your backend URL in production
const API_BASE = '/api';

// ============================================================================
// Auth
// ============================================================================

const TOKEN_KEY = 'bitglow_admin_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (resp.status === 401) {
        clearToken();
        showLogin();
        throw new Error('Session expired');
    }
    return resp.json();
}

// ============================================================================
// Views
// ============================================================================

const loginView = document.getElementById('login-view');
const dashView = document.getElementById('dashboard-view');

function showLogin() {
    loginView.style.display = 'flex';
    dashView.style.display = 'none';
}

function showDashboard() {
    loginView.style.display = 'none';
    dashView.style.display = 'block';
    loadStats();
    loadBookings();
}

// ── Login ──

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const errEl = document.querySelector('.login-error');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    errEl.style.display = 'none';

    try {
        const password = document.getElementById('login-password').value;
        const resp = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await resp.json();

        if (data.success && data.token) {
            setToken(data.token);
            showDashboard();
        } else {
            errEl.textContent = data.error || 'Invalid password';
            errEl.style.display = 'block';
        }
    } catch {
        errEl.textContent = 'Connection failed. Is the backend running?';
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    clearToken();
    showLogin();
});

// ============================================================================
// Stats
// ============================================================================

async function loadStats() {
    try {
        const data = await apiFetch('/admin/stats');
        document.getElementById('stat-pending').textContent = data.pendingBookings;
        document.getElementById('stat-week').textContent = data.weekBookings;
        document.getElementById('stat-unread').textContent = data.unreadContacts;

        if (data.nextBooking) {
            const d = new Date(data.nextBooking.date + 'T12:00:00');
            const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            document.getElementById('stat-next').textContent = `${formatted} @ ${formatTime12(data.nextBooking.start_time)}`;
        } else {
            document.getElementById('stat-next').textContent = 'None';
        }
    } catch { /* silent fail on stats */ }
}

function formatTime12(time24) {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================================
// Tabs
// ============================================================================

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = {
    bookings: document.getElementById('tab-bookings'),
    messages: document.getElementById('tab-messages'),
    availability: document.getElementById('tab-availability')
};

let activeTab = 'bookings';

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.toggle('active', b === btn));
        Object.entries(tabContents).forEach(([key, el]) => {
            el.style.display = key === activeTab ? 'block' : 'none';
        });
        if (activeTab === 'bookings') loadBookings();
        if (activeTab === 'messages') loadMessages();
        if (activeTab === 'availability') loadAvailability();
    });
});

// ============================================================================
// Bookings
// ============================================================================

let bookingFilter = '';
let bookingPage = 1;

document.getElementById('booking-filters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    bookingFilter = e.target.dataset.status;
    bookingPage = 1;
    document.querySelectorAll('#booking-filters .filter-btn').forEach(b => b.classList.toggle('active', b === e.target));
    loadBookings();
});

async function loadBookings() {
    const list = document.getElementById('bookings-list');
    const pagEl = document.getElementById('bookings-pagination');

    try {
        const params = new URLSearchParams({ page: bookingPage, limit: 15 });
        if (bookingFilter) params.set('status', bookingFilter);

        const data = await apiFetch(`/admin/bookings?${params}`);

        if (data.bookings.length === 0) {
            list.innerHTML = '<div class="empty-state">No bookings found.</div>';
            pagEl.innerHTML = '';
            return;
        }

        list.innerHTML = data.bookings.map(b => `
            <div class="item-card" data-id="${b.id}">
                <div class="item-top">
                    <div class="item-meta">
                        <span class="item-name">${esc(b.name)}</span>
                        <span class="item-email">${esc(b.email)}</span>
                        <div class="item-datetime">${formatDate(b.date)} &middot; ${formatTime12(b.start_time)} – ${formatTime12(b.end_time)} PT</div>
                    </div>
                    <span class="item-status status-${b.status}">${b.status}</span>
                </div>
                <div class="item-notes">
                    <textarea placeholder="Notes..." rows="1" data-booking-notes="${b.id}">${esc(b.notes || '')}</textarea>
                </div>
                <div class="item-actions">
                    ${b.status === 'pending' ? `
                        <button class="btn-action approve" onclick="updateBooking(${b.id}, 'approved')">Approve</button>
                        <button class="btn-action decline" onclick="updateBooking(${b.id}, 'declined')">Decline</button>
                    ` : ''}
                    ${b.status === 'approved' ? `
                        <button class="btn-action" onclick="updateBooking(${b.id}, 'completed')">Complete</button>
                    ` : ''}
                    <button class="btn-action" onclick="saveBookingNotes(${b.id})">Save Notes</button>
                    <button class="btn-action delete" onclick="deleteBooking(${b.id})">Delete</button>
                </div>
            </div>
        `).join('');

        renderPagination(pagEl, data.total, data.page, data.limit, (p) => { bookingPage = p; loadBookings(); });
    } catch {
        list.innerHTML = '<div class="empty-state">Failed to load bookings.</div>';
    }
}

async function updateBooking(id, status) {
    await apiFetch(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadBookings();
    loadStats();
}

async function saveBookingNotes(id) {
    const textarea = document.querySelector(`textarea[data-booking-notes="${id}"]`);
    if (!textarea) return;
    await apiFetch(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ notes: textarea.value }) });
}

async function deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;
    await apiFetch(`/admin/bookings/${id}`, { method: 'DELETE' });
    loadBookings();
    loadStats();
}

// ============================================================================
// Messages
// ============================================================================

let messageFilter = '';
let messagePage = 1;

document.getElementById('message-filters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    messageFilter = e.target.dataset.status;
    messagePage = 1;
    document.querySelectorAll('#message-filters .filter-btn').forEach(b => b.classList.toggle('active', b === e.target));
    loadMessages();
});

async function loadMessages() {
    const list = document.getElementById('messages-list');
    const pagEl = document.getElementById('messages-pagination');

    try {
        const params = new URLSearchParams({ page: messagePage, limit: 15 });
        if (messageFilter) params.set('status', messageFilter);

        const data = await apiFetch(`/admin/contacts?${params}`);

        if (data.contacts.length === 0) {
            list.innerHTML = '<div class="empty-state">No messages found.</div>';
            pagEl.innerHTML = '';
            return;
        }

        list.innerHTML = data.contacts.map(c => `
            <div class="item-card" data-id="${c.id}">
                <div class="item-top">
                    <div class="item-meta">
                        <span class="item-name">${esc(c.name)}</span>
                        <span class="item-email">${esc(c.email)}</span>
                        <div class="item-datetime">${c.subject ? esc(c.subject) + ' &middot; ' : ''}${new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <span class="item-status status-${c.status}">${c.status}</span>
                </div>
                <div class="item-message">${esc(c.message)}</div>
                <div class="item-actions">
                    ${c.status === 'new' ? `<button class="btn-action" onclick="updateContact(${c.id}, 'read')">Mark Read</button>` : ''}
                    ${c.status !== 'archived' ? `<button class="btn-action" onclick="updateContact(${c.id}, 'archived')">Archive</button>` : ''}
                    <button class="btn-action delete" onclick="deleteContact(${c.id})">Delete</button>
                </div>
            </div>
        `).join('');

        renderPagination(pagEl, data.total, data.page, data.limit, (p) => { messagePage = p; loadMessages(); });
    } catch {
        list.innerHTML = '<div class="empty-state">Failed to load messages.</div>';
    }
}

async function updateContact(id, status) {
    await apiFetch(`/admin/contacts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadMessages();
    loadStats();
}

async function deleteContact(id) {
    if (!confirm('Delete this message?')) return;
    await apiFetch(`/admin/contacts/${id}`, { method: 'DELETE' });
    loadMessages();
    loadStats();
}

// ============================================================================
// Availability
// ============================================================================

const overrideForm = document.getElementById('override-form');
const overrideType = document.getElementById('override-type');
const timeFields = document.querySelector('.override-time-fields');

overrideType.addEventListener('change', () => {
    timeFields.style.display = overrideType.value === 'time-range' ? 'grid' : 'none';
});

overrideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('override-date').value;
    if (!date) { alert('Please select a date.'); return; }

    const body = { date, is_blocked: 1, reason: document.getElementById('override-reason').value || null };

    if (overrideType.value === 'time-range') {
        body.start_time = document.getElementById('override-start').value;
        body.end_time = document.getElementById('override-end').value;
    }

    await apiFetch('/admin/availability', { method: 'POST', body: JSON.stringify(body) });
    overrideForm.reset();
    overrideType.value = 'full-day';
    timeFields.style.display = 'none';
    loadAvailability();
});

async function loadAvailability() {
    const list = document.getElementById('overrides-list');
    try {
        const data = await apiFetch('/admin/availability');

        if (data.overrides.length === 0) {
            list.innerHTML = '<div class="empty-state">No overrides set. Default schedule is active.</div>';
            return;
        }

        list.innerHTML = data.overrides.map(o => {
            const dateStr = o.date ? formatDate(o.date) : `Every ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][o.day_of_week]}`;
            const timeStr = o.start_time && o.end_time ? `${formatTime12(o.start_time)} – ${formatTime12(o.end_time)}` : 'All day';

            return `
                <div class="override-card">
                    <div class="override-info">
                        <span class="override-date">${dateStr}</span>
                        <span class="override-time"> &middot; ${timeStr}</span>
                        ${o.reason ? `<span class="override-reason"> &middot; ${esc(o.reason)}</span>` : ''}
                    </div>
                    <button class="btn-action delete" onclick="deleteOverride(${o.id})">Remove</button>
                </div>
            `;
        }).join('');
    } catch {
        list.innerHTML = '<div class="empty-state">Failed to load overrides.</div>';
    }
}

async function deleteOverride(id) {
    await apiFetch(`/admin/availability/${id}`, { method: 'DELETE' });
    loadAvailability();
}

// ============================================================================
// Utilities
// ============================================================================

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderPagination(container, total, page, limit, onPage) {
    const pages = Math.ceil(total / limit);
    if (pages <= 1) { container.innerHTML = ''; return; }

    container.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn${i === page ? ' active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => onPage(i));
        container.appendChild(btn);
    }
}

// ============================================================================
// Init — check for existing token
// ============================================================================

(async function init() {
    const token = getToken();
    if (!token) { showLogin(); return; }

    try {
        const resp = await fetch(`${API_BASE}/admin/verify`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await resp.json();
        if (data.valid) {
            showDashboard();
        } else {
            clearToken();
            showLogin();
        }
    } catch {
        showLogin();
    }
})();
