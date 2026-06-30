<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Turns a plain-English lead-search prompt into the structured filter shape
 * the UI and providers expect, using the org's configured AiService.
 *
 * Falls back to the rule-based keyword parser when no AI provider is configured
 * or when the AI call fails / returns unparseable output.
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

    private ?AiService $ai;

    public function __construct()
    {
        $this->ai = AiService::forCurrentTenant();
    }

    public function isConfigured(): bool
    {
        return $this->ai !== null && $this->ai->isConfigured();
    }

    public function modelName(): string
    {
        return $this->ai?->modelName() ?? 'rule-based';
    }

    /**
     * @return array<string,array<int,string>>|null  Filters, or null on any failure.
     */
    public function parse(string $prompt): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        $start = microtime(true);

        $content = $this->ai->chat($this->systemPrompt(), $prompt, 1024);

        $elapsed = round((microtime(true) - $start) * 1000);

        if ($content === null) {
            Log::channel('aileadsearch')->warning('[PARSE] AI request failed — falling back to keyword parser', [
                'step'       => 'PARSE:ai-error',
                'engine'     => $this->modelName(),
                'elapsed_ms' => $elapsed,
            ]);
            return null;
        }

        $filters = $this->decodeFilters($content);

        if ($filters === null) {
            Log::channel('aileadsearch')->warning('[PARSE] AI output was not valid JSON — falling back to keyword parser', [
                'step'       => 'PARSE:ai-bad-json',
                'engine'     => $this->modelName(),
                'raw'        => mb_substr($content, 0, 500),
                'elapsed_ms' => $elapsed,
            ]);
            return null;
        }

        $filters = $this->sanitize($filters);

        Log::channel('aileadsearch')->info('[PARSE] AI returned filters', [
            'step'       => 'PARSE:ai-ok',
            'engine'     => $this->modelName(),
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

    private function decodeFilters(string $content): ?array
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

    private function sanitize(array $decoded): array
    {
        $result = self::EMPTY;

        foreach (array_keys(self::EMPTY) as $key) {
            $values = $decoded[$key] ?? [];
            if (!is_array($values)) {
                $values = [$values];
            }

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
