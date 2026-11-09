<?php
/**
 * BitGlow Client & Care Plan Tracker
 *
 * Included by admin.php (behind requireAdmin). Endpoints:
 *
 * GET  ?action=clients          &status=active|all
 * GET  ?action=client-detail    &id=
 * POST ?action=save-client      {id?, name, business?, email?, phone?, website?, plan, billing, plan_start, status, notes?}
 * POST ?action=delete-client    {id}
 * GET  ?action=requests         &status=open|all
 * POST ?action=save-request     {client_id, summary, received_at, urgent}
 * POST ?action=update-request   {id, op: replied|resolved|reopen}
 * POST ?action=delete-request   {id}
 * POST ?action=log-time         {client_id, date, minutes, note?}
 * POST ?action=delete-time      {id}
 *
 * Reply deadlines are counted in business time (BUSINESS_DAYS, 9am–5pm in TIMEZONE),
 * skipping full days blocked in the Availability tab.
 */

// ── Plan definitions (keep in sync with the site and the Care Plan Agreement) ──

const CARE_PLANS = [
    'essentials' => ['name' => 'Essentials',     'price' => 59,  'minutes' => 30,  'response' => '2bd', 'response_label' => '2 business days'],
    'growth'     => ['name' => 'Growth',         'price' => 119, 'minutes' => 90,  'response' => '1bd', 'response_label' => 'Next business day'],
    'seo_plus'   => ['name' => 'Local SEO Plus', 'price' => 249, 'minutes' => 180, 'response' => '1bd', 'response_label' => 'Next business day'],
    'maintain'   => ['name' => 'Maintain Only',  'price' => 49,  'minutes' => 30,  'response' => '2bd', 'response_label' => '2 business days'],
    'none'       => ['name' => 'No plan',        'price' => 0,   'minutes' => 0,   'response' => '2bd', 'response_label' => '2 business days'],
];
const URGENT_RESPONSE_HOURS = 4;   // "Site down" acknowledged within 4 business hours, all plans
const SUPPORT_START_HOUR    = 9;
const SUPPORT_END_HOUR      = 17;
const MIN_TERM_MONTHS       = 3;

function clientsMigrate() {
    getDB()->exec("
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            business TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            plan TEXT NOT NULL DEFAULT 'none',
            billing TEXT NOT NULL DEFAULT 'monthly',
            plan_start TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS client_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            summary TEXT NOT NULL,
            urgent INTEGER NOT NULL DEFAULT 0,
            received_at TEXT NOT NULL,
            due_at TEXT NOT NULL,
            replied_at TEXT,
            resolved_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            minutes INTEGER NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE INDEX IF NOT EXISTS idx_requests_client ON client_requests(client_id);
        CREATE INDEX IF NOT EXISTS idx_requests_open ON client_requests(replied_at, resolved_at);
        CREATE INDEX IF NOT EXISTS idx_time_client_date ON time_entries(client_id, date);
    ");
}

// ============================================================================
// Business-time helpers
// ============================================================================

function blockedDates() {
    static $dates = null;
    if ($dates !== null) return $dates;
    $rows = getDB()->query("SELECT date FROM availability_overrides WHERE date IS NOT NULL AND start_time IS NULL AND is_blocked = 1")->fetchAll();
    $dates = array_flip(array_column($rows, 'date'));
    return $dates;
}

function isBusinessDay(DateTimeImmutable $d) {
    return in_array((int)$d->format('N'), BUSINESS_DAYS, true) && !isset(blockedDates()[$d->format('Y-m-d')]);
}

/** End of the Nth business day after the day $from falls on (n=1 → "next business day"). */
function endOfNthBusinessDayAfter(DateTimeImmutable $from, $n) {
    $d = $from->setTime(0, 0);
    $count = 0;
    while ($count < $n) {
        $d = $d->modify('+1 day');
        if (isBusinessDay($d)) $count++;
    }
    return $d->setTime(SUPPORT_END_HOUR, 0);
}

/** $from plus N hours counted only inside business hours. */
function addBusinessHours(DateTimeImmutable $from, $hours) {
    $remaining = $hours * 60;
    $t = $from;
    for ($guard = 0; $guard < 60; $guard++) {
        $dayStart = $t->setTime(SUPPORT_START_HOUR, 0);
        $dayEnd = $t->setTime(SUPPORT_END_HOUR, 0);
        if (!isBusinessDay($t) || $t >= $dayEnd) {
            $t = $t->modify('+1 day')->setTime(SUPPORT_START_HOUR, 0);
            continue;
        }
        if ($t < $dayStart) $t = $dayStart;
        $available = ($dayEnd->getTimestamp() - $t->getTimestamp()) / 60;
        if ($remaining <= $available) {
            return $t->modify('+' . (int)round($remaining) . ' minutes');
        }
        $remaining -= $available;
        $t = $t->modify('+1 day')->setTime(SUPPORT_START_HOUR, 0);
    }
    return $t;
}

function computeDueAt($plan, $urgent, DateTimeImmutable $received) {
    if ($urgent) return addBusinessHours($received, URGENT_RESPONSE_HOURS);
    $rule = CARE_PLANS[$plan]['response'] ?? '2bd';
    return endOfNthBusinessDayAfter($received, $rule === '1bd' ? 1 : 2);
}

/** Next billing date on or after today, from the plan start date. */
function nextBillingDate($planStart, $billing) {
    if (!$planStart) return null;
    $start = new DateTimeImmutable($planStart);
    $today = new DateTimeImmutable('today');
    if ($start >= $today) return $start->format('Y-m-d');

    $day = (int)$start->format('j');
    $stepMonths = $billing === 'annual' ? 12 : 1;
    $monthsSince = ((int)$today->format('Y') - (int)$start->format('Y')) * 12 + ((int)$today->format('n') - (int)$start->format('n'));
    $k = intdiv($monthsSince, $stepMonths) * $stepMonths;

    for ($i = 0; $i < 3; $i++, $k += $stepMonths) {
        $first = $start->modify('first day of this month')->modify("+$k months");
        $candidate = $first->setDate((int)$first->format('Y'), (int)$first->format('n'), min($day, (int)$first->format('t')));
        if ($candidate >= $today) return $candidate->format('Y-m-d');
    }
    return null;
}

function fmtDateTime($dt) {
    return (new DateTimeImmutable($dt))->format('D M j, g:i A');
}

function jsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
}

