<?php

namespace App\Console\Commands;

use App\Jobs\SyncTwilioLogsJob;
use App\Models\TwilioSetting;
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
            SyncTwilioLogsJob::dispatch($setting->id);
            $this->info("Queued sync for organization: {$setting->organization_id} (Number: {$setting->phone_number})");
        }

        $this->info('Twilio sync jobs queued.');
        return 0;
    }
}
