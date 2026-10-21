<?php
/**
 * POST /api/contact.php — contact form endpoint for the STATIC build.
 *
 * Mirrors server/api/contact.post.ts (used by the Node build):
 * same JSON payload, same validation rules, honeypot, per-IP rate limit,
 * Google reCAPTCHA v3 verification, then delivery over SMTP (PHPMailer).
 *
 * Responses: 200 {ok:true} | 403 captcha | 405 method | 422 invalid | 429 rate limit | 500/502 delivery
 * Requires PHP >= 7.4 with the openssl and curl (or allow_url_fopen) extensions.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailerException;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/* ---------- helpers ---------- */

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $message, array $extra = []): void
{
    respond($status, array_merge(['error' => true, 'statusCode' => $status, 'statusMessage' => $message], $extra));
}

/**
 * Config lookup: a file OUTSIDE the web root is preferred (two levels up from
 * /api/, i.e. next to public_html), falling back to api/config.php.
 */
function load_config(): array
{
    $candidates = [
        getenv('SPECTRAVIA_CONTACT_CONFIG') ?: null,
        dirname(__DIR__, 2) . '/spectravia-contact-config.php',
        __DIR__ . '/config.php',
    ];
    foreach (array_filter($candidates) as $file) {
        if (is_file($file)) {
            $config = require $file;
            if (is_array($config)) {
                return $config;
            }
        }
    }
    fail(500, 'Mail transport is not configured');
}

function client_ip(): string
{
    // Only REMOTE_ADDR is trusted; set 'trust_proxy' => true when behind a known proxy/CDN.
    global $config;
    if (!empty($config['trust_proxy']) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/** Fixed-window rate limit stored in the system temp dir. */
function rate_limited(string $ip, int $max, int $windowSeconds): bool
{
    $file = sys_get_temp_dir() . '/spectravia-contact-' . hash('sha256', $ip) . '.json';
    $now = time();
    $entry = ['count' => 0, 'reset' => $now + $windowSeconds];

    if (is_file($file)) {
        $data = json_decode((string) @file_get_contents($file), true);
        if (is_array($data) && ($data['reset'] ?? 0) > $now) {
            $entry = $data;
        }
    }
    $entry['count']++;
    @file_put_contents($file, json_encode($entry), LOCK_EX);

    return $entry['count'] > $max;
}

function http_post(string $url, array $fields): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($fields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return is_string($result) ? $result : null;
    }
    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($fields),
        'timeout' => 10,
    ]]);
    $result = @file_get_contents($url, false, $context);
    return $result === false ? null : $result;
}

function verify_recaptcha(array $recaptcha, string $token, string $ip): bool
{
    if (empty($recaptcha['secret_key'])) {
        return true; // not configured → disabled
    }
    if ($token === '') {
        return false;
    }
    $raw = http_post('https://www.google.com/recaptcha/api/siteverify', [
        'secret' => $recaptcha['secret_key'],
        'response' => $token,
        'remoteip' => $ip,
    ]);
    $result = $raw ? json_decode($raw, true) : null;
    if (!is_array($result) || empty($result['success'])) {
        return false;
    }
    if (isset($result['action']) && $result['action'] !== 'contact') {
        return false;
    }
    return !isset($result['score']) || (float) $result['score'] >= (float) ($recaptcha['min_score'] ?? 0.5);
}