function validDate($s) {
    return is_string($s) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $s) && strtotime($s) !== false;
}

/** Accepts "2026-11-03T14:30" or "2026-11-03 14:30[:00]". */
function normalizeDateTime($s) {
    if (!is_string($s) || !preg_match('/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?$/', $s, $m)) return null;
    return "{$m[1]} {$m[2]}:00";
}

// ============================================================================
// Clients
// ============================================================================

function handleClients() {
    $db = getDB();
    $status = $_GET['status'] ?? 'active';
    $where = $status === 'all' ? '' : "WHERE c.status = 'active'";
    $monthStart = date('Y-m-01');

    $rows = $db->query("
        SELECT c.*,
            COALESCE((SELECT SUM(minutes) FROM time_entries t WHERE t.client_id = c.id AND t.date >= '$monthStart'), 0) AS minutes_used,
            (SELECT COUNT(*) FROM client_requests r WHERE r.client_id = c.id AND r.resolved_at IS NULL) AS open_requests
        FROM clients c $where
        ORDER BY c.status = 'active' DESC, COALESCE(NULLIF(c.business, ''), c.name) COLLATE NOCASE
    ")->fetchAll();

    $mrr = 0;
    foreach ($rows as &$c) {
        $plan = CARE_PLANS[$c['plan']] ?? CARE_PLANS['none'];
        $c['plan_name'] = $plan['name'];
        $c['plan_price'] = $plan['price'];
        $c['minutes_allowed'] = $plan['minutes'];
        $c['minutes_used'] = (int)$c['minutes_used'];
        $c['open_requests'] = (int)$c['open_requests'];
        $c['response_label'] = $plan['response_label'];
        $c['next_billing'] = $c['status'] === 'active' && $plan['price'] > 0 ? nextBillingDate($c['plan_start'], $c['billing']) : null;
        $c['min_term_end'] = $c['plan_start'] ? (new DateTimeImmutable($c['plan_start']))->modify('+' . MIN_TERM_MONTHS . ' months')->format('Y-m-d') : null;
        if ($c['status'] === 'active') {
            $mrr += $c['billing'] === 'annual' ? $plan['price'] * 10 / 12 : $plan['price'];
        }
    }
    unset($c);

    echo json_encode([
        'clients' => $rows,
        'plans' => CARE_PLANS,
        'summary' => array_merge(['mrr' => round($mrr)], requestSummary()),
    ]);
}

function handleClientDetail() {
    $id = (int)($_GET['id'] ?? 0);
    $db = getDB();
    $time = $db->prepare("SELECT * FROM time_entries WHERE client_id = ? ORDER BY date DESC, id DESC LIMIT 30");
    $time->execute([$id]);
    $reqs = $db->prepare("SELECT * FROM client_requests WHERE client_id = ? ORDER BY received_at DESC LIMIT 20");
    $reqs->execute([$id]);
    $requests = array_map('decorateRequest', $reqs->fetchAll());
    echo json_encode(['time' => $time->fetchAll(), 'requests' => $requests]);
}

function handleSaveClient() {
    $d = jsonInput();
    $id = (int)($d['id'] ?? 0);
    $name = trim($d['name'] ?? '');
    $plan = $d['plan'] ?? 'none';
    $billing = $d['billing'] ?? 'monthly';
    $status = $d['status'] ?? 'active';
    $planStart = ($d['plan_start'] ?? '') ?: null;
    $email = trim($d['email'] ?? '');

    if ($name === '') return fail(400, 'Client name is required');
    if (!isset(CARE_PLANS[$plan])) return fail(400, 'Invalid plan');
    if (!in_array($billing, ['monthly', 'annual'], true)) return fail(400, 'Invalid billing cycle');
    if (!in_array($status, ['active', 'paused', 'cancelled'], true)) return fail(400, 'Invalid status');
    if ($planStart !== null && !validDate($planStart)) return fail(400, 'Invalid plan start date');
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) return fail(400, 'Invalid email');

    $fields = [
        'name' => $name,
        'business' => trim($d['business'] ?? ''),
        'email' => $email,
        'phone' => trim($d['phone'] ?? ''),
        'website' => trim($d['website'] ?? ''),
        'plan' => $plan,
        'billing' => $billing,
        'plan_start' => $planStart,
        'status' => $status,
        'notes' => trim($d['notes'] ?? ''),
    ];

    $db = getDB();
    if ($id) {
        $set = implode(', ', array_map(fn($k) => "$k = ?", array_keys($fields)));
        $stmt = $db->prepare("UPDATE clients SET $set, updated_at = datetime('now', 'localtime') WHERE id = ?");
        $stmt->execute([...array_values($fields), $id]);
        if ($stmt->rowCount() === 0) return fail(404, 'Client not found');
    } else {
        $cols = implode(', ', array_keys($fields));
        $marks = implode(', ', array_fill(0, count($fields), '?'));
        $db->prepare("INSERT INTO clients ($cols) VALUES ($marks)")->execute(array_values($fields));
        $id = (int)$db->lastInsertId();
    }
    echo json_encode(['success' => true, 'id' => $id]);
}

