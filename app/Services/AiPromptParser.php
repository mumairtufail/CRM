<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Turns a plain-English lead-search prompt into the structured filter shape
 * the UI and providers expect, using an OpenAI-compatible chat endpoint
 * (NVIDIA NIM / Kimi by default — configurable in config/services.php).
 *
 * This is a deliberate non-Anthropic, OpenAI-compatible integration chosen by
 * the user. It is best-effort: any failure (no key, timeout, bad output) makes
 * parse() return null so the caller can fall back to the keyword parser.
 */
class AiPromptParser
{
    /** Apollo/PDL seniority enum the providers understand. */
    public const SENIORITY_LEVELS = [
        'c_suite', 'owner', 'founder', 'vp', 'director', 'manager', 'senior', 'entry',
    ];

    /** Employee-count ranges (start,end) the providers understand. */
    public const COMPANY_SIZES = [
        '1,10', '11,50', '51,200', '201,500', '501,1000', '1001,5000',
    ];

    private const EMPTY = [
        'job_titles'       => [],
        'seniority_levels' => [],
        'company_sizes'    => [],
        'locations'        => [],
        'industries'       => [],
        'keywords'         => [],
    ];

    public function isConfigured(): bool
    {
        return !empty(config('services.aileadsearch.api_key'));
    }

    public function modelName(): string
    {
        return (string) config('services.aileadsearch.model', 'unknown');
    }

    /**
     * @return array<string,array<int,string>>|null  Filters, or null on any failure.
     */
    public function parse(string $prompt): ?array
    {
        $apiKey  = config('services.aileadsearch.api_key');
        $baseUrl = rtrim((string) config('services.aileadsearch.base_url'), '/');
        $model   = $this->modelName();
        $timeout = (int) config('services.aileadsearch.timeout', 60);

        if (!$apiKey) {
            return null;
        }

        $start = microtime(true);

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout($timeout)
                ->post($baseUrl . '/chat/completions', [
                    'model'       => $model,
                    'temperature' => 0.2,
                    'max_tokens'  => 1024,
                    'stream'      => false,
                    'messages'    => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                ]);
        } catch (\Throwable $e) {
            Log::channel('aileadsearch')->warning('[PARSE] AI request threw — falling back to keyword parser', [
                'step'    => 'PARSE:ai-exception',
                'engine'  => $model,
                'error'   => $e->getMessage(),
            ]);
            return null;
        }

        $elapsed = round((microtime(true) - $start) * 1000);

        if ($response->failed()) {
            Log::channel('aileadsearch')->warning('[PARSE] AI endpoint returned an error — falling back to keyword parser', [
                'step'       => 'PARSE:ai-http-error',
                'engine'     => $model,
                'status'     => $response->status(),
                'body'       => mb_substr($response->body(), 0, 500),
                'elapsed_ms' => $elapsed,
            ]);
            return null;
        }

        $content = (string) data_get($response->json(), 'choices.0.message.content', '');
        $filters = $this->decodeFilters($content);

        if ($filters === null) {
            Log::channel('aileadsearch')->warning('[PARSE] AI output was not valid JSON — falling back to keyword parser', [
                'step'       => 'PARSE:ai-bad-json',
                'engine'     => $model,
                'raw'        => mb_substr($content, 0, 500),
                'elapsed_ms' => $elapsed,
            ]);
            return null;
        }

        $filters = $this->sanitize($filters);

        Log::channel('aileadsearch')->info('[PARSE] AI returned filters', [
            'step'       => 'PARSE:ai-ok',
            'engine'     => $model,
            'filters'    => $filters,
            'elapsed_ms' => $elapsed,
        ]);

        return $filters;
    }

    private function systemPrompt(): string
    {
        $seniority = implode(', ', self::SENIORITY_LEVELS);
        $sizes     = implode(', ', self::COMPANY_SIZES);

        return <<<PROMPT
You convert a sales prospecting request written in plain English into structured
search filters for a B2B lead database.

Respond with ONLY a single JSON object — no prose, no markdown, no code fences.
The object MUST have exactly these keys, each an array of strings (use an empty
array when nothing applies):

- "job_titles": specific job titles mentioned or strongly implied (e.g. ["Sales Manager", "VP of Sales"]).
- "seniority_levels": zero or more of EXACTLY these values: {$seniority}.
- "company_sizes": employee-count ranges, zero or more of EXACTLY these values: {$sizes}.
- "locations": countries, states, regions, or cities (proper-cased, e.g. ["United States", "New York"]).
- "industries": industries or business types (e.g. ["Real Estate", "Logistics"]).
- "keywords": any other useful free-text terms not covered above.

Rules:
- Infer "seniority_levels" from the titles when the user does not say it explicitly
  (e.g. "CTO" -> "c_suite"; "founder"/"owner" -> "owner" and "founder"; "VP" -> "vp").
- Map vague size words to the ranges: "startup"/"small" -> "1,10" and "11,50";
  "mid-size"/"medium" -> "51,200" and "201,500"; "enterprise"/"large" -> "1001,5000".
  If the user gives a numeric range (e.g. "50-200 employees"), pick the closest listed range(s).
- Normalise place names ("US"/"USA" -> "United States"; "UK" -> "United Kingdom").
  Expand a region to plausible localities only if obvious; otherwise keep the region name.
- NEVER invent values outside the allowed lists for "seniority_levels" and "company_sizes".
- Keep arrays concise — only include what the request actually implies.
PROMPT;
    }

    /**
     * Extract and decode the JSON object from the model's reply, tolerating
     * code fences and any leading/trailing prose.
     */
    private function decodeFilters(string $content): ?array
    {
        $content = trim($content);
        if ($content === '') {
            return null;
        }

        // Strip ```json ... ``` fences if present.
        $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content);

        // Grab the outermost {...} in case the model added stray text.
        if (preg_match('/\{.*\}/s', $content, $m)) {
            $content = $m[0];
        }

        $decoded = json_decode($content, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Coerce the decoded payload into the canonical shape and drop any values
     * outside the allowed enums so a hallucination can never reach a provider.
     */
    private function sanitize(array $decoded): array
    {
        $result = self::EMPTY;

        foreach (array_keys(self::EMPTY) as $key) {
            $values = $decoded[$key] ?? [];
            if (!is_array($values)) {
                $values = [$values];
            }

            // Normalise to trimmed, non-empty, unique strings.
            $values = array_values(array_unique(array_filter(array_map(
                fn ($v) => is_scalar($v) ? trim((string) $v) : '',
                $values
            ), fn ($v) => $v !== '')));

            if ($key === 'seniority_levels') {
                $values = array_values(array_filter(
                    array_map(fn ($v) => strtolower($v), $values),
                    fn ($v) => in_array($v, self::SENIORITY_LEVELS, true)
                ));
            } elseif ($key === 'company_sizes') {
                $values = array_values(array_filter(
                    $values,
                    fn ($v) => in_array($v, self::COMPANY_SIZES, true)
                ));
            }

            $result[$key] = array_values(array_unique($values));
        }

        return $result;
    }
}
