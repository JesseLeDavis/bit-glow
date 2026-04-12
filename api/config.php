<?php
/**
 * BitGlow API Configuration
 */

// Site
define('SITE_NAME', 'BitGlow');
define('SITE_URL', 'https://bitglow.tech');
define('CONTACT_EMAIL', 'hello@bitglow.tech');
define('FROM_EMAIL', 'noreply@bitglow.tech');
define('FROM_NAME', 'BitGlow');

// Admin auth — generate hash: php -r "echo password_hash('your-password', PASSWORD_BCRYPT, ['cost' => 12]);"
define('ADMIN_PASSWORD_HASH', '$2y$12$SgwyWeWQqy4GnFT9/PozA.bSB1gBtAt7CbflRk.cKwpS7icZgkiWu'); // password: bitglow-admin — CHANGE BEFORE DEPLOYING
define('JWT_SECRET', 'change-this-to-a-long-random-string'); // CHANGE THIS
define('JWT_EXPIRY', 86400); // 24 hours

// Scheduling
define('BUSINESS_DAYS', [1, 2, 3, 4, 5]); // Mon=1 ... Fri=5
define('SCHEDULE_START', '09:00');
define('SCHEDULE_END', '17:00');
define('SLOT_DURATION', 30); // minutes
define('BOOKING_BUFFER_HOURS', 1); // minimum hours ahead to book
define('TIMEZONE', 'America/Los_Angeles');

// Rate limiting
define('RATE_LIMIT_MAX', 3);
define('RATE_LIMIT_WINDOW', 900); // 15 minutes

// Database
define('DB_PATH', __DIR__ . '/data/bitglow.db');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

date_default_timezone_set(TIMEZONE);
