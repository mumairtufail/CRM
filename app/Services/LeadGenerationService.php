<?php

namespace App\Services;

use App\Contracts\LeadGenerationInterface;
use App\Contracts\LeadProviderInterface;
use App\Exceptions\LeadGenerationNotConfiguredException;
use App\Models\Lead;
use App\Services\LeadProviders\ApolloProvider;
use App\Services\LeadProviders\PeopleDataLabsProvider;
use App\Support\TenantContext;
use Illuminate\Support\Facades\Log;

class LeadGenerationService implements LeadGenerationInterface
{
    // ── Logging helper ────────────────────────────────────────────────────────

    private function log(string $level, string $step, array $context = []): void
    {
        Log::channel('apollo')->{$level}("[{$step}] " . ($context['message'] ?? $step), $context);
    }

    // ── Provider resolution ───────────────────────────────────────────────────

    private function currentOrg()
    {
        return app(TenantContext::class)->get() ?? auth()->user()?->organization;
    }

    private function getProvider(): LeadProviderInterface
    {
        $org      = $this->currentOrg();
        $settings = $org?->settings ?? [];

        $providerKey  = $settings['lead_generation_provider'] ?? null;
        $encryptedKey = $settings['lead_generation_api_key']  ?? null;

        if (!$providerKey || !$encryptedKey) {
            $this->log('warning', 'PROVIDER:not-configured');
            throw new LeadGenerationNotConfiguredException();
        }

        try {
            $apiKey = decrypt($encryptedKey);
        } catch (\Throwable) {
            $this->log('error', 'PROVIDER:decrypt-failed');
            throw new LeadGenerationNotConfiguredException();
        }

        $this->log('info', 'PROVIDER:resolve', ['provider' => $providerKey]);

        return match ($providerKey) {
            'pdl'   => new PeopleDataLabsProvider($apiKey),
            default => new ApolloProvider($apiKey),
        };
    }

    // ── Filter parsing (rule-based, no external API) ──────────────────────────

