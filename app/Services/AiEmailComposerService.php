<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Generates cold-outreach subject lines, email bodies, and follow-up sequences
 * using the tenant's configured AiService. Falls back to nothing (null) when
 * no AI provider is configured or the call fails — callers must handle that.
 */
class AiEmailComposerService
{
    /** Allowed delay_hours values, in order, matching CampaignController::store() validation. */
    private const STEP_DELAYS = [72, 168, 336];

    private ?AiService $ai;

    public function __construct()
    {
        $this->ai = AiService::forCurrentTenant();
    }

    public function isConfigured(): bool
    {
        return $this->ai !== null && $this->ai->isConfigured();
    }

    /**
     * @param array{hook:string, free_offer:string, has_form:bool} $input
     * @return array{subjects: string[], body_html: string}|null
     */
    public function generateDraft(array $input): ?array
    {
        if (!$this->isConfigured()) return null;

        $userMessage = $this->draftUserMessage($input);
        $content = $this->ai->chat($this->systemPrompt(), $userMessage, 900);

        if ($content === null) {
            Log::warning('AiEmailComposerService: draft generation failed');
            return null;
        }

        $decoded = $this->decodeJson($content);
        if (!$decoded || empty($decoded['subjects']) || empty($decoded['body_html'])) {
            Log::warning('AiEmailComposerService: draft response was not usable', ['raw' => mb_substr($content, 0, 500)]);
            return null;
        }

        $subjects = array_values(array_filter(array_map(
            fn ($s) => is_scalar($s) ? trim((string) $s) : '',
            is_array($decoded['subjects']) ? $decoded['subjects'] : [$decoded['subjects']]
        ), fn ($s) => $s !== ''));

        if (empty($subjects)) return null;

        return [
            'subjects'  => array_slice($subjects, 0, 3),
            'body_html' => (string) $decoded['body_html'],
        ];
    }

    /**
     * @param array{hook:string, free_offer:string, chosen_subject:string, body_html:string} $input
     * @return array<int, array{delay_hours:int, subject:string, body_html:string}>|null
     */
    public function generateFollowUps(array $input, int $count): ?array
    {
        if (!$this->isConfigured()) return null;

        $count = max(1, min(3, $count));
        $userMessage = $this->followUpUserMessage($input, $count);
        $content = $this->ai->chat($this->systemPrompt(), $userMessage, 1600);

        if ($content === null) {
            Log::warning('AiEmailComposerService: follow-up generation failed');
            return null;
        }

        $decoded = $this->decodeJson($content);
        $steps = $decoded['followups'] ?? null;
        if (!is_array($steps) || empty($steps)) {
            Log::warning('AiEmailComposerService: follow-up response was not usable', ['raw' => mb_substr($content, 0, 500)]);
            return null;
        }

        $delays = array_slice(self::STEP_DELAYS, 0, $count);
        $result = [];
        foreach (array_slice($steps, 0, $count) as $i => $step) {
            if (empty($step['subject']) || empty($step['body_html'])) continue;
            $result[] = [
                'delay_hours' => $delays[$i] ?? end($delays),
                'subject'     => trim((string) $step['subject']),
                'body_html'   => (string) $step['body_html'],
            ];
        }

        return empty($result) ? null : $result;
    }

    /**
     * @param array{hook:string, free_offer:string, has_form:bool, subject:string, body_html:string, instruction:string, target:string} $input
     * @return array{subjects?: string[], body_html?: string}|null
     */
    public function rewrite(array $input): ?array
    {
        if (!$this->isConfigured()) return null;

        $target = in_array($input['target'], ['subject', 'body', 'both'], true) ? $input['target'] : 'both';
        $userMessage = $this->rewriteUserMessage($input, $target);
        $content = $this->ai->chat($this->systemPrompt(), $userMessage, 900);

        if ($content === null) {
            Log::warning('AiEmailComposerService: rewrite failed');
            return null;
        }

        $decoded = $this->decodeJson($content);
        if (!$decoded) {
            Log::warning('AiEmailComposerService: rewrite response was not usable', ['raw' => mb_substr($content, 0, 500)]);
            return null;
        }

        $result = [];

        if ($target !== 'body' && !empty($decoded['subjects'])) {
            $subjects = array_values(array_filter(array_map(
                fn ($s) => is_scalar($s) ? trim((string) $s) : '',
                is_array($decoded['subjects']) ? $decoded['subjects'] : [$decoded['subjects']]
            ), fn ($s) => $s !== ''));
            if (!empty($subjects)) $result['subjects'] = array_slice($subjects, 0, 3);
        }

        if ($target !== 'subject' && !empty($decoded['body_html'])) {
            $result['body_html'] = (string) $decoded['body_html'];
        }

        return empty($result) ? null : $result;
    }

