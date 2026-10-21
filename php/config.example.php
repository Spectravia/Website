<?php
/**
 * Contact form configuration for the static build (PHP endpoint).
 *
 * Copy this file and fill in the values. Preferred location (outside the web
 * root, never downloadable):
 *
 *   <home>/spectravia-contact-config.php      ← next to public_html/
 *
 * Alternative: api/config.php inside the site (protected by api/.htaccess on
 * Apache/LiteSpeed). You can also point to any path with the
 * SPECTRAVIA_CONTACT_CONFIG environment variable.
 */
return [
    'smtp' => [
        'host'   => 'smtp.example.com',
        'port'   => 465,
        'secure' => 'ssl',            // 'ssl' (port 465) or 'tls' (STARTTLS, port 587)
        'user'   => 'hi@spectravia.net',
        'pass'   => 'change-me',
    ],

    'from_email'     => 'hi@spectravia.net',
    'from_name'      => 'Spectravia Website',
    'to'             => 'hi@spectravia.net',  // comma-separated for several recipients
    'subject_prefix' => '[Spectravia website]',

    // Google reCAPTCHA v3 — leave secret_key empty to disable verification.
    // The SITE key goes into the build (.env.static → NUXT_PUBLIC_RECAPTCHA_SITE_KEY).
    'recaptcha' => [
        'secret_key' => '',
        'min_score'  => 0.5,          // 0.0 (bot) … 1.0 (human)
    ],

    'rate_limit' => [
        'max'            => 5,
        'window_minutes' => 15,
    ],

    // Set to true only if the site sits behind a proxy/CDN that sets X-Forwarded-For.
    'trust_proxy' => false,
];