    public function parsePromptToFilters(string $prompt): array
    {
        $this->log('info', 'PARSE:start', ['prompt' => $prompt]);

        $lower = strtolower($prompt);

        // Job titles — longer phrases first to avoid partial matches
        $titleMap = [
            'chief technology officer' => 'Chief Technology Officer',
            'chief executive officer'  => 'Chief Executive Officer',
            'chief financial officer'  => 'Chief Financial Officer',
            'chief operating officer'  => 'Chief Operating Officer',
            'vp of sales'              => 'VP of Sales',
            'vp of operations'         => 'VP of Operations',
            'marketing director'       => 'Marketing Director',
            'operations director'      => 'Operations Director',
            'head of engineering'      => 'Head of Engineering',
            'head of sales'            => 'Head of Sales',
            'general manager'          => 'General Manager',
            'project manager'          => 'Project Manager',
            'product manager'          => 'Product Manager',
            'sales manager'            => 'Sales Manager',
            'account manager'          => 'Account Manager',
            'business owner'           => 'Business Owner',
            'co-founder'               => 'Co-Founder',
            'founder'                  => 'Founder',
            'owner'                    => 'Owner',
            'cto'                      => 'CTO',
            'ceo'                      => 'CEO',
            'cfo'                      => 'CFO',
            'coo'                      => 'COO',
        ];

        $jobTitles = [];
        foreach ($titleMap as $keyword => $title) {
            if (str_contains($lower, $keyword)) {
                $jobTitles[] = $title;
            }
        }

        // Seniority — Apollo enum: c_suite, owner, founder, vp, director, manager, senior, entry
        $seniority = [];
        if (str_contains($lower, 'cto') || str_contains($lower, 'ceo') ||
            str_contains($lower, 'cfo') || str_contains($lower, 'coo') ||
            str_contains($lower, 'c-suite') || str_contains($lower, 'c suite')) {
            $seniority[] = 'c_suite';
        }
        if (str_contains($lower, 'founder') || str_contains($lower, 'co-founder') ||
            str_contains($lower, 'owner') || str_contains($lower, 'business owner')) {
            $seniority[] = 'owner';
            $seniority[] = 'founder';
        }
        if (str_contains($lower, 'director')) {
            $seniority[] = 'director';
        }
        if (str_contains($lower, 'vp') || str_contains($lower, 'vice president')) {
            $seniority[] = 'vp';
        }
        if (str_contains($lower, 'manager') || str_contains($lower, 'general manager')) {
            $seniority[] = 'manager';
        }

        // Company sizes — Apollo employee ranges
        $companySizes = [];
        if (str_contains($lower, 'startup') || preg_match('/\b1\s*[-–]\s*1[05]\b/', $lower)) {
            $companySizes[] = '1,10';
            $companySizes[] = '11,50';
        }
        if (preg_match('/\b1\s*[-–]\s*2[05]\b/', $lower)) {
            // "1-20" or "1-25" employees — spans both 1-10 and 11-50 buckets
            $companySizes[] = '1,10';
            $companySizes[] = '11,50';
        }
        if (str_contains($lower, 'small') || preg_match('/\b11\s*[-–]\s*50\b/', $lower)) {
            $companySizes[] = '11,50';
        }
        if (preg_match('/\b5[01]\s*[-–]\s*200\b/', $lower) || preg_match('/\b50\s*[-–]\s*200\b/', $lower)) {
            $companySizes[] = '51,200';
        }
        if (str_contains($lower, 'mid-size') || str_contains($lower, 'midsize') ||
            preg_match('/\b201\s*[-–]\s*500\b/', $lower)) {
            $companySizes[] = '201,500';
        }
        if (str_contains($lower, 'enterprise') || str_contains($lower, '1000+') ||
            preg_match('/\b1[,.]000\+/', $lower)) {
            $companySizes[] = '1001,5000';
        }

        // Locations
        $locationMap = [
            'united states' => 'United States',
            'usa'           => 'United States',
            'us'            => 'United States',  // handled separately below via \bus\b
            'uk'            => 'United Kingdom',
            'united kingdom'=> 'United Kingdom',
            'canada'        => 'Canada',
            'australia'     => 'Australia',
            'new york'      => 'New York',
            'london'        => 'London',
            'san francisco' => 'San Francisco',
            'los angeles'   => 'Los Angeles',
            'chicago'       => 'Chicago',
            'houston'       => 'Houston',
            'dallas'        => 'Dallas',
            'miami'         => 'Miami',
            'florida'       => 'Florida',
            'texas'         => 'Texas',
            'california'    => 'California',
            'dubai'         => 'Dubai',
        ];

        $locations = [];
        foreach ($locationMap as $keyword => $location) {
            if (str_contains($lower, $keyword) && !in_array($location, $locations, true)) {
                $locations[] = $location;
            }
        }
        if (!in_array('United States', $locations, true) && preg_match('/\bus\b/', $lower)) {
            $locations[] = 'United States';
        }

        // Industries
        $industryMap = [
            'saas'              => 'SaaS',
            'software'          => 'Software',
            'fintech'           => 'Fintech',
            'healthcare'        => 'Healthcare',
            'e-commerce'        => 'E-Commerce',
            'ecommerce'         => 'E-Commerce',
            'marketing'         => 'Marketing',
            'finance'           => 'Finance',
            'accounting'        => 'Accounting',
            'real estate'       => 'Real Estate',
            'education'         => 'Education',
            'technology'        => 'Technology',
            'construction'      => 'Construction',
            'manufacturing'     => 'Manufacturing',
            'logistics'         => 'Logistics',
            'retail'            => 'Retail',
            'hospitality'       => 'Hospitality',
            'legal'             => 'Legal Services',
            'consulting'        => 'Consulting',
            'insurance'         => 'Insurance',
            'telecommunications'=> 'Telecommunications',
            'field service'     => 'Field Services',
            'hvac'              => 'Field Services',
            'plumbing'          => 'Field Services',
            'electrical'        => 'Field Services',
            'landscaping'       => 'Landscaping',
            'architecture'      => 'Architecture',
            'engineering'       => 'Engineering',
            'transportation'    => 'Transportation',
            'distribution'      => 'Distribution',
            'warehousing'       => 'Warehousing',
            'b2b'               => 'B2B',
            'erp'               => 'Software',
            'crm'               => 'Software',
            'automation'        => 'Software',
        ];

        $industries = [];
        foreach ($industryMap as $keyword => $industry) {
            if (str_contains($lower, $keyword) && !in_array($industry, $industries, true)) {
                $industries[] = $industry;
            }
        }

        $result = [
            'job_titles'       => array_values(array_unique($jobTitles)),
            'seniority_levels' => array_values(array_unique($seniority)),
            'company_sizes'    => array_values(array_unique($companySizes)),
            'locations'        => $locations,
            'industries'       => $industries,
            'keywords'         => [],
        ];

        $this->log('info', 'PARSE:done', ['filters' => $result]);

        return $result;
    }

