// BitGlow Admin Panel
// Change this to your backend URL in production
const API_BASE = '/api/admin.php';

// ============================================================================
// Auth
// ============================================================================

const TOKEN_KEY = 'bitglow_admin_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function apiFetch(action, opts = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Build URL: action can be "bookings?status=pending" or just "login"
    const url = `${API_BASE}?action=${action}`;
    const resp = await fetch(url, { ...opts, headers });
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
    loadClientsBadge();
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
        const resp = await fetch(`${API_BASE}?action=login`, {
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
        const data = await apiFetch('stats');
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
    availability: document.getElementById('tab-availability'),
    clients: document.getElementById('tab-clients')
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
        if (activeTab === 'clients') loadClientsTab();
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

        const data = await apiFetch(`bookings&${params}`);

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
    await apiFetch('update-booking', { method: 'POST', body: JSON.stringify({ id, status }) });
    loadBookings();
    loadStats();
}

async function saveBookingNotes(id) {
    const textarea = document.querySelector(`textarea[data-booking-notes="${id}"]`);
    if (!textarea) return;
    await apiFetch('update-booking', { method: 'POST', body: JSON.stringify({ id, notes: textarea.value }) });
}

async function deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;
    await apiFetch('delete-booking', { method: 'POST', body: JSON.stringify({ id }) });
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

        const data = await apiFetch(`contacts&${params}`);

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
    await apiFetch('update-contact', { method: 'POST', body: JSON.stringify({ id, status }) });
    loadMessages();
    loadStats();
}

async function deleteContact(id) {
    if (!confirm('Delete this message?')) return;
    await apiFetch('delete-contact', { method: 'POST', body: JSON.stringify({ id }) });
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

    await apiFetch('add-override', { method: 'POST', body: JSON.stringify(body) });
    overrideForm.reset();
    overrideType.value = 'full-day';
    timeFields.style.display = 'none';
    loadAvailability();
});

async function loadAvailability() {
    const list = document.getElementById('overrides-list');
    try {
        const data = await apiFetch('availability');

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
    await apiFetch('delete-override', { method: 'POST', body: JSON.stringify({ id }) });
    loadAvailability();
}

// ============================================================================
// Clients & care plans
// ============================================================================

let clientFilter = 'active';
let clientsCache = [];
let plansCache = {};

const money = (n) => '$' + Number(n).toLocaleString('en-US');
const fmtMins = (m) => {
    if (!m) return '0m';
    const h = Math.floor(m / 60), r = m % 60;
    return h ? `${h}h${r ? ` ${r}m` : ''}` : `${r}m`;
};
const shortDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const clientLabel = (c) => c.business ? `${c.business} (${c.name})` : c.name;

function relDue(mins) {
    const abs = Math.abs(mins);
    const txt = abs < 60 ? `${abs}m` : abs < 60 * 24 ? `${Math.round(abs / 60)}h` : `${Math.round(abs / 1440)}d`;
    return mins < 0 ? `overdue by ${txt}` : `due in ${txt}`;
}

async function loadClientsBadge() {
    try {
        const data = await apiFetch('clients&status=active');
        setClientsBadge(data.summary);
    } catch { /* silent */ }
}

function setClientsBadge(summary) {
    const badge = document.getElementById('clients-badge');
    const n = summary.overdue || summary.open_requests;
    badge.hidden = !n;
    badge.textContent = n;
    badge.classList.toggle('tab-badge-alert', summary.overdue > 0);
}

function loadClientsTab() {
    loadClients();
    loadQueue();
}

document.getElementById('client-filters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    clientFilter = e.target.dataset.status;
    document.querySelectorAll('#client-filters .filter-btn').forEach(b => b.classList.toggle('active', b === e.target));
    loadClients();
});

