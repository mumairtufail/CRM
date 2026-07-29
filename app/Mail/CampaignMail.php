<?php

namespace App\Mail;

use App\Models\EmailCampaign;
use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly EmailCampaign $campaign,
        public readonly Lead $lead,
        public readonly ?string $renderedHtml = null,
        public readonly ?string $fromEmail = null,
        public readonly ?string $fromName  = null,
        public readonly ?string $renderedSubject = null,
        public readonly ?string $messageId = null,
        public readonly ?Collection $attachmentSet = null,
    ) {}

    public function build(): static
    {
        $mail = $this
            ->from(
                $this->fromEmail ?? $this->campaign->from_email,
                $this->fromName  ?? $this->campaign->from_name,
            )
            ->subject($this->renderedSubject ?? $this->campaign->subject)
            ->html($this->renderedHtml ?? $this->campaign->body_html);

        foreach ($this->attachmentSet ?? [] as $att) {
            $mail->attachFromStorageDisk('public', $att->file_path, $att->original_name, [
                'mime' => $att->mime_type,
            ]);
        }

        // Pin an explicit Message-ID so replies (In-Reply-To) and the Sent-folder
        // copy can be tied back to this exact send.
        if ($this->messageId) {
            $mail->withSymfonyMessage(function ($message) {
                $headers = $message->getHeaders();
                $headers->remove('Message-ID');
                $headers->addIdHeader('Message-ID', $this->messageId);
            });
        }

        return $mail;
    }
}
