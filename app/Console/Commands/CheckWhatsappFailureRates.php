<?php

namespace App\Console\Commands;

use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappCredentialAuditLog;
use App\Models\WhatsappMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckWhatsappFailureRates extends Command
{
    protected $signature = 'whatsapp:check-failure-rates';

    protected $description = 'Auto-disable tenants whose WhatsApp failure rate over the last 30 minutes crosses a threshold';

    private const WINDOW_MINUTES = 30;
    private const MIN_SAMPLE_SIZE = 10;
    private const FAILURE_THRESHOLD = 0.5;

    public function handle(): int
    {
        $since = now()->subMinutes(self::WINDOW_MINUTES);

        TenantWhatsappSettings::where('is_enabled', true)->get()->each(function (TenantWhatsappSettings $settings) use ($since) {
            $counts = WhatsappMessage::withoutGlobalScopes()
                ->where('organization_id', $settings->organization_id)
                ->where('direction', 'outbound')
                ->where('created_at', '>=', $since)
                ->selectRaw("count(*) as total, sum(case when status = 'failed' then 1 else 0 end) as failed")
                ->first();

            $total  = (int) ($counts->total ?? 0);
            $failed = (int) ($counts->failed ?? 0);

            if ($total < self::MIN_SAMPLE_SIZE) {
                return;
            }

            $failureRate = $failed / $total;

            if ($failureRate < self::FAILURE_THRESHOLD) {
                return;
            }

            $settings->update(['is_enabled' => false, 'disabled_at' => now()]);

            WhatsappCredentialAuditLog::create([
                'action'  => 'auto_disabled_tenant',
                'changes' => [
                    'organization_id' => $settings->organization_id,
                    'total_messages'  => $total,
                    'failed_messages' => $failed,
                    'failure_rate'    => round($failureRate, 2),
                ],
            ]);

            Log::critical('WhatsApp auto-disabled tenant due to high failure rate', [
                'organization_id' => $settings->organization_id,
                'failure_rate'    => round($failureRate, 2),
                'total'           => $total,
                'failed'          => $failed,
            ]);

            $this->warn("Auto-disabled WhatsApp for org #{$settings->organization_id} — failure rate " . round($failureRate * 100) . '%');
        });

        return self::SUCCESS;
    }
}
