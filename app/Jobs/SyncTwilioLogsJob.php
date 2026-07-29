<?php

namespace App\Jobs;

use App\Models\TwilioSetting;
use App\Services\TwilioService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncTwilioLogsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(
        public readonly int $settingId,
    ) {}

    public function handle(): void
    {
        $setting = TwilioSetting::find($this->settingId);

        if (! $setting) {
            return;
        }

        $service = new TwilioService($setting);
        $res     = $service->syncLogs();

        if ($res['success']) {
            Log::info("Twilio sync complete for org:{$setting->organization_id} — {$res['calls']} calls, {$res['messages']} messages.");
        } else {
            Log::error("Twilio sync failed for org:{$setting->organization_id} — {$res['error']}");
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error("Twilio sync job permanently failed for setting:{$this->settingId}", ['error' => $e->getMessage()]);
    }
}
