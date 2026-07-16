<?php

namespace App\Console\Commands;

use App\Models\TwilioSetting;
use App\Services\TwilioService;
use Illuminate\Console\Command;

class SyncTwilioLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'twilio:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync recent call and message logs from Twilio for all active organizations';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $settings = TwilioSetting::where('is_active', true)->whereNotNull('validated_at')->get();
        
        $this->info("Found " . $settings->count() . " active Twilio configurations to sync.");

        foreach ($settings as $setting) {
            $this->info("Syncing organization: {$setting->organization_id} (Number: {$setting->phone_number})");
            
            $service = new TwilioService($setting);
            $res = $service->syncLogs();

            if ($res['success']) {
                $this->info("Successfully synced {$res['calls']} calls and {$res['messages']} messages.");
            } else {
                $this->error("Sync failed: {$res['error']}");
            }
        }

        $this->info('Twilio sync complete.');
        return 0;
    }
}
