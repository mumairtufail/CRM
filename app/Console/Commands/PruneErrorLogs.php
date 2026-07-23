<?php

namespace App\Console\Commands;

use App\Models\ErrorLog;
use Illuminate\Console\Command;

class PruneErrorLogs extends Command
{
    protected $signature = 'errorlogs:prune';

    protected $description = 'Delete error log rows older than the configured retention window';

    public function handle(): int
    {
        $days = (int) config('activitylog.retention_days', 30);
        $cutoff = now()->subDays($days);

        $deleted = ErrorLog::where('created_at', '<', $cutoff)->delete();

        $this->info("Pruned {$deleted} error log row(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