async function loadClients() {
    const list = document.getElementById('clients-list');
    try {
        const data = await apiFetch(`clients&status=${clientFilter}`);
        clientsCache = data.clients;
        plansCache = data.plans;
        const s = data.summary;

        document.getElementById('cs-active').textContent = data.clients.filter(c => c.status === 'active').length;
        document.getElementById('cs-mrr').textContent = money(s.mrr);
        document.getElementById('cs-open').textContent = s.open_requests;
        const od = document.getElementById('cs-overdue');
        od.textContent = s.overdue;
        od.classList.toggle('is-alert', s.overdue > 0);
        document.getElementById('cs-ontime').textContent = s.on_time_pct === null ? '—' : `${s.on_time_pct}%`;
        setClientsBadge(s);

        if (data.clients.length === 0) {
            list.innerHTML = '<div class="empty-state">No clients yet. Add your first care plan client.</div>';
            return;
        }

        list.innerHTML = data.clients.map(c => {
            const allowed = c.minutes_allowed;
            const pct = allowed ? Math.min(100, Math.round(100 * c.minutes_used / allowed)) : 0;
            const over = allowed && c.minutes_used > allowed ? c.minutes_used - allowed : 0;
            const usageClass = over ? 'over' : pct >= 80 ? 'near' : '';
            const termNote = c.min_term_end && c.min_term_end > new Date().toISOString().slice(0, 10) ? ` · min. term ends ${shortDate(c.min_term_end)}` : '';
            return `
            <div class="item-card client-card" data-id="${c.id}">
                <div class="item-top">
                    <div class="item-meta">
                        <span class="item-name">${esc(c.business || c.name)}</span>
                        ${c.business ? `<span class="item-email"> · ${esc(c.name)}</span>` : ''}
                        <div class="client-contact">
                            ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}
                            ${c.phone ? `<span>${esc(c.phone)}</span>` : ''}
                            ${/^https?:\/\//i.test(c.website || '') ? `<a href="${esc(c.website)}" target="_blank" rel="noopener noreferrer">site ↗</a>` : ''}
                        </div>
                    </div>
                    <div class="client-plan">
                        <span class="plan-badge plan-${c.plan}">${esc(c.plan_name)}</span>
                        ${c.status !== 'active' ? `<span class="item-status status-${c.status}">${c.status}</span>` : ''}
                    </div>
                </div>
                <div class="client-facts">
                    ${c.plan_price ? `<span>${money(c.plan_price)}/mo${c.billing === 'annual' ? ' · billed yearly' : ''}</span>` : ''}
                    ${c.next_billing ? `<span>next bill ${shortDate(c.next_billing)}${termNote}</span>` : ''}
                    <span>reply: ${esc(c.response_label)}</span>
                    ${c.open_requests ? `<span class="fact-alert">${c.open_requests} open request${c.open_requests > 1 ? 's' : ''}</span>` : ''}
                </div>
                ${allowed ? `
                <div class="usage">
                    <div class="usage-bar"><div class="usage-fill ${usageClass}" style="width:${pct}%"></div></div>
                    <span class="usage-text ${usageClass}">${fmtMins(c.minutes_used)} of ${fmtMins(allowed)} this month${over ? ` · ${fmtMins(over)} over (bill hourly)` : ''}</span>
                </div>` : ''}
                ${c.notes ? `<div class="item-message">${esc(c.notes)}</div>` : ''}
                <div class="item-actions">
                    <button class="btn-action" onclick="openTimeDialog(${c.id})">Log time</button>
                    <button class="btn-action" onclick="openRequestDialog(${c.id})">New request</button>
                    <button class="btn-action" onclick="toggleClientHistory(${c.id}, this)">History</button>
                    <button class="btn-action" onclick="openClientDialog(${c.id})">Edit</button>
                    <button class="btn-action delete" onclick="deleteClient(${c.id})">Delete</button>
                </div>
                <div class="client-history" id="history-${c.id}" hidden></div>
            </div>`;
        }).join('');
    } catch {
        list.innerHTML = '<div class="empty-state">Failed to load clients.</div>';
    }
}

