<?php

use Illuminate\Support\Facades\Schedule;

// Fetch new emails for all IMAP-enabled accounts every 10 minutes
Schedule::command('inboxes:sync')->everyTenMinutes();

// Dispatch follow-up emails for leads who haven't opened the original campaign email
Schedule::command('campaigns:send-followups')->everyFifteenMinutes();

// Flip stale in-progress public form fills to abandoned, and notify on identifiable ones
Schedule::command('forms:sweep-abandoned-sessions')->everyFifteenMinutes();

// Auto-disable tenants whose WhatsApp failure rate crosses a threshold in a rolling window
Schedule::command('whatsapp:check-failure-rates')->everyFiveMinutes();

// Process queued jobs (campaigns etc.) — stops after queue is empty so it doesn't
// stay alive as a persistent process, which shared hosting doesn't support
Schedule::command('queue:work --stop-when-empty --tries=3 --max-time=55')
    ->everyMinute()
    ->withoutOverlapping(2);
