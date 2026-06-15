<?php

namespace App\Services\LeadProviders;

use App\Contracts\LeadProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApolloProvider implements LeadProviderInterface
{
    private const BASE = 'https://api.apollo.io/api/v1';

    public function __construct(private readonly string $apiKey) {}

    public function getProviderName(): string
    {
        return 'Apollo.io';
    }

    public function testConnection(): bool
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->timeout(10)
                ->post(self::BASE . '/contacts/search', [
                    'page'     => 1,
                    'per_page' => 1,
                ]);

            Log::channel('apollo')->debug('[APOLLO:test]', ['status' => $response->status()]);

            return $response->status() !== 401 && $response->status() !== 403;
        } catch (\Throwable $e) {
            Log::channel('apollo')->warning('[APOLLO:test-failed]', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function searchPeople(array $filters, int $page = 1): array
    {
        $body = [
            'page'                       => $page,
            'per_page'                   => 10,
            'prospected_by_current_team' => ['no'],
        ];

        if (!empty($filters['job_titles'])) {
            $body['person_titles'] = $filters['job_titles'];
        }
        if (!empty($filters['seniority_levels'])) {
            $body['person_seniorities'] = $filters['seniority_levels'];
        }
        if (!empty($filters['company_sizes'])) {
            $body['organization_num_employees_ranges'] = $filters['company_sizes'];
        }
        if (!empty($filters['locations'])) {
            $body['person_locations'] = $filters['locations'];
        }

        // Apollo doesn't accept industry strings as tag IDs — fold into keyword search
        $keywords = $filters['keywords'] ?? [];
        if (!empty($filters['industries'])) {
            $keywords = array_merge($keywords, $filters['industries']);
        }
        if (!empty($keywords)) {
            $body['q_keywords'] = implode(' ', $keywords);
        }

        Log::channel('apollo')->debug('[APOLLO:request]', [
            'endpoint' => 'contacts/search',
            'page'     => $page,
            'body'     => $body,
        ]);

        $start    = microtime(true);
        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->post(self::BASE . '/contacts/search', $body);
        $elapsed  = round((microtime(true) - $start) * 1000) . 'ms';

        Log::channel('apollo')->debug('[APOLLO:http]', [
            'status'  => $response->status(),
            'elapsed' => $elapsed,
        ]);

        if ($response->status() === 429) {
            Log::channel('apollo')->warning('[APOLLO:rate-limited]');
            throw new \RuntimeException('Too many requests — please wait a moment and try again.');
        }

        if ($response->failed()) {
            $error = $response->json('error', '');
            Log::channel('apollo')->error('[APOLLO:failed]', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException($error ?: 'Apollo search failed. Check your API key in Settings.');
        }

        $data       = $response->json();
        $rawPeople  = $data['contacts'] ?? $data['people'] ?? [];
        $pagination = $data['pagination'] ?? [];
        $total      = $pagination['total_entries'] ?? count($rawPeople);

        Log::channel('apollo')->info('[APOLLO:done]', [
            'total'    => $total,
            'returned' => count($rawPeople),
            'elapsed'  => $elapsed,
        ]);

        if (empty($rawPeople)) {
            Log::channel('apollo')->debug('[APOLLO:empty-response]', [
                'keys'    => array_keys($data),
                'partial' => $data['partial_results_only'] ?? null,
            ]);
        }

        return [
            'total'        => $total,
            'per_page'     => 25,
            'current_page' => $page,
            'per_page'     => 10,
            'data'         => collect($rawPeople)->map(fn($p) => [
                'first_name'   => $p['first_name'] ?? '',
                'last_name'    => $p['last_name'] ?? '',
                'title'        => $p['title'] ?? '',
                'company'      => $p['organization_name'] ?? ($p['organization']['name'] ?? ($p['company_name'] ?? '')),
                'linkedin_url' => self::normalizeUrl($p['linkedin_url'] ?? null),
                'city'         => $p['city'] ?? '',
                'country'      => $p['country'] ?? '',
                'industry'     => $p['organization_industry_tag_values'][0] ?? ($p['organization']['industry'] ?? ($p['industry'] ?? '')),
                'company_size' => (string) ($p['organization_num_employees'] ?? ($p['organization']['estimated_num_employees'] ?? '')),
                'seniority'    => $p['seniority'] ?? '',
                // Apollo masks emails as "email_not_unlocked@domain.com" until
                // enriched/unlocked — pass through anyway; the importer filters
                // out the masked placeholder so it never gets saved.
                'email'        => is_string($p['email'] ?? null) ? $p['email'] : '',
                'phone'        => $p['phone_numbers'][0]['sanitized_number'] ?? ($p['organization']['phone'] ?? ''),
            ])->toArray(),
        ];
    }

    private static function normalizeUrl(?string $url): ?string
    {
        if (empty($url)) return null;
        return str_starts_with($url, 'http') ? $url : 'https://' . $url;
    }

    private function headers(): array
    {
        return [
            'X-Api-Key'     => $this->apiKey,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
            'Cache-Control' => 'no-cache',
        ];
    }
}