async function loadQueue() {
    const list = document.getElementById('queue-list');
    try {
        const data = await apiFetch('requests&status=open');
        if (data.requests.length === 0) {
            list.innerHTML = '<div class="empty-state">Inbox zero. Nothing waiting on you.</div>';
            return;
        }
        list.innerHTML = data.requests.map(r => {
            const dueTxt = r.state === 'replied'
                ? `replied${r.replied_late ? ' late' : ''} · waiting to resolve`
                : `${relDue(r.minutes_left)} · ${esc(r.due_label)}`;
            return `
            <div class="item-card queue-item state-${r.state}${r.urgent ? ' is-urgent' : ''}">
                <div class="item-top">
                    <div class="item-meta">
                        <span class="item-name">${esc(r.summary)}</span>
                        <div class="queue-sub">${esc(r.client_business || r.client_name)} · <span class="plan-badge plan-${r.client_plan}">${esc(r.plan_name)}</span>${r.urgent ? ' <span class="urgent-tag">URGENT</span>' : ''} · received ${esc(r.received_label)}</div>
                    </div>
                    <span class="due-pill due-${r.state}">${dueTxt}</span>
                </div>
                <div class="item-actions">
                    ${r.state !== 'replied' ? `<button class="btn-action approve" onclick="updateRequest(${r.id}, 'replied')">Mark replied</button>` : ''}
                    <button class="btn-action" onclick="updateRequest(${r.id}, 'resolved')">Resolve</button>
                    ${r.client_email ? `<a class="btn-action" href="mailto:${esc(r.client_email)}?subject=${encodeURIComponent('Re: ' + r.summary)}">Email</a>` : ''}
                    <button class="btn-action delete" onclick="deleteRequest(${r.id})">Delete</button>
                </div>
            </div>`;
        }).join('');
    } catch {
        list.innerHTML = '<div class="empty-state">Failed to load requests.</div>';
    }
}

async function updateRequest(id, op) {
    await apiFetch('update-request', { method: 'POST', body: JSON.stringify({ id, op }) });
    loadClientsTab();
}

async function deleteRequest(id) {
    if (!confirm('Delete this request?')) return;
    await apiFetch('delete-request', { method: 'POST', body: JSON.stringify({ id }) });
    loadClientsTab();
}

async function deleteClient(id) {
    const c = clientsCache.find(x => x.id == id);
    if (!confirm(`Delete ${c ? clientLabel(c) : 'this client'} and all their requests and time entries? Tip: set status to Cancelled instead to keep history.`)) return;
    await apiFetch('delete-client', { method: 'POST', body: JSON.stringify({ id }) });
    loadClientsTab();
}

async function toggleClientHistory(id, btn) {
    const box = document.getElementById(`history-${id}`);
    if (!box.hidden) { box.hidden = true; btn.textContent = 'History'; return; }
    box.hidden = false;
    btn.textContent = 'Hide history';
    box.innerHTML = '<div class="empty-state">Loading…</div>';
    try {
        const data = await apiFetch(`client-detail&id=${id}`);
        const time = data.time.length ? data.time.map(t => `
            <div class="history-row">
                <span>${shortDate(t.date)}</span><span class="history-mins">${fmtMins(t.minutes)}</span>
                <span class="history-note">${esc(t.note || '')}</span>
                <button class="btn-action delete" onclick="deleteTime(${t.id}, ${id})">×</button>
            </div>`).join('') : '<div class="history-empty">No time logged yet.</div>';
        const reqs = data.requests.length ? data.requests.map(r => `
            <div class="history-row">
                <span>${esc(r.received_label)}</span>
                <span class="history-note">${esc(r.summary)}</span>
                <span class="due-pill due-${r.state}">${r.state}${r.replied_late ? ' (late)' : ''}</span>
                ${r.state === 'resolved' ? `<button class="btn-action" onclick="updateRequest(${r.id}, 'reopen')">Reopen</button>` : ''}
            </div>`).join('') : '<div class="history-empty">No requests yet.</div>';
        box.innerHTML = `<h4>Time (last 30 entries)</h4>${time}<h4>Requests</h4>${reqs}`;
    } catch {
        box.innerHTML = '<div class="empty-state">Failed to load history.</div>';
    }
}

async function deleteTime(id, clientId) {
    if (!confirm('Delete this time entry?')) return;
    await apiFetch('delete-time', { method: 'POST', body: JSON.stringify({ id }) });
    await loadClients();
    const btn = document.querySelector(`.client-card[data-id="${clientId}"] .item-actions button:nth-child(3)`);
    if (btn) toggleClientHistory(clientId, btn);
}