    // ── People search — delegates to the configured provider ──────────────────

    public function searchContacts(array $filters, int $page = 1): array
    {
        $this->log('info', 'SEARCH:start', ['page' => $page, 'filters' => $filters]);

        $provider = $this->getProvider();
        $this->log('info', 'SEARCH:provider', ['name' => $provider->getProviderName()]);

        $result = $provider->searchPeople($filters, $page);

        // Remap provider's normalised 'company' field to the 'company_name' key
        // that the import controller and ResultRow component expect
        $contacts = collect($result['data'])->map(fn($p) => array_merge($p, [
            'id'           => uniqid('lead_'),
            'company_name' => $p['company'] ?? '',
        ]))->toArray();

        // Filter out leads already imported into this workspace's leads table.
        // Check by LinkedIn URL first (most reliable), then fall back to name+company.
        $contacts = $this->filterAlreadyImported($contacts);

        $perPage    = $result['per_page'] ?? 10;
        $total      = $result['total'];
        $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 1;

        $this->log('info', 'SEARCH:done', [
            'total'       => $total,
            'total_pages' => $totalPages,
            'returned'    => count($contacts),
        ]);

        return [
            'contacts'          => $contacts,
            'total'             => $total,
            'total_pages'       => $totalPages,
            'page'              => $result['current_page'],
            'credits_remaining' => $result['credits_remaining'] ?? null,
        ];
    }

    // ── Account search (stub — not used by current UI) ────────────────────────

    public function searchAccounts(array $filters): array
    {
        $this->log('info', 'ACCOUNTS:start');
        return [];
    }

    // ── Deduplication helpers ─────────────────────────────────────────────────

    private function filterAlreadyImported(array $contacts): array
    {
        if (empty($contacts)) return [];

        // Build a fast lookup of already-imported LinkedIn URLs (normalised)
        $importedUrls = Lead::whereNotNull('linkedin_url')
            ->pluck('linkedin_url')
            ->mapWithKeys(fn($u) => [$this->normalizeLinkedinUrl($u) => true])
            ->all();

        // Build a fast lookup of name+company combos already in the leads table
        $importedKeys = Lead::select('first_name', 'last_name', 'company')
            ->get()
            ->mapWithKeys(fn($l) => [
                strtolower(trim($l->first_name) . '|' . trim($l->last_name) . '|' . trim($l->company ?? '')) => true,
            ])
            ->all();

        $before = count($contacts);

        $filtered = array_values(array_filter($contacts, function ($c) use ($importedUrls, $importedKeys) {
            // LinkedIn URL match
            if (!empty($c['linkedin_url'])) {
                $norm = $this->normalizeLinkedinUrl($c['linkedin_url']);
                if ($norm && isset($importedUrls[$norm])) return false;
            }
            // Name + company match
            $key = strtolower(
                trim($c['first_name'] ?? '') . '|' .
                trim($c['last_name']  ?? '') . '|' .
                trim($c['company_name'] ?? '')
            );
            return !isset($importedKeys[$key]);
        }));

        $hidden = $before - count($filtered);
        if ($hidden > 0) {
            $this->log('info', 'SEARCH:dedup', [
                'hidden'    => $hidden,
                'remaining' => count($filtered),
            ]);
        }

        return $filtered;
    }

    private function normalizeLinkedinUrl(string $url): string
    {
        $url = strtolower(trim($url));
        // Strip protocol and www so linkedin.com/in/x == https://www.linkedin.com/in/x
        $url = preg_replace('#^https?://(www\.)?#', '', $url);
        return rtrim($url, '/');
    }
}
