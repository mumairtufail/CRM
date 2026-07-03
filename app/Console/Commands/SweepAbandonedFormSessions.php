<?php

namespace App\Console\Commands;

use App\Models\FormSession;
use App\Models\Notification;
use Illuminate\Console\Command;

class SweepAbandonedFormSessions extends Command
{
    protected $signature = 'forms:sweep-abandoned-sessions';
    protected $description = 'Mark public form sessions with no recent activity as abandoned, and notify the team when the visitor left an identifying email';

    private const STALE_AFTER_MINUTES = 30;

    public function handle(): void
    {
        $count = 0;

        FormSession::where('status', 'in_progress')
            ->where('last_active_at', '<', now()->subMinutes(self::STALE_AFTER_MINUTES))
            ->with('leadForm:id,name')
            ->chunkById(100, function ($sessions) use (&$count) {
                foreach ($sessions as $session) {
                    $session->update(['status' => 'abandoned']);
                    $count++;

                    // Only worth flagging to the team if we know who to follow up with.
                    if ($session->identifying_email) {
                        Notification::record([
                            'organization_id' => $session->organization_id,
                            'type'            => 'form.abandoned',
                            'title'           => 'A visitor left a form unfinished',
                            'body'            => "{$session->identifying_email} started \"{$session->leadForm->name}\" but didn't submit it.",
                            'link'            => "/forms",
                        ]);
                    }
                }
            });

        $this->info("Done — {$count} session(s) marked abandoned.");
    }
}
