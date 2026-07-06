<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Drafts a single LinkedIn outreach message for a captured lead, using the
 * org's configured AiService (same provider as the rest of the app — no
 * dedicated AI client for this feature). The draft is always shown to the
 * user for manual review/copy; nothing here ever sends anything.
 */
class LeadOutreachMessageService
{
    private ?AiService $ai;

    public function __construct(int $organizationId)
    {
        $this->ai = AiService::forOrg($organizationId);
    }

    public function isConfigured(): bool
    {
        return $this->ai !== null && $this->ai->isConfigured();
    }

    /**
     * @param array{first_name:?string,last_name:?string,job_title:?string,company:?string,city:?string,country:?string,notes:?string} $profile
     * @return array{hold_off: bool, message: ?string}|null
     */
    public function generate(array $profile): ?array
    {
        if (! $this->isConfigured()) {
            return null;
        }

        $content = $this->ai->chat($this->systemPrompt(), $this->userMessage($profile), 300);

        if ($content === null) {
            Log::warning('LeadOutreachMessageService: generation failed');
            return null;
        }

        $decoded = $this->decodeJson($content);
        if (! $decoded || ! array_key_exists('hold_off', $decoded)) {
            Log::warning('LeadOutreachMessageService: response was not usable', ['raw' => mb_substr($content, 0, 500)]);
            return null;
        }

        $holdOff = (bool) $decoded['hold_off'];

        return [
            'hold_off' => $holdOff,
            'message'  => $holdOff ? null : trim((string) ($decoded['message'] ?? '')),
        ];
    }

    private function userMessage(array $profile): string
    {
        $name = trim(($profile['first_name'] ?? '').' '.($profile['last_name'] ?? ''));
        $location = trim(($profile['city'] ?? '').' '.($profile['country'] ?? ''));

        $lines = ["Name: {$name}"];
        if (! empty($profile['job_title'])) $lines[] = "Headline/title: {$profile['job_title']}";
        if (! empty($profile['company'])) $lines[] = "Company: {$profile['company']}";
        if ($location !== '') $lines[] = "Location: {$location}";
        if (! empty($profile['notes'])) $lines[] = "Additional notes: {$profile['notes']}";

        return implode("\n", $lines);
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
You write one short LinkedIn outreach message that a person will review and send manually.

Rules for the message:
- 2 to 4 short sentences only.
- Reference one or two real details from the supplied profile (their role, company, or location) so it does not read like a template.
- No pitch, no selling, no mention of any company, product, CRM, or software.
- End with one open question asking how they currently manage leads, follow ups, or their sales pipeline.
- Do not use dashes (em dash, en dash, or a hyphen used as a pause) anywhere in the message.
- Do not use AI-sounding phrases like "I hope this message finds you well", "I wanted to reach out", "in today's fast-paced world", or similar.
- Do not use emojis unless the supplied profile text itself contains one.
- Plain conversational language, like one professional messaging another on LinkedIn.

Safety check: if the profile details signal something sensitive (a health issue, a job loss or layoff, grief, or financial stress), do not draft a message at all, flag it instead.

Respond with ONLY a single JSON object, no prose, no markdown, no code fences:
{ "hold_off": true|false, "message": "the drafted message, or empty string if hold_off is true" }
PROMPT;
    }

    private function decodeJson(string $content): ?array
    {
        $content = trim($content);
        if ($content === '') return null;

        $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content);

        if (preg_match('/\{.*\}/s', $content, $m)) {
            $content = $m[0];
        }

        $decoded = json_decode($content, true);
        return is_array($decoded) ? $decoded : null;
    }
}