function handleDeleteClient() {
    $id = (int)(jsonInput()['id'] ?? 0);
    $stmt = getDB()->prepare("DELETE FROM clients WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) return fail(404, 'Client not found');
    echo json_encode(['success' => true]);
}

// ============================================================================
// Requests
// ============================================================================

function decorateRequest($r) {
    $now = new DateTimeImmutable('now');
    $due = new DateTimeImmutable($r['due_at']);
    $r['urgent'] = (int)$r['urgent'];
    $r['received_label'] = fmtDateTime($r['received_at']);
    $r['due_label'] = fmtDateTime($r['due_at']);
    $r['minutes_left'] = $r['replied_at'] ? null : (int)floor(($due->getTimestamp() - $now->getTimestamp()) / 60);
    $r['replied_late'] = $r['replied_at'] ? (new DateTimeImmutable($r['replied_at']) > $due) : null;
    $r['state'] = $r['resolved_at'] ? 'resolved' : ($r['replied_at'] ? 'replied' : ($r['minutes_left'] < 0 ? 'overdue' : 'open'));
    return $r;
}

function requestSummary() {
    $db = getDB();
    $now = date('Y-m-d H:i:s');
    $open = (int)$db->query("SELECT COUNT(*) c FROM client_requests WHERE replied_at IS NULL AND resolved_at IS NULL")->fetch()['c'];
    $overdue = $db->prepare("SELECT COUNT(*) c FROM client_requests WHERE replied_at IS NULL AND resolved_at IS NULL AND due_at < ?");
    $overdue->execute([$now]);

    $since = date('Y-m-d H:i:s', strtotime('-30 days'));
    $answered = $db->prepare("SELECT COUNT(*) total, SUM(replied_at <= due_at) on_time FROM client_requests WHERE replied_at IS NOT NULL AND received_at >= ?");
    $answered->execute([$since]);
    $a = $answered->fetch();

    return [
        'open_requests' => $open,
        'overdue' => (int)$overdue->fetch()['c'],
        'on_time_pct' => $a['total'] ? (int)round(100 * $a['on_time'] / $a['total']) : null,
        'answered_30d' => (int)$a['total'],
    ];
}

function handleRequests() {
    $status = $_GET['status'] ?? 'open';
    $where = $status === 'all' ? '' : 'WHERE r.resolved_at IS NULL';
    $rows = getDB()->query("
        SELECT r.*, c.name AS client_name, c.business AS client_business, c.plan AS client_plan, c.email AS client_email
        FROM client_requests r JOIN clients c ON c.id = r.client_id
        $where
        ORDER BY (r.replied_at IS NOT NULL), r.due_at ASC
        LIMIT 100
    ")->fetchAll();

    foreach ($rows as &$r) {
        $r = decorateRequest($r);
        $r['plan_name'] = (CARE_PLANS[$r['client_plan']] ?? CARE_PLANS['none'])['name'];
    }
    unset($r);
    echo json_encode(['requests' => $rows]);
}

function handleSaveRequest() {
    $d = jsonInput();
    $clientId = (int)($d['client_id'] ?? 0);
    $summary = trim($d['summary'] ?? '');
    $urgent = !empty($d['urgent']) ? 1 : 0;
    $received = normalizeDateTime($d['received_at'] ?? '') ?? date('Y-m-d H:i:00');

    if ($summary === '') return fail(400, 'Summary is required');

    $db = getDB();
    $client = $db->prepare("SELECT plan FROM clients WHERE id = ?");
    $client->execute([$clientId]);
    $client = $client->fetch();
    if (!$client) return fail(404, 'Client not found');

    $due = computeDueAt($client['plan'], $urgent, new DateTimeImmutable($received));
    $db->prepare("INSERT INTO client_requests (client_id, summary, urgent, received_at, due_at) VALUES (?, ?, ?, ?, ?)")
       ->execute([$clientId, $summary, $urgent, $received, $due->format('Y-m-d H:i:s')]);

    echo json_encode(['success' => true, 'id' => (int)$db->lastInsertId(), 'due_label' => fmtDateTime($due->format('Y-m-d H:i:s'))]);
}

function handleUpdateRequest() {
    $d = jsonInput();
    $id = (int)($d['id'] ?? 0);
    $op = $d['op'] ?? '';
    $sql = [
        'replied'  => "UPDATE client_requests SET replied_at = COALESCE(replied_at, datetime('now', 'localtime')) WHERE id = ?",
        'resolved' => "UPDATE client_requests SET replied_at = COALESCE(replied_at, datetime('now', 'localtime')), resolved_at = datetime('now', 'localtime') WHERE id = ?",
        'reopen'   => "UPDATE client_requests SET resolved_at = NULL WHERE id = ?",
    ][$op] ?? null;

    if (!$sql) return fail(400, 'Invalid operation');
    $stmt = getDB()->prepare($sql);
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) return fail(404, 'Request not found');
    echo json_encode(['success' => true]);
}

function handleDeleteRequest() {
    $id = (int)(jsonInput()['id'] ?? 0);
    $stmt = getDB()->prepare("DELETE FROM client_requests WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) return fail(404, 'Request not found');
    echo json_encode(['success' => true]);
}

// ============================================================================
// Time
// ============================================================================

function handleLogTime() {
    $d = jsonInput();
    $clientId = (int)($d['client_id'] ?? 0);
    $date = $d['date'] ?? date('Y-m-d');
    $minutes = (int)($d['minutes'] ?? 0);

    if (!validDate($date)) return fail(400, 'Invalid date');
    if ($minutes <= 0 || $minutes > 24 * 60) return fail(400, 'Minutes must be between 1 and 1440');

    $db = getDB();
    $exists = $db->prepare("SELECT 1 FROM clients WHERE id = ?");
    $exists->execute([$clientId]);
    if (!$exists->fetch()) return fail(404, 'Client not found');

    $db->prepare("INSERT INTO time_entries (client_id, date, minutes, note) VALUES (?, ?, ?, ?)")
       ->execute([$clientId, $date, $minutes, trim($d['note'] ?? '')]);
    echo json_encode(['success' => true, 'id' => (int)$db->lastInsertId()]);
}

function handleDeleteTime() {
    $id = (int)(jsonInput()['id'] ?? 0);
    $stmt = getDB()->prepare("DELETE FROM time_entries WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) return fail(404, 'Time entry not found');
    echo json_encode(['success' => true]);
}
