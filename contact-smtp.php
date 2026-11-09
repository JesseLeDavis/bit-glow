<?php
/**
 * BitGlow Contact Form Handler - SMTP Version
 * Uses PHPMailer for reliable email delivery via SMTP
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
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

// ============================================================================
// CONFIGURATION - CHANGE THESE!
// ============================================================================

define('SMTP_HOST', 'smtp.hostinger.com');          // Hostinger SMTP server
define('SMTP_PORT', 587);                            // Port (587 for TLS, 465 for SSL)
define('SMTP_USERNAME', 'noreply@bitglow.tech');    // Your email
define('SMTP_PASSWORD', 'Hiddenhollowman1@'); // Your email password
define('SMTP_ENCRYPTION', 'tls');                    // 'tls' or 'ssl'

define('CONTACT_EMAIL', 'hello@bitglow.tech');      // Where to send submissions
define('FROM_EMAIL', 'noreply@bitglow.tech');       // From address
define('FROM_NAME', 'BitGlow Contact Form');        // From name
define('SITE_NAME', 'BitGlow');

define('SEND_AUTO_REPLY', true);                     // Send confirmation to user?
define('RATE_LIMIT_ENABLED', true);                  // Enable rate limiting?
define('RATE_LIMIT_MAX', 3);                         // Max submissions per time window
define('RATE_LIMIT_WINDOW', 900);                    // Time window in seconds (15 min)

// ============================================================================
// MAIN LOGIC
// ============================================================================

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
$name = sanitize($data['name']);
$email = sanitize($data['email']);
$subject = sanitize($data['subject']);
$message = sanitize($data['message']);

// Send email to site owner
$ownerEmailSent = sendEmailSMTP(
    CONTACT_EMAIL,
    SITE_NAME . " Contact: " . $subject,
    getOwnerEmailTemplate($name, $email, $subject, $message),
    $email,
    $name
);

if (!$ownerEmailSent['success']) {
    error_log("Failed to send email to owner: " . $ownerEmailSent['error']);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send message. Please try emailing us directly at ' . CONTACT_EMAIL,
        'debug' => $ownerEmailSent['error'] // Remove this line in production
    ]);
    exit();
}

error_log("Email sent successfully to " . CONTACT_EMAIL . " from $email");

// Send auto-reply to user
if (SEND_AUTO_REPLY) {
    sendEmailSMTP(
        $email,
        "Thanks for contacting " . SITE_NAME . "!",
        getAutoReplyTemplate($name, $subject, $message),
        FROM_EMAIL,
        SITE_NAME
    );
}

// Success!
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Your message has been sent successfully!'
]);

// ============================================================================
// SMTP EMAIL FUNCTION
// ============================================================================

function sendEmailSMTP($to, $subject, $htmlBody, $replyTo = null, $replyToName = null) {
    try {
        // Create SMTP connection
        $smtp = @fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, 10);

        if (!$smtp) {
            return ['success' => false, 'error' => "Could not connect to SMTP server: $errstr ($errno)"];
        }

        // Read server response
        $response = fgets($smtp, 515);
        if (substr($response, 0, 3) != '220') {
            fclose($smtp);
            return ['success' => false, 'error' => "SMTP connection failed: $response"];
        }

        // Say EHLO
        fputs($smtp, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
        $response = fgets($smtp, 515);

        // Start TLS if using TLS
        if (SMTP_ENCRYPTION === 'tls') {
            fputs($smtp, "STARTTLS\r\n");
            $response = fgets($smtp, 515);

            if (substr($response, 0, 3) != '220') {
                fclose($smtp);
                return ['success' => false, 'error' => "STARTTLS failed: $response"];
            }

            stream_socket_enable_crypto($smtp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

            // Say EHLO again after TLS
            fputs($smtp, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
            $response = fgets($smtp, 515);
        }

        // Authenticate
        fputs($smtp, "AUTH LOGIN\r\n");
        $response = fgets($smtp, 515);

        if (substr($response, 0, 3) != '334') {
            fclose($smtp);
            return ['success' => false, 'error' => "AUTH LOGIN failed: $response"];
        }

        fputs($smtp, base64_encode(SMTP_USERNAME) . "\r\n");
        $response = fgets($smtp, 515);

        if (substr($response, 0, 3) != '334') {
            fclose($smtp);
            return ['success' => false, 'error' => "Username failed: $response"];
        }

        fputs($smtp, base64_encode(SMTP_PASSWORD) . "\r\n");
        $response = fgets($smtp, 515);

        if (substr($response, 0, 3) != '235') {
            fclose($smtp);
            return ['success' => false, 'error' => "Authentication failed. Check your password!"];
        }

        // Send MAIL FROM
        fputs($smtp, "MAIL FROM: <" . FROM_EMAIL . ">\r\n");
        $response = fgets($smtp, 515);

        // Send RCPT TO
        fputs($smtp, "RCPT TO: <$to>\r\n");
        $response = fgets($smtp, 515);

        // Send DATA
        fputs($smtp, "DATA\r\n");
        $response = fgets($smtp, 515);

        // Build email headers and body
        // Line breaks in user-supplied values could otherwise add headers
        $subject = preg_replace('/[\r\n\t]+/', ' ', $subject);
        $replyToName = preg_replace('/[\r\n\t]+/', ' ', (string) $replyToName);

        $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";

        if ($replyTo) {
            $replyToHeader = $replyToName ? "$replyToName <$replyTo>" : $replyTo;
            $headers .= "Reply-To: $replyToHeader\r\n";
        }

        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Subject: $subject\r\n";

        $emailContent = $headers . "\r\n" . $htmlBody . "\r\n.\r\n";

        fputs($smtp, $emailContent);
        $response = fgets($smtp, 515);

        // Quit
        fputs($smtp, "QUIT\r\n");
        fclose($smtp);

        if (substr($response, 0, 3) != '250') {
            return ['success' => false, 'error' => "Email send failed: $response"];
        }

        return ['success' => true];

    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// ============================================================================
// HELPER FUNCTIONS (Same as before)
// ============================================================================

function validateInput($data) {
    $errors = [];

    if (empty($data['name']) || strlen(trim($data['name'])) < 2) {
        $errors[] = 'Name must be at least 2 characters long';
    }

    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email address is required';
    }

    if (empty($data['subject']) || strlen(trim($data['subject'])) < 3) {
        $errors[] = 'Subject must be at least 3 characters long';
    }

    if (empty($data['message']) || strlen(trim($data['message'])) < 10) {
        $errors[] = 'Message must be at least 10 characters long';
    }

    if (!empty($data['name']) && strlen($data['name']) > 100) $errors[] = 'Name is too long';
    if (!empty($data['email']) && strlen($data['email']) > 100) $errors[] = 'Email is too long';
    if (!empty($data['subject']) && strlen($data['subject']) > 200) $errors[] = 'Subject is too long';
    if (!empty($data['message']) && strlen($data['message']) > 5000) $errors[] = 'Message is too long';

    return $errors;
}

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

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
        <div class="footer">Sent from BitGlow contact form</div>
    </div>
</body>
</html>
HTML;
}

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
            <p>Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p>
            <p><strong>Here's a copy of what you sent:</strong></p>
            <div class="message-box">
                <strong>Subject:</strong> $subject<br><br>
                <strong>Message:</strong><br>
                $message
            </div>
            <p>Best regards,<br>The BitGlow Team</p>
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

function isRateLimited() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $dataFile = sys_get_temp_dir() . '/contact_rate_limit.json';

    $data = [];
    if (file_exists($dataFile)) {
        $json = file_get_contents($dataFile);
        $data = json_decode($json, true) ?: [];
    }

    $now = time();
    $data = array_filter($data, function($timestamp) use ($now) {
        return ($now - $timestamp) < RATE_LIMIT_WINDOW;
    });

    $ipSubmissions = array_filter($data, function($timestamp, $key) use ($ip) {
        return strpos($key, $ip) === 0;
    }, ARRAY_FILTER_USE_BOTH);

    if (count($ipSubmissions) >= RATE_LIMIT_MAX) {
        return true;
    }

    $data[$ip . '_' . $now] = $now;
    file_put_contents($dataFile, json_encode($data));

    return false;
}
