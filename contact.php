<?php
/**
 * BitGlow Contact Form Handler
 * Simple PHP backend for handling contact form submissions
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show errors to users
ini_set('log_errors', 1); // Log errors to file
ini_set('error_log', __DIR__ . '/php_errors.log'); // Error log file

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow from anywhere (or specify your domain)
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Configuration
define('CONTACT_EMAIL', 'jesse@bitglow.tech'); // Where to send submissions
define('FROM_EMAIL', 'hello@bitglow.tech');    // From address for emails
define('SITE_NAME', 'BitGlow');
define('SEND_AUTO_REPLY', true); // Send confirmation to user?
define('RATE_LIMIT_ENABLED', true); // Enable rate limiting?
define('RATE_LIMIT_MAX', 3); // Max submissions per time window
define('RATE_LIMIT_WINDOW', 900); // Time window in seconds (900 = 15 minutes)

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// If no JSON, try regular POST
if (!$data) {
    $data = $_POST;
}

// Validate input
$errors = validateInput($data);
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Validation failed',
        'details' => $errors
    ]);
    exit();
}

// Rate limiting
if (RATE_LIMIT_ENABLED && isRateLimited()) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error' => 'Too many submissions. Please try again later.'
    ]);
    exit();
}

// Extract and sanitize data
$name    = sanitize($data['name']);
$email   = sanitize($data['email']);
$subject = isset($data['subject']) ? sanitize($data['subject']) : 'New project inquiry';
$message = sanitize($data['message']);

// Send email to site owner
$ownerEmailSent = sendOwnerEmail($name, $email, $subject, $message);

if (!$ownerEmailSent) {
    // Log the failure
    error_log("Failed to send email to owner. From: $email, Subject: $subject");

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send message. Please try emailing us directly at ' . CONTACT_EMAIL
    ]);
    exit();
} else {
    // Log success
    error_log("Email sent successfully to " . CONTACT_EMAIL . " from $email");
}

// Save to database
try {
    require_once __DIR__ . '/api/db.php';
    $db = getDB();
    $stmt = $db->prepare("INSERT INTO contacts (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message, $_SERVER['REMOTE_ADDR'] ?? '']);
} catch (Exception $e) {
    error_log("DB save failed: " . $e->getMessage());
}

// Send auto-reply to user (optional)
if (SEND_AUTO_REPLY) {
    sendAutoReply($name, $email, $subject, $message);
}

// Log the submission (optional)
logSubmission($name, $email, $subject);

// Success!
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Your message has been sent successfully!'
]);

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Validate form input
 */
function validateInput($data) {
    $errors = [];

    // Check required fields
    if (empty($data['name']) || strlen(trim($data['name'])) < 2) {
        $errors[] = 'Name must be at least 2 characters long';
    }

    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email address is required';
    }

    if (empty($data['message']) || strlen(trim($data['message'])) < 10) {
        $errors[] = 'Message must be at least 10 characters long';
    }

    // Check max lengths
    if (!empty($data['name']) && strlen($data['name']) > 100) {
        $errors[] = 'Name is too long';
    }

    if (!empty($data['email']) && strlen($data['email']) > 100) {
        $errors[] = 'Email is too long';
    }

    if (!empty($data['subject']) && strlen($data['subject']) > 200) {
        $errors[] = 'Subject is too long';
    }

    if (!empty($data['message']) && strlen($data['message']) > 5000) {
        $errors[] = 'Message is too long';
    }

    return $errors;
}

/**
 * Sanitize input
 */
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Send email to site owner
 */
function sendOwnerEmail($name, $email, $subject, $message) {
    $to = CONTACT_EMAIL;
    $emailSubject = SITE_NAME . " Contact: " . $subject;

    // Plain text version
    $textMessage = "New contact form submission from " . SITE_NAME . " website:\n\n";
    $textMessage .= "Name: $name\n";
    $textMessage .= "Email: $email\n";
    $textMessage .= "Subject: $subject\n\n";
    $textMessage .= "Message:\n$message\n\n";
    $textMessage .= "---\n";
    $textMessage .= "Sent from " . SITE_NAME . " contact form\n";

    // HTML version
    $htmlMessage = getOwnerEmailTemplate($name, $email, $subject, $message);

    // Headers
    $headers = getEmailHeaders($email, $name, true);

    // Send
    return mail($to, $emailSubject, $htmlMessage, $headers);
}

/**
 * Send auto-reply to user
 */