function str(array $data, string $key): string
{
    $value = $data[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

function len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

/** Same rules as shared/schemas/contact.ts. Error messages are the same i18n keys. */
function validate(array $data): array
{
    $issues = [];
    $required = ['firstName' => 100, 'lastName' => 100];
    foreach ($required as $field => $max) {
        $v = str($data, $field);
        if ($v === '') $issues[] = ['path' => $field, 'message' => 'contact.errors.required'];
        elseif (len($v) > $max) $issues[] = ['path' => $field, 'message' => 'contact.errors.tooLong'];
    }

    $email = str($data, 'email');
    if ($email === '') $issues[] = ['path' => 'email', 'message' => 'contact.errors.required'];
    elseif (len($email) > 254) $issues[] = ['path' => 'email', 'message' => 'contact.errors.tooLong'];
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $issues[] = ['path' => 'email', 'message' => 'contact.errors.email'];

    foreach (['company' => 150, 'phone' => 40, 'topic' => 50, 'locale' => 10] as $field => $max) {
        if (len(str($data, $field)) > $max) $issues[] = ['path' => $field, 'message' => 'contact.errors.tooLong'];
    }

    $message = str($data, 'message');
    if ($message === '') $issues[] = ['path' => 'message', 'message' => 'contact.errors.required'];
    elseif (len($message) < 10) $issues[] = ['path' => 'message', 'message' => 'contact.errors.tooShort'];
    elseif (len($message) > 4000) $issues[] = ['path' => 'message', 'message' => 'contact.errors.tooLong'];

    if (($data['consent'] ?? null) !== true) $issues[] = ['path' => 'consent', 'message' => 'contact.errors.consent'];

    return $issues;
}

function esc(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/* ---------- request handling ---------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'Method not allowed');
}

$config = load_config();
$ip = client_ip();

$limits = $config['rate_limit'] ?? [];
if (rate_limited($ip, (int) ($limits['max'] ?? 5), (int) ($limits['window_minutes'] ?? 15) * 60)) {
    fail(429, 'Too many requests');
}

$raw = file_get_contents('php://input', false, null, 0, 64 * 1024);
$data = json_decode((string) $raw, true);
if (!is_array($data)) {
    fail(422, 'Invalid submission');
}

$issues = validate($data);
if ($issues) {
    fail(422, 'Invalid submission', ['data' => ['issues' => $issues]]);
}

// Honeypot filled → silently accept so bots don't learn anything.
if (str($data, 'website') !== '') {
    respond(200, ['ok' => true]);
}

if (!verify_recaptcha($config['recaptcha'] ?? [], str($data, 'recaptchaToken'), $ip)) {
    fail(403, 'Captcha verification failed');
}

/* ---------- email ---------- */

$fullName = str($data, 'firstName') . ' ' . str($data, 'lastName');
$rows = [
    'Name' => $fullName,
    'Email' => str($data, 'email'),
    'Company' => str($data, 'company') ?: '—',
    'Phone' => str($data, 'phone') ?: '—',
    'Topic' => str($data, 'topic') ?: 'general',
    'Language' => str($data, 'locale') ?: 'en',
    'Received' => gmdate('c'),
];

$text = '';
$htmlRows = '';
foreach ($rows as $label => $value) {
    $text .= "$label: $value\n";
    $htmlRows .= '<tr><td style="color:#666;padding-right:16px">' . $label . '</td><td><strong>' . esc($value) . '</strong></td></tr>';
}
$text .= "\nMessage:\n" . str($data, 'message');

$html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1d1d2b;max-width:640px">'
    . '<h2 style="margin:0 0 16px;color:#7B3EEC">New contact request</h2>'
    . '<table cellpadding="6" style="border-collapse:collapse;font-size:14px">' . $htmlRows . '</table>'
    . '<h3 style="margin:24px 0 8px">Message</h3>'
    . '<p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:0">' . esc(str($data, 'message')) . '</p></div>';

$smtp = $config['smtp'] ?? [];
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = (string) ($smtp['host'] ?? '');
    $mail->Port = (int) ($smtp['port'] ?? 465);
    $mail->SMTPAuth = true;
    $mail->Username = (string) ($smtp['user'] ?? '');
    $mail->Password = (string) ($smtp['pass'] ?? '');
    $mail->SMTPSecure = ($smtp['secure'] ?? 'ssl') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->Timeout = 15;

    $mail->setFrom((string) ($config['from_email'] ?? $mail->Username), (string) ($config['from_name'] ?? 'Website'));
    foreach (array_filter(array_map('trim', explode(',', (string) ($config['to'] ?? '')))) as $recipient) {
        $mail->addAddress($recipient);
    }
    $mail->addReplyTo(str($data, 'email'), $fullName);

    $mail->Subject = trim(($config['subject_prefix'] ?? '[Website]') . ' ' . $rows['Topic'] . ' — ' . $fullName);
    $mail->isHTML(true);
    $mail->Body = $html;
    $mail->AltBody = $text;

    $mail->send();
} catch (MailerException $e) {
    error_log('[contact] mail delivery failed: ' . $mail->ErrorInfo);
    fail(502, 'Message could not be delivered');
}

respond(200, ['ok' => true]);
