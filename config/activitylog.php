<?php

return [
    // How many days of activity log rows to keep. Older rows are purged daily
    // by the activitylogs:prune scheduled command (see routes/console.php).
    'retention_days' => env('ACTIVITY_LOG_RETENTION_DAYS', 30),
];