    private function rewriteUserMessage(array $input, string $target): string
    {
        $formLine = $input['has_form']
            ? 'A form is attached — keep the {{form_link}} call-to-action if the body still needs it.'
            : 'No form is attached — do not reference {{form_link}}.';

        $scopeLine = match ($target) {
            'subject' => 'Only rewrite the subject line(s) — keep the same body untouched, do not return body_html.',
            'body'    => 'Only rewrite the email body — keep the same angle, do not return subjects.',
            default   => 'Rewrite both the subject line(s) and the email body.',
        };

        return <<<MSG
Pain point / hook: {$input['hook']}
Free offer to extend: {$input['free_offer']}
{$formLine}

Current subject: {$input['subject']}
Current body (HTML): {$input['body_html']}

Requested change: {$input['instruction']}

{$scopeLine}
MSG;
    }

    private function draftUserMessage(array $input): string
    {
        $formLine = $input['has_form']
            ? 'A form is attached — include a natural call-to-action around the {{form_link}} token.'
            : 'No form is attached — do not reference {{form_link}}.';

        return <<<MSG
Pain point / hook: {$input['hook']}
Free offer to extend: {$input['free_offer']}
{$formLine}
MSG;
    }

    private function followUpUserMessage(array $input, int $count): string
    {
        return <<<MSG
Original pain point / hook: {$input['hook']}
Free offer already extended: {$input['free_offer']}
Original subject sent: {$input['chosen_subject']}
Original body sent (HTML): {$input['body_html']}

Write exactly {$count} follow-up email(s) that continue this sequence, each shorter and more direct than the last, still offering a way to say no thanks.
MSG;
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
You are a cold-outreach email copywriter. You write short, high-reply-rate B2B emails.

Pick whichever of these angles fits the given pain point and offer best:
- Lead with the specific pain point (from research, e.g. a hiring gap or a performance issue) and end with one direct, low-friction call to action.
- Lead with what the prospect most wants or fears, back it up with a believable proof point (a stat, a comparable result, a case-style claim) and end with a call to action.
- Lead with the pain point, give a small piece of real value up front (a partial insight, a mini-audit-style observation) and use the call to action to offer the rest.

Rules for every email:
- Subject lines must be short, plain, and low-key — like "Quick question" — never salesy, never in all caps, never using emoji.
- The body must be brief (3-5 short sentences/lines), written like a real person emailed them, not like marketing copy.
- Naturally weave in the supplied free offer as the value being extended.
- Use {{first_name}} and {{company}} tokens for personalization where a name/company would naturally appear.
- Never invent fake stats, names, or case studies — keep proof points generic and honest (e.g. "similar teams have cut X in half") rather than specific fabricated numbers or company names.
- Body must be valid simple HTML using only <p> tags for paragraphs — no headings, tables, or inline styles.
- Do not include a greeting sign-off/signature block (name, title, company, contact info) — that is appended automatically elsewhere.

Respond with ONLY a single JSON object, no prose, no markdown, no code fences.
For a draft request, the object must have exactly these keys:
{ "subjects": [2 to 3 short subject line strings], "body_html": "the email body as HTML" }

For a follow-up request, the object must have exactly this key:
{ "followups": [ { "subject": "...", "body_html": "..." }, ... ] }

For a rewrite request, only include the key(s) for what was asked to change:
{ "subjects"?: [...], "body_html"?: "..." }
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