// ── Dialogs ──

function localNow() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function setupDialog(dialog, form, onSubmit) {
    const errEl = form.querySelector('.dialog-error');
    form.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errEl.hidden = true;
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        try {
            const res = await onSubmit(Object.fromEntries(new FormData(form)));
            if (res && res.success === false) throw new Error(res.error || 'Something went wrong');
            dialog.close();
            loadClientsTab();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.hidden = false;
        } finally {
            submit.disabled = false;
        }
    });
}

const clientDialog = document.getElementById('client-dialog');
const clientForm = document.getElementById('client-form');
const requestDialog = document.getElementById('request-dialog');
const requestForm = document.getElementById('request-form');
const timeDialog = document.getElementById('time-dialog');
const timeForm = document.getElementById('time-form');

setupDialog(clientDialog, clientForm, (data) =>
    apiFetch('save-client', { method: 'POST', body: JSON.stringify({ ...data, id: data.id ? Number(data.id) : undefined }) }));
setupDialog(requestDialog, requestForm, (data) =>
    apiFetch('save-request', { method: 'POST', body: JSON.stringify({ ...data, client_id: Number(data.client_id), urgent: !!data.urgent }) }));
setupDialog(timeDialog, timeForm, (data) =>
    apiFetch('log-time', { method: 'POST', body: JSON.stringify({ ...data, client_id: Number(data.client_id), minutes: Number(data.minutes) }) }));

timeForm.querySelectorAll('[data-mins]').forEach(b => b.addEventListener('click', () => {
    timeForm.elements.minutes.value = b.dataset.mins;
}));

function openClientDialog(id) {
    clientForm.reset();
    clientForm.querySelector('.dialog-error').hidden = true;
    const select = document.getElementById('client-plan-select');
    select.innerHTML = Object.entries(plansCache).map(([key, p]) =>
        `<option value="${key}">${esc(p.name)}${p.price ? ` · $${p.price}/mo` : ''}</option>`).join('');

    const c = id ? clientsCache.find(x => x.id == id) : null;
    document.getElementById('client-dialog-title').textContent = c ? 'Edit client' : 'Add client';
    const f = clientForm.elements;
    f.id.value = c ? c.id : '';
    ['name', 'business', 'email', 'phone', 'website', 'notes'].forEach(k => { f[k].value = c ? (c[k] || '') : ''; });
    f.plan.value = c ? c.plan : 'growth';
    f.billing.value = c ? c.billing : 'monthly';
    f.status.value = c ? c.status : 'active';
    f.plan_start.value = c ? (c.plan_start || '') : new Date().toISOString().slice(0, 10);
    clientDialog.showModal();
}

async function ensureAllClients() {
    // Request dialog lists every active client, even when the list is filtered
    const data = await apiFetch('clients&status=active');
    return data.clients;
}

async function openRequestDialog(clientId) {
    requestForm.reset();
    requestForm.querySelector('.dialog-error').hidden = true;
    const clients = await ensureAllClients();
    if (!clients.length) { alert('Add a client first.'); return; }
    const select = requestForm.elements.client_id;
    select.innerHTML = clients.map(c => `<option value="${c.id}">${esc(clientLabel(c))} · ${esc(c.plan_name)}</option>`).join('');
    if (clientId) select.value = clientId;
    requestForm.elements.received_at.value = localNow();
    requestDialog.showModal();
}

function openTimeDialog(clientId) {
    timeForm.reset();
    timeForm.querySelector('.dialog-error').hidden = true;
    const c = clientsCache.find(x => x.id == clientId);
    timeForm.elements.client_id.value = clientId;
    timeForm.elements.date.value = localNow().slice(0, 10);
    document.getElementById('time-dialog-client').textContent = c ? clientLabel(c) : '';
    timeDialog.showModal();
}

document.getElementById('new-client-btn').addEventListener('click', () => openClientDialog(null));
document.getElementById('new-request-btn').addEventListener('click', () => openRequestDialog(null));

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
        const resp = await fetch(`${API_BASE}?action=verify`, {
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