function sendAutoReply($name, $email, $subject, $message) {
    $to = $email;
    $emailSubject = "Thanks for contacting " . SITE_NAME . "!";

    // Plain text version
    $textMessage = "Hi $name,\n\n";
    $textMessage .= "Thanks for reaching out! We've received your message and will get back to you within 24 hours.\n\n";
    $textMessage .= "Here's a copy of what you sent:\n\n";
    $textMessage .= "Subject: $subject\n";
    $textMessage .= "Message: $message\n\n";
    $textMessage .= "Best regards,\n";
    $textMessage .= "The " . SITE_NAME . " Team\n\n";
    $textMessage .= "---\n";
    $textMessage .= SITE_NAME . " Development Studio\n";
    $textMessage .= "Salem, Oregon\n";
    $textMessage .= "https://bitglow.tech\n";

    // HTML version
    $htmlMessage = getAutoReplyTemplate($name, $subject, $message);

    // Headers
    $headers = getEmailHeaders(FROM_EMAIL, SITE_NAME, true);

    // Send
    return mail($to, $emailSubject, $htmlMessage, $headers);
}

/**
 * Get email headers
 */
function getEmailHeaders($fromEmail, $fromName, $isHtml = true) {
    $headers = [];
    $headers[] = "From: " . $fromName . " <" . $fromEmail . ">";
    $headers[] = "Reply-To: " . $fromEmail;
    $headers[] = "X-Mailer: PHP/" . phpversion();

    if ($isHtml) {
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
    }

    return implode("\r\n", $headers);
}

/**
 * HTML email template for owner
 */
function getOwnerEmailTemplate($name, $email, $subject, $message) {
    $message = nl2br(htmlspecialchars($message));

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background-color: #0a0e27; color: #d4d4d4; padding: 20px; margin: 0; }
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
            <div class="value">$name</div>
        </div>

        <div class="field">
            <div class="label">EMAIL:</div>
            <div class="value">$email</div>
        </div>

        <div class="field">
            <div class="label">SUBJECT:</div>
            <div class="value">$subject</div>
        </div>

        <div class="field">
            <div class="label">MESSAGE:</div>
            <div class="message-box">$message</div>
        </div>

        <div class="footer">
            Sent from BitGlow contact form
        </div>
    </div>
</body>
</html>
HTML;
}

/**
 * HTML email template for auto-reply
 */
function getAutoReplyTemplate($name, $subject, $message) {
    $message = nl2br(htmlspecialchars($message));

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background-color: #0a0e27; color: #d4d4d4; padding: 20px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1f3a; border: 2px solid #00e5cc; padding: 30px; }
        .header { color: #00e5cc; font-size: 24px; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .message-box { background-color: #0a0e27; border-left: 3px solid #ff6b35; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #00e5cc; color: #888; font-size: 12px; }
        a { color: #00e5cc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Thanks for contacting BitGlow! ⚡</div>

        <div class="content">
            <p>Hi $name,</p>
            <p>Thanks for reaching out! I've received your message and will get back to you within one business day — usually sooner.</p>
            <p><strong>Here's a copy of what you sent:</strong></p>

            <div class="message-box">
                <strong>Subject:</strong> $subject<br><br>
                <strong>Message:</strong><br>
                $message
            </div>

            <p>— Jesse<br>BitGlow Development Studio</p>
        </div>

        <div class="footer">
            BitGlow Development Studio<br>
            Salem, Oregon<br>
            <a href="https://bitglow.tech">https://bitglow.tech</a>
        </div>
    </div>
</body>
</html>
HTML;
}

/**
 * Simple rate limiting using file-based storage
 */
function isRateLimited() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $dataFile = sys_get_temp_dir() . '/contact_rate_limit.json';

    // Load existing data
    $data = [];
    if (file_exists($dataFile)) {
        $json = file_get_contents($dataFile);
        $data = json_decode($json, true) ?: [];
    }

    // Clean old entries
    $now = time();
    $data = array_filter($data, function($timestamp) use ($now) {
        return ($now - $timestamp) < RATE_LIMIT_WINDOW;
    });

    // Check if IP is rate limited
    $ipSubmissions = array_filter($data, function($timestamp, $key) use ($ip) {
        return strpos($key, $ip) === 0;
    }, ARRAY_FILTER_USE_BOTH);

    if (count($ipSubmissions) >= RATE_LIMIT_MAX) {
        return true;
    }

    // Add current submission
    $data[$ip . '_' . $now] = $now;

    // Save data
    file_put_contents($dataFile, json_encode($data));

    return false;
}

/**
 * Log submission (optional)
 */
function logSubmission($name, $email, $subject) {
    $logFile = __DIR__ . '/contact_submissions.log';
    $logEntry = date('Y-m-d H:i:s') . " | $name | $email | $subject\n";

    // Uncomment to enable logging
    // file_put_contents($logFile, $logEntry, FILE_APPEND);
}
