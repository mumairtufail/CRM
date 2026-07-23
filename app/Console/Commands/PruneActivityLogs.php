<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class PruneActivityLogs extends Command
{
    protected $signature = 'activitylogs:prune';

    protected $description = 'Delete activity log rows older than the configured retention window';

    public function handle(): int
    {
        $days = (int) config('activitylog.retention_days', 30);
        $cutoff = now()->subDays($days);

        $deleted = ActivityLog::withoutGlobalScopes()
            ->where('created_at', '<', $cutoff)
            ->delete();

        $this->info("Pruned {$deleted} activity log row(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
