<?php
/**
 * BitGlow Scheduling API
 *
 * GET  ?action=available-dates&month=2026-04
 * GET  ?action=slots&date=2026-04-13
 * POST ?action=book  {name, email, date, start_time}
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'available-dates':
        handleAvailableDates();
        break;
    case 'slots':
        handleSlots();
        break;
    case 'book':
        handleBook();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}

// ── Handlers ──

function handleAvailableDates() {
    $today = date('Y-m-d');
    $month = $_GET['month'] ?? null;

    if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
        [$year, $m] = explode('-', $month);
        $startDate = "$month-01";
        if ($startDate < $today) $startDate = $today;
        $endDate = date('Y-m-t', mktime(0, 0, 0, (int)$m, 1, (int)$year));
    } else {
        $startDate = $today;
        $endDate = date('Y-m-d', strtotime('+30 days'));
    }

    $dates = [];
    $current = new DateTime($startDate);
    $end = new DateTime($endDate);

    while ($current <= $end) {
        $dateStr = $current->format('Y-m-d');
        $slots = getAvailableSlots($dateStr);
        if (!empty($slots)) {
            $dates[] = $dateStr;
        }
        $current->modify('+1 day');
    }

    echo json_encode(['dates' => $dates]);
}

function handleSlots() {
    $date = $_GET['date'] ?? '';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD.']);
        return;
    }

    $slots = getAvailableSlots($date);
    echo json_encode(['date' => $date, 'slots' => $slots]);
}

function handleBook() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'POST required']);
        return;
    }

    // Rate limit
    if (isRateLimited('book')) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many booking attempts. Please try again later.']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $date = $data['date'] ?? '';
    $startTime = $data['start_time'] ?? '';

    // Validate
    $errors = [];
    if (strlen($name) < 2) $errors[] = 'Name must be at least 2 characters';
    if (strlen($name) > 100) $errors[] = 'Name is too long';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) $errors[] = 'Valid date is required';
    if (!preg_match('/^\d{2}:\d{2}$/', $startTime)) $errors[] = 'Valid start time is required';

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Validation failed', 'details' => $errors]);
        return;
    }

    // Check slot is still available
    if (!isSlotAvailable($date, $startTime)) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'This time slot is no longer available. Please choose another.']);
        return;
    }

    $endTime = computeEndTime($startTime);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO bookings (name, email, date, start_time, end_time, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$safeName, $safeEmail, $date, $startTime, $endTime, $ip]);
    $id = $db->lastInsertId();

    $booking = [
        'id' => (int)$id,
        'name' => $safeName,
        'email' => $safeEmail,
        'date' => $date,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'status' => 'pending'
    ];

    // Send emails (non-blocking best effort)
    sendBookingConfirmationEmail($booking);
    sendBookingOwnerNotification($booking);

    echo json_encode(['success' => true, 'booking' => $booking]);
}

// ── Availability Engine ──

function generateTimeSlots($start, $end) {
    $slots = [];
    $currentMin = timeToMinutes($start);
    $endMin = timeToMinutes($end);

    while ($currentMin + SLOT_DURATION <= $endMin) {
        $slots[] = [
            'start' => minutesToTime($currentMin),
            'end' => minutesToTime($currentMin + SLOT_DURATION)
        ];
        $currentMin += SLOT_DURATION;
    }
    return $slots;
}

function getAvailableSlots($dateStr) {
    if ($dateStr < date('Y-m-d')) return [];

    $dow = (int)(new DateTime($dateStr))->format('w'); // 0=Sun, 6=Sat
    if (!in_array($dow, BUSINESS_DAYS)) return [];

    $slots = generateTimeSlots(SCHEDULE_START, SCHEDULE_END);

    // Apply overrides
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM availability_overrides WHERE date = ? OR (date IS NULL AND day_of_week = ?)");
    $stmt->execute([$dateStr, $dow]);
    $overrides = $stmt->fetchAll();

    foreach ($overrides as $o) {
        if ($o['is_blocked']) {
            if (!$o['start_time'] && !$o['end_time']) {
                return []; // Entire day blocked
            }
            $slots = array_values(array_filter($slots, function($s) use ($o) {
                return $s['end'] <= $o['start_time'] || $s['start'] >= $o['end_time'];
            }));
        }
    }

    // Remove booked slots
    $stmt = $db->prepare("SELECT start_time FROM bookings WHERE date = ? AND status IN ('pending', 'approved')");
    $stmt->execute([$dateStr]);
    $booked = array_column($stmt->fetchAll(), 'start_time');

    $slots = array_values(array_filter($slots, function($s) use ($booked) {
        return !in_array($s['start'], $booked);
    }));

    // Remove past slots if today
    $today = date('Y-m-d');
    if ($dateStr === $today) {
        $bufferMin = (int)date('H') * 60 + (int)date('i') + (BOOKING_BUFFER_HOURS * 60);
        $slots = array_values(array_filter($slots, function($s) use ($bufferMin) {
            return timeToMinutes($s['start']) >= $bufferMin;
        }));
    }

    return $slots;
}

function isSlotAvailable($dateStr, $startTime) {
    $slots = getAvailableSlots($dateStr);
    foreach ($slots as $s) {
        if ($s['start'] === $startTime) return true;
    }
    return false;
}

function computeEndTime($startTime) {
    return minutesToTime(timeToMinutes($startTime) + SLOT_DURATION);
}

function timeToMinutes($time) {
    [$h, $m] = explode(':', $time);
    return (int)$h * 60 + (int)$m;
}

function minutesToTime($min) {
    return sprintf('%02d:%02d', intdiv($min, 60), $min % 60);
}

function formatTime12($time24) {
    [$h, $m] = explode(':', $time24);
    $h = (int)$h;
    $ampm = $h >= 12 ? 'PM' : 'AM';
    $h12 = $h % 12 ?: 12;
    return "$h12:$m $ampm";
}

function formatDateLong($dateStr) {
    return (new DateTime($dateStr))->format('l, F j, Y');
}

// ── Rate Limiting ──

function isRateLimited($prefix = 'general') {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . "/bitglow_rate_{$prefix}.json";

    $data = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: [];
    }

    $now = time();
    // Clean old entries
    $data = array_filter($data, function($ts) use ($now) { return ($now - $ts) < RATE_LIMIT_WINDOW; });

    // Count IP entries
    $count = 0;
    foreach ($data as $key => $ts) {
        if (strpos($key, $ip . '_') === 0) $count++;
    }

    if ($count >= RATE_LIMIT_MAX) return true;

    $data[$ip . '_' . $now . '_' . mt_rand()] = $now;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return false;
}

// ── Email Helpers ──

function emailTemplate($title, $bodyHtml, $borderColor = '#00e5cc') {
    return <<<HTML
<!DOCTYPE html>
<html>
<head><style>
body{font-family:'Courier New',monospace;background:#0a0e27;color:#d4d4d4;padding:20px;margin:0}
.container{max-width:600px;margin:0 auto;background:#1a1f3a;border:2px solid {$borderColor};padding:30px}
.header{color:{$borderColor};font-size:20px;margin-bottom:20px;font-weight:bold}
.content{line-height:1.8}
.detail{margin:8px 0}.label{color:#00e5cc;font-weight:bold}
.highlight{background:#0a0e27;border-left:3px solid #ff6b35;padding:15px;margin:15px 0}
.footer{margin-top:30px;padding-top:20px;border-top:1px solid {$borderColor};color:#888;font-size:12px}
a{color:#00e5cc}
</style></head>
<body><div class="container">
<div class="header">{$title}</div>
<div class="content">{$bodyHtml}</div>
<div class="footer">BitGlow Development Studio<br>Salem, Oregon<br><a href="https://bitglow.tech">https://bitglow.tech</a></div>
</div></body></html>
HTML;
}

function sendBookingConfirmationEmail($booking) {
    $date = formatDateLong($booking['date']);
    $time = formatTime12($booking['start_time']) . ' – ' . formatTime12($booking['end_time']) . ' PT';

    $body = "<p>Hi {$booking['name']},</p>
        <p>Your call has been requested!</p>
        <div class='highlight'>
            <div class='detail'><span class='label'>Date:</span> $date</div>
            <div class='detail'><span class='label'>Time:</span> $time</div>
            <div class='detail'><span class='label'>Duration:</span> 30 minutes</div>
        </div>
        <p>I'll confirm shortly. If you need to reschedule, just reply to this email.</p>
        <p>— Jesse</p>";

    $html = emailTemplate('Call Request Received', $body);
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . CONTACT_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    @mail($booking['email'], "Call Booked — $date", $html, $headers);
}

function sendBookingOwnerNotification($booking) {
    $date = formatDateLong($booking['date']);
    $time = formatTime12($booking['start_time']) . ' – ' . formatTime12($booking['end_time']) . ' PT';

    $body = "<div class='detail'><span class='label'>Name:</span> {$booking['name']}</div>
        <div class='detail'><span class='label'>Email:</span> {$booking['email']}</div>
        <div class='highlight'>
            <div class='detail'><span class='label'>Date:</span> $date</div>
            <div class='detail'><span class='label'>Time:</span> $time</div>
        </div>
        <p><a href='" . SITE_URL . "/manage-bitglow.html' style='color:#ff6b35;'>Open Admin Panel</a> to approve or decline.</p>";

    $html = emailTemplate('New Call Request', $body, '#ff6b35');
    $headers = "From: BitGlow Scheduler <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: {$booking['email']}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    @mail(CONTACT_EMAIL, "New Call Request — {$booking['name']} on $date", $html, $headers);
}
