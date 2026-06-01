<?php

/**
 * GitHub webhook deployment handler.
 * URL: https://yourdomain.com/deploy.php
 *
 * Setup steps:
 *  1. Set DEPLOY_SECRET below (must match the secret you set in GitHub webhook settings).
 *  2. Push this file to GitHub so Hostinger has it.
 *  3. In GitHub → repo → Settings → Webhooks → add webhook:
 *       Payload URL : https://yourdomain.com/deploy.php
 *       Content type: application/json
 *       Secret      : <same value as DEPLOY_SECRET below>
 *       Events      : Just the push event
 */

define('DEPLOY_SECRET', 'CHANGE_THIS_TO_YOUR_SECRET');
define('DEPLOY_BRANCH', 'refs/heads/main');
define('PROJECT_ROOT',  dirname(__DIR__));
define('LOG_FILE',      PROJECT_ROOT . '/storage/logs/deploy.log');

// ── helpers ──────────────────────────────────────────────────────────────────

function logMsg(string $msg): void
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents(LOG_FILE, $line, FILE_APPEND | LOCK_EX);
    echo $line;
}

function run(string $cmd): string
{
    $output = shell_exec("cd " . escapeshellarg(PROJECT_ROOT) . " && $cmd 2>&1");
    return trim((string) $output);
}

function abort(int $code, string $msg): never
{
    http_response_code($code);
    logMsg("ABORT $code: $msg");
    exit($msg);
}

// ── verify request ────────────────────────────────────────────────────────────

$payload = file_get_contents('php://input');

if (empty($payload)) {
    abort(400, 'Empty payload');
}

$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
if (empty($signature)) {
    abort(403, 'Missing signature header');
}

$expected = 'sha256=' . hash_hmac('sha256', $payload, DEPLOY_SECRET);
if (!hash_equals($expected, $signature)) {
    abort(403, 'Invalid signature');
}

$data = json_decode($payload, true);
$ref  = $data['ref'] ?? '';

if ($ref !== DEPLOY_BRANCH) {
    http_response_code(200);
    logMsg("Ignored push to $ref (not main)");
    exit('Not main branch, skipping.');
}

// ── deploy ───────────────────────────────────────────────────────────────────

logMsg('=== Deployment started (commit: ' . ($data['after'] ?? 'unknown') . ') ===');

// Pull latest code
logMsg('>> git pull');
logMsg(run('git pull origin main'));

// Install/update Composer dependencies
logMsg('>> composer install');
logMsg(run('composer install --no-dev --no-interaction --optimize-autoloader'));

// Run database migrations
logMsg('>> php artisan migrate');
logMsg(run('php artisan migrate --force'));

// Clear and rebuild caches
logMsg('>> cache:clear');
logMsg(run('php artisan config:cache'));
logMsg(run('php artisan route:cache'));
logMsg(run('php artisan view:cache'));
logMsg(run('php artisan event:cache'));

// Fix storage symlink if missing
logMsg('>> storage:link');
logMsg(run('php artisan storage:link'));

logMsg('=== Deployment complete ===');
http_response_code(200);
echo 'Deployed successfully';
