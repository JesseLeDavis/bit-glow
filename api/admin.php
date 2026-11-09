<?php
/**
 * BitGlow Admin API
 *
 * POST ?action=login         {password}
 * POST ?action=verify
 * GET  ?action=stats
 * GET  ?action=bookings      &status=pending&page=1&limit=20
 * POST ?action=update-booking {id, status?, notes?}
 * POST ?action=delete-booking {id}
 * GET  ?action=contacts       &status=new&page=1&limit=20
 * POST ?action=update-contact {id, status}
 * POST ?action=delete-contact {id}
 * GET  ?action=availability
 * POST ?action=add-override   {date, start_time?, end_time?, is_blocked, reason?}
 * POST ?action=delete-override {id}
 *
 * Client & care plan tracker endpoints: see clients.php
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/clients.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// Public routes
if ($action === 'login') { handleLogin(); exit(); }

// Protected routes
requireAdmin();
clientsMigrate();

switch ($action) {
    case 'verify':       echo json_encode(['valid' => true]); break;
    case 'stats':        handleStats(); break;
    case 'bookings':     handleBookings(); break;
    case 'update-booking': handleUpdateBooking(); break;
    case 'delete-booking': handleDeleteBooking(); break;
    case 'contacts':     handleContacts(); break;
    case 'update-contact': handleUpdateContact(); break;
    case 'delete-contact': handleDeleteContact(); break;
    case 'availability': handleAvailability(); break;
    case 'add-override': handleAddOverride(); break;
    case 'delete-override': handleDeleteOverride(); break;
    case 'clients':        handleClients(); break;
    case 'client-detail':  handleClientDetail(); break;
    case 'save-client':    handleSaveClient(); break;
    case 'delete-client':  handleDeleteClient(); break;
    case 'requests':       handleRequests(); break;
    case 'save-request':   handleSaveRequest(); break;
    case 'update-request': handleUpdateRequest(); break;
    case 'delete-request': handleDeleteRequest(); break;
    case 'log-time':       handleLogTime(); break;
    case 'delete-time':    handleDeleteTime(); break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}

// ── Auth ──

function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'POST required']);
        return;
    }

    // Rate limit login attempts
    if (isLoginRateLimited()) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many login attempts. Please try again later.']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $password = $data['password'] ?? '';

    if (!$password) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password is required']);
        return;
    }

    if (ADMIN_PASSWORD_HASH === '$2y$12$YourHashHere') {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Admin not configured. Set ADMIN_PASSWORD_HASH in config.php']);
        return;
    }

    if (!password_verify($password, ADMIN_PASSWORD_HASH)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid password']);
        return;
    }

    $token = jwt_create(['role' => 'admin']);
    echo json_encode(['success' => true, 'token' => $token]);
}

// ── Stats ──

function handleStats() {
    $db = getDB();
    $today = date('Y-m-d');
    $weekAgo = date('Y-m-d', strtotime('-7 days'));

    $pending = $db->query("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'")->fetch()['c'];
    $week = $db->prepare("SELECT COUNT(*) as c FROM bookings WHERE date >= ?");
    $week->execute([$weekAgo]);
    $weekCount = $week->fetch()['c'];

    $unread = $db->query("SELECT COUNT(*) as c FROM contacts WHERE status = 'new'")->fetch()['c'];

    $next = $db->prepare("SELECT * FROM bookings WHERE date >= ? AND status IN ('pending', 'approved') ORDER BY date ASC, start_time ASC LIMIT 1");
    $next->execute([$today]);
    $nextBooking = $next->fetch() ?: null;

    echo json_encode([
        'pendingBookings' => (int)$pending,
        'weekBookings' => (int)$weekCount,
        'unreadContacts' => (int)$unread,
        'nextBooking' => $nextBooking
    ]);
}

// ── Bookings ──

function handleBookings() {
    $db = getDB();
    $status = $_GET['status'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = '';
    $params = [];
    if ($status) {
        $where = 'WHERE status = ?';
        $params[] = $status;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM bookings $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT * FROM bookings $where ORDER BY date DESC, start_time DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    echo json_encode(['bookings' => $bookings, 'total' => $total, 'page' => $page, 'limit' => $limit]);
}

function handleUpdateBooking() {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? null;
    $notes = $data['notes'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Booking ID required']);
        return;
    }

    $db = getDB();
    $booking = $db->prepare("SELECT * FROM bookings WHERE id = ?")->execute([$id]);
    $booking = $db->prepare("SELECT * FROM bookings WHERE id = ?");
    $booking->execute([$id]);
    $booking = $booking->fetch();

    if (!$booking) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        return;
    }

    $updates = [];
    $params = [];

    if ($status) {
        $valid = ['pending', 'approved', 'declined', 'completed', 'cancelled'];
        if (!in_array($status, $valid)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            return;
        }
        $updates[] = 'status = ?';
        $params[] = $status;
    }

    if ($notes !== null) {
        $updates[] = 'notes = ?';
        $params[] = $notes;
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No updates provided']);
        return;
    }

    $updates[] = "updated_at = datetime('now', 'localtime')";
    $params[] = $id;

    $db->prepare("UPDATE bookings SET " . implode(', ', $updates) . " WHERE id = ?")->execute($params);

    $updated = $db->prepare("SELECT * FROM bookings WHERE id = ?");
    $updated->execute([$id]);
    $updated = $updated->fetch();

    // Send status email
    if ($status === 'approved' || $status === 'declined') {
        sendBookingStatusEmail($updated, $status);
    }

    echo json_encode(['success' => true, 'booking' => $updated]);
}

function handleDeleteBooking() {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $db = getDB();
    $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        return;
    }
    echo json_encode(['success' => true]);
}

// ── Contacts ──

function handleContacts() {
    $db = getDB();
    $status = $_GET['status'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = '';
    $params = [];
    if ($status) {
        $where = 'WHERE status = ?';
        $params[] = $status;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM contacts $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT * FROM contacts $where ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);
    $contacts = $stmt->fetchAll();

    echo json_encode(['contacts' => $contacts, 'total' => $total, 'page' => $page, 'limit' => $limit]);
}

function handleUpdateContact() {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? '';

    $valid = ['new', 'read', 'archived'];
    if (!$id || !in_array($status, $valid)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Valid ID and status required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare("UPDATE contacts SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?");
    $stmt->execute([$status, $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Contact not found']);
        return;
    }

    $updated = $db->prepare("SELECT * FROM contacts WHERE id = ?");
    $updated->execute([$id]);
    echo json_encode(['success' => true, 'contact' => $updated->fetch()]);
}

function handleDeleteContact() {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $db = getDB();
    $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Contact not found']);
        return;
    }
    echo json_encode(['success' => true]);
}

// ── Availability ──

function handleAvailability() {
    $db = getDB();
    $overrides = $db->query("SELECT * FROM availability_overrides ORDER BY date ASC, start_time ASC")->fetchAll();
    echo json_encode(['overrides' => $overrides]);
}

function handleAddOverride() {
    $data = json_decode(file_get_contents('php://input'), true);
    $date = $data['date'] ?? null;
    $dow = $data['day_of_week'] ?? null;
    $startTime = $data['start_time'] ?? null;
    $endTime = $data['end_time'] ?? null;
    $isBlocked = (int)($data['is_blocked'] ?? 1);
    $reason = $data['reason'] ?? null;

    if (!$date && $dow === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Either date or day_of_week is required']);
        return;
    }

    if ($date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid date format']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO availability_overrides (date, day_of_week, start_time, end_time, is_blocked, reason) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$date, $dow, $startTime, $endTime, $isBlocked, $reason]);
    $id = $db->lastInsertId();

    $override = $db->prepare("SELECT * FROM availability_overrides WHERE id = ?");
    $override->execute([$id]);
    echo json_encode(['success' => true, 'override' => $override->fetch()]);
}

function handleDeleteOverride() {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $db = getDB();
    $stmt = $db->prepare("DELETE FROM availability_overrides WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Override not found']);
        return;
    }
    echo json_encode(['success' => true]);
}

// ── Email Helpers ──

function formatTime12($time24) {
    [$h, $m] = explode(':', $time24);
    $h = (int)$h;
    $ampm = $h >= 12 ? 'PM' : 'AM';
    return ($h % 12 ?: 12) . ":$m $ampm";
}

function formatDateLong($dateStr) {
    return (new DateTime($dateStr))->format('l, F j, Y');
}

function emailTemplate($title, $bodyHtml, $borderColor = '#00e5cc') {
    return "<!DOCTYPE html><html><head><style>
body{font-family:'Courier New',monospace;background:#0a0e27;color:#d4d4d4;padding:20px;margin:0}
.container{max-width:600px;margin:0 auto;background:#1a1f3a;border:2px solid {$borderColor};padding:30px}
.header{color:{$borderColor};font-size:20px;margin-bottom:20px;font-weight:bold}
.content{line-height:1.8}.detail{margin:8px 0}.label{color:#00e5cc;font-weight:bold}
.highlight{background:#0a0e27;border-left:3px solid #ff6b35;padding:15px;margin:15px 0}
.footer{margin-top:30px;padding-top:20px;border-top:1px solid {$borderColor};color:#888;font-size:12px}
a{color:#00e5cc}
</style></head><body><div class='container'>
<div class='header'>{$title}</div>
<div class='content'>{$bodyHtml}</div>
<div class='footer'>BitGlow Development Studio<br>Salem, Oregon<br><a href='https://bitglow.tech'>https://bitglow.tech</a></div>
</div></body></html>";
}

function sendBookingStatusEmail($booking, $status) {
    $date = formatDateLong($booking['date']);
    $time = formatTime12($booking['start_time']) . ' – ' . formatTime12($booking['end_time']) . ' PT';

    if ($status === 'approved') {
        $subject = "Call Confirmed — $date";
        $body = "<p>Hi {$booking['name']},</p>
            <p>Your call is confirmed!</p>
            <div class='highlight'>
                <div class='detail'><span class='label'>Date:</span> $date</div>
                <div class='detail'><span class='label'>Time:</span> $time</div>
                <div class='detail'><span class='label'>Duration:</span> 30 minutes</div>
            </div>
            <p>I'll reach out before the call with a link or phone number. If you need to reschedule, just reply.</p>
            <p>Talk soon!<br>— Jesse</p>";
        $title = 'Call Confirmed';
    } else {
        $subject = "Call Request Update — $date";
        $body = "<p>Hi {$booking['name']},</p>
            <p>Unfortunately I'm unable to make the requested time:</p>
            <div class='highlight'>
                <div class='detail'><span class='label'>Date:</span> $date</div>
                <div class='detail'><span class='label'>Time:</span> $time</div>
            </div>
            <p>Feel free to <a href='" . SITE_URL . "/#contact'>pick another time</a> or reply to this email.</p>
            <p>— Jesse</p>";
        $title = 'Scheduling Update';
    }

    $html = emailTemplate($title, $body);
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . CONTACT_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    @mail($booking['email'], $subject, $html, $headers);
}

// ── Rate Limiting ──

function isLoginRateLimited() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/bitglow_rate_login.json';

    $data = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: [];
    }

    $now = time();
    $data = array_filter($data, function($ts) use ($now) { return ($now - $ts) < 900; });

    $count = 0;
    foreach ($data as $key => $ts) {
        if (strpos($key, $ip . '_') === 0) $count++;
    }

    if ($count >= 5) return true;

    $data[$ip . '_' . $now . '_' . mt_rand()] = $now;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return false;
}
