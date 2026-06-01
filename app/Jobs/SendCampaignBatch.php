<?php

namespace App\Jobs;

use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendCampaignBatch implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 300;

    public function __construct(
        public readonly int $campaignId,
        public readonly array $leadIds,
        public readonly int $userId,
        public readonly bool $isLastBatch = false,
    ) {}

    public function handle(): void
    {
        $campaign = EmailCampaign::find($this->campaignId);
        $user     = User::find($this->userId);

        if (!$campaign || !$user) return;

        $mailer = MailService::forUser($user);
        if (!$mailer) return;

        $mailer->configureMailer();

        $template = $user->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $templateVars = [
            'company_name' => $user->company_name ?: $campaign->from_name,
            'from_name'    => $campaign->from_name,
            'year'         => date('Y'),
        ];

        $leads = Lead::with('emails')->whereIn('id', $this->leadIds)->get();
        $sent  = 0;

        foreach ($leads as $lead) {
            $email = $lead->primary_email;
            if (!$email) continue;

            $alreadySent = EmailSend::where('email_campaign_id', $campaign->id)
                ->where('lead_id', $lead->id)
                ->where('status', 'sent')
                ->exists();
            if ($alreadySent) continue;

            try {
                $html = $this->buildHtml($campaign->body_html, $lead, $template, $templateVars);

                \Illuminate\Support\Facades\Mail::mailer('dynamic')
                    ->to($email, $lead->full_name)
                    ->send(new CampaignMail($campaign, $lead, $html));

                EmailSend::updateOrCreate(
                    ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                    ['email_used' => $email, 'status' => 'sent', 'sent_at' => now()]
                );
                $sent++;
            } catch (\Throwable) {
                EmailSend::updateOrCreate(
                    ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                    ['email_used' => $email, 'status' => 'failed', 'sent_at' => now()]
                );
            }
        }

        // Update campaign sent_count
        $campaign->increment('sent_count', $sent);

        if ($this->isLastBatch) {
            $campaign->update(['status' => 'sent', 'sent_at' => now()]);
        }
    }

    private function buildHtml(string $bodyHtml, Lead $lead, ?EmailTemplate $template, array $vars): string
    {
        $tokens = [
            '{{first_name}}' => $lead->first_name ?? '',
            '{{last_name}}'  => $lead->last_name  ?? '',
            '{{name}}'       => $lead->full_name  ?? '',
            '{{email}}'      => $lead->primary_email ?? '',
            '{{company}}'    => $lead->company ?? '',
            '{{phone}}'      => $lead->primary_phone ?? '',
            '{{status}}'     => $lead->status ?? '',
        ];

        $html = str_replace(array_keys($tokens), array_values($tokens), $bodyHtml);

        if ($template) {
            $html = $template->render([...$vars, 'content' => $html]);
        }

        return $html;
    }
}
