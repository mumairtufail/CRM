<?php

namespace App\Services\LeadProviders;

use App\Contracts\LeadProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PeopleDataLabsProvider implements LeadProviderInterface
{
    private const BASE = 'https://api.peopledatalabs.com/v5';

    // Locations our parser can produce that are actual countries → location_country field.
    private const COUNTRY_NAMES = [
        'United States', 'United Kingdom', 'Canada', 'Australia',
    ];

    // US states → location_region field in PDL.
    private const REGION_NAMES = [
        'Florida'    => 'florida',
        'Texas'      => 'texas',
        'California' => 'california',
    ];

    // City names → location_locality field.
    // Aliases ensure "New York" matches both "new york" and "new york city" in PDL.
    private const LOCALITY_ALIASES = [
        'New York'      => ['new york', 'new york city'],
        'San Francisco' => ['san francisco'],
        'Los Angeles'   => ['los angeles'],
        'Chicago'       => ['chicago'],
        'Houston'       => ['houston'],
        'Dallas'        => ['dallas'],
        'Miami'         => ['miami'],
        'London'        => ['london'],
        'Dubai'         => ['dubai'],
    ];

    // Apollo seniority enum → PDL job_title_levels enum
    // PDL levels: cxo, vp, director, manager, senior, entry, owner, partner, training
    private const SENIORITY_MAP = [
        'c_suite'  => 'cxo',
        'owner'    => 'owner',
        'founder'  => 'owner',
        'vp'       => 'vp',
        'director' => 'director',
        'manager'  => 'manager',
        'senior'   => 'senior',
        'entry'    => 'entry',
    ];

    public function __construct(private readonly string $apiKey) {}

    public function getProviderName(): string
    {
        return 'People Data Labs';
    }

    public function testConnection(): bool
    {
        try {
            // 404 (person not found) is fine; 401 means bad key
            $response = Http::withHeaders($this->headers())
                ->timeout(10)
                ->get(self::BASE . '/person/enrich', ['email' => 'test@example.com']);

            Log::channel('aileadsearch')->debug('[PDL:test]', ['status' => $response->status()]);

            return $response->status() !== 401;
        } catch (\Throwable $e) {
            Log::channel('aileadsearch')->warning('[PDL:test-failed]', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function searchPeople(array $filters, int $page = 1): array
    {
        // ── Query strategy ────────────────────────────────────────────────────
        //
        // PDL's structured query uses its own taxonomy for job_company_industry
        // (e.g. "mechanical or industrial engineering" not "manufacturing").
        // Sending our industry labels there always returns 0 results.
        //
        // Solution: use PDL's top-level `text` param for job titles + industries.
        // It does flexible NLP matching across all text fields, so "manufacturing"
        // matches companies whose PDL industry is "machinery", "industrial automation",
        // "electrical/electronic manufacturing", etc.
        //
        // Structured query is only used for fields with reliable PDL taxonomy:
        //   location_country / location_region / location_locality / job_company_size
        //   job_title_levels (only when no specific job title is given)

        $must = [];

        // ── Locations ─────────────────────────────────────────────────────────
        if (!empty($filters['locations'])) {
            $countries  = [];
            $regions    = [];
            $localities = [];

            foreach ($filters['locations'] as $loc) {
                if (in_array($loc, self::COUNTRY_NAMES, true)) {
                    $countries[] = strtolower($loc);
                } elseif (isset(self::REGION_NAMES[$loc])) {
                    $regions[] = self::REGION_NAMES[$loc];
                } elseif (isset(self::LOCALITY_ALIASES[$loc])) {
                    foreach (self::LOCALITY_ALIASES[$loc] as $alias) {
                        $localities[] = $alias;
                    }
                } else {
                    $localities[] = strtolower($loc);
                }
            }

            if (!empty($countries))  $must[] = ['terms' => ['location_country'  => $countries]];
            if (!empty($regions))    $must[] = ['terms' => ['location_region'   => $regions]];
            if (!empty($localities)) $must[] = ['terms' => ['location_locality' => $localities]];
        }

        // ── Company sizes ─────────────────────────────────────────────────────
        if (!empty($filters['company_sizes'])) {
            $sizes  = array_map(fn($s) => str_replace(',', '-', $s), $filters['company_sizes']);
            $must[] = ['terms' => ['job_company_size' => $sizes]];
        }

        // ── Seniority — structured only when no specific job title given ──────
        // When a title is supplied, that already implies seniority.
        // Adding both causes over-filtering (e.g. "founder" title AND "owner" level).
        if (!empty($filters['seniority_levels']) && empty($filters['job_titles'])) {
            $pdlLevels = array_values(array_unique(array_filter(
                array_map(fn($s) => self::SENIORITY_MAP[$s] ?? null, $filters['seniority_levels'])
            )));
            if (!empty($pdlLevels)) {
                $must[] = ['terms' => ['job_title_levels' => $pdlLevels]];
            }
        }

        // ── Text search: titles + industries + keywords ───────────────────────
        // PDL `text` does AND matching across all text fields — far more flexible
        // than terms-on-taxonomy for industry names.
        $textParts = [];
        foreach ($filters['job_titles'] ?? []  as $t) $textParts[] = strtolower($t);
        foreach ($filters['industries'] ?? []  as $i) $textParts[] = strtolower($i);
        foreach ($filters['keywords']   ?? []  as $k) $textParts[] = strtolower($k);

        $esQuery = empty($must)
            ? ['match_all' => (object) []]
            : ['bool' => ['must' => $must]];

        // ── Build request body ────────────────────────────────────────────────
        // PDL removed the 'from' parameter — use scroll_token for pagination.
        // We cache each page's token in session so page N+1 can use it.
        //
        // size = credits spent per search (PDL charges 1 credit per record
        // returned). Kept low to stretch the free trial; raise it only if you
        // want more leads per page and can afford the extra credits.
        $body = [
            'query'   => $esQuery,
            'size'    => 5,
            'dataset' => 'all',
        ];

        if (!empty($textParts)) {
            $body['text'] = implode(' ', array_unique($textParts));
        }

        if ($page > 1) {
            $scrollKey   = 'pdl_st_' . md5(serialize($filters)) . "_p{$page}";
            $scrollToken = session($scrollKey);
            if ($scrollToken) {
                $body['scroll_token'] = $scrollToken;
                Log::channel('aileadsearch')->debug('[PDL:scroll-token]', ['page' => $page, 'has_token' => true]);
            } else {
                Log::channel('aileadsearch')->warning('[PDL:scroll-token-missing]', [
                    'page' => $page,
                    'note' => 'Token not cached — pagination may repeat results',
                ]);
            }
        }

        Log::channel('aileadsearch')->debug("[PDL:request] Calling People Data Labs /person/search (page {$page}).", [
            'page'  => $page,
            'text'  => $body['text'] ?? null,
            'query' => $esQuery,
        ]);

        $start    = microtime(true);
        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->post(self::BASE . '/person/search', $body);
        $elapsed  = round((microtime(true) - $start) * 1000) . 'ms';

        // Account credit balance — PDL returns it in X-TotalLimit-Remaining.
        // (X-RateLimit-Remaining is only the per-minute request budget, e.g.
        // {"minute": 9}, NOT the plan balance — don't use it for the badge.)
        $creditsRemaining = $response->header('X-TotalLimit-Remaining');
        $creditsSpent     = $response->header('X-Call-Credits-Spent');
        $rateRemaining    = $response->header('X-RateLimit-Remaining');

        Log::channel('aileadsearch')->debug("[PDL:http] People Data Labs responded with HTTP {$response->status()} in {$elapsed}.", [
            'status'             => $response->status(),
            'elapsed'            => $elapsed,
            'total'              => $response->json('total', 0),
            'credits_remaining'  => $creditsRemaining,
            'credits_spent'      => $creditsSpent,
            'rate_remaining'     => $rateRemaining,
        ]);

        if ($response->status() === 429) {
            Log::channel('aileadsearch')->warning('[PDL:rate-limited] People Data Labs rate limit hit — too many requests in a short window.');
            throw new \RuntimeException('Too many requests — please wait a moment and try again.');
        }

        // 402 = plan/credit limit reached. Free PDL plans cap the total number
        // of searches ("You have hit your account maximum for search").
        if ($response->status() === 402) {
            $providerMsg = $response->json('error.message', '');
            Log::channel('aileadsearch')->error('[PDL:limit-reached] FAILED — People Data Labs plan search limit reached. No more searches available on this plan.', [
                'step'             => 'PDL:limit-reached',
                'status'           => 402,
                'provider_message' => $providerMsg,
            ]);
            throw new \RuntimeException('Your People Data Labs plan has used up its search allowance. Upgrade the plan or switch providers in Settings.');
        }

        // PDL returns 404 when no records match — treat as empty, not an error.
        if ($response->status() === 404) {
            Log::channel('aileadsearch')->info('[PDL:no-results] No matching people found for these filters.', [
                'page'    => $page,
                'query'   => $esQuery,
                'elapsed' => $elapsed,
            ]);
            return ['total' => 0, 'per_page' => 25, 'current_page' => $page, 'data' => []];
        }

        if ($response->failed()) {
            $msg = $response->json('error.message', '');
            Log::channel('aileadsearch')->error("[PDL:failed] People Data Labs search failed (HTTP {$response->status()}).", [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException($msg ?: 'People Data Labs search failed. Check your API key in Settings.');
        }

        $data    = $response->json();
        $rawData = $data['data'] ?? [];
        $total   = $data['total'] ?? count($rawData);

        // Cache the returned scroll_token so page N+1 can use it.
        $nextScrollToken = $data['scroll_token'] ?? null;
        if ($nextScrollToken) {
            $nextKey = 'pdl_st_' . md5(serialize($filters)) . '_p' . ($page + 1);
            session([$nextKey => $nextScrollToken]);
        }

        Log::channel('aileadsearch')->info("[PDL:done] People Data Labs returned " . count($rawData) . " of {$total} match(es) in {$elapsed}.", [
            'total'             => $total,
            'returned'          => count($rawData),
            'elapsed'           => $elapsed,
            'has_next_st'       => !empty($nextScrollToken),
            'credits_remaining' => $creditsRemaining,
        ]);

        return [
            'total'             => $total,
            'per_page'          => 5,
            'current_page'      => $page,
            'credits_remaining' => $creditsRemaining ? (int) $creditsRemaining : null,
            'data'         => collect($rawData)->map(fn($p) => [
                'first_name'   => $p['first_name'] ?? '',
                'last_name'    => $p['last_name'] ?? '',
                'title'        => $p['job_title'] ?? '',
                'company'      => $p['job_company_name'] ?? '',
                'linkedin_url' => self::normalizeUrl($p['linkedin_url'] ?? null),
                'city'         => $p['location_locality'] ?? '',
                'country'      => $p['location_country'] ?? '',
                'industry'     => $p['job_company_industry'] ?? '',
                'company_size' => $p['job_company_size'] ?? '',
                'seniority'    => is_array($p['job_title_levels'] ?? null) ? ($p['job_title_levels'][0] ?? '') : '',
                'email'        => self::extractEmail($p),
                'phone'        => self::extractPhone($p),
            ])->toArray(),
        ];
    }

    private static function normalizeUrl(?string $url): ?string
    {
        if (empty($url)) return null;
        return str_starts_with($url, 'http') ? $url : 'https://' . $url;
    }

    /**
     * Pull the best available email from a PDL person record.
     * Prefers work email, then the structured emails array, then any
     * recommended/personal address. Returns '' when none is present.
     *
     * On free/trial PDL plans, redacted PII fields come back as the boolean
     * `true` ("data exists but is hidden on your plan") instead of an array,
     * so every list field must be is_array()-guarded before iterating.
     */
    private static function extractEmail(array $p): string
    {
        if (!empty($p['work_email']) && is_string($p['work_email'])) {
            return $p['work_email'];
        }

        if (is_array($p['emails'] ?? null)) {
            foreach ($p['emails'] as $entry) {
                $addr = is_array($entry) ? ($entry['address'] ?? null) : $entry;
                if (!empty($addr) && is_string($addr)) {
                    return $addr;
                }
            }
        }

        if (!empty($p['recommended_personal_email']) && is_string($p['recommended_personal_email'])) {
            return $p['recommended_personal_email'];
        }

        if (is_array($p['personal_emails'] ?? null)) {
            foreach ($p['personal_emails'] as $addr) {
                if (!empty($addr) && is_string($addr)) {
                    return $addr;
                }
            }
        }

        return '';
    }

    /**
     * Pull the best available phone number from a PDL person record.
     * Guards against redacted (boolean `true`) fields like extractEmail.
     */
    private static function extractPhone(array $p): string
    {
        if (!empty($p['mobile_phone']) && is_string($p['mobile_phone'])) {
            return $p['mobile_phone'];
        }

        if (is_array($p['phone_numbers'] ?? null)) {
            foreach ($p['phone_numbers'] as $num) {
                if (!empty($num) && is_string($num)) {
                    return $num;
                }
            }
        }

        return '';
    }

    private function headers(): array
    {
        return [
            'X-Api-Key'    => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ];
    }
}
