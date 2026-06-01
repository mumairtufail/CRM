<?php

namespace App\Mail;

use App\Models\EmailCampaign;
use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly EmailCampaign $campaign,
        public readonly Lead $lead,
        public readonly ?string $renderedHtml = null,
    ) {}

    public function build(): static
    {
        return $this
            ->from($this->campaign->from_email, $this->campaign->from_name)
            ->subject($this->campaign->subject)
            ->html($this->renderedHtml ?? $this->campaign->body_html);
    }
}
