<?php

namespace App\Contracts;

interface LeadProviderInterface
{
    /**
     * Search for people using the provider's database.
     *
     * Always returns a normalised structure:
     * [
     *   'total'        => int,
     *   'per_page'     => int,
     *   'current_page' => int,
     *   'data'         => [
     *     ['first_name', 'last_name', 'title', 'company', 'linkedin_url',
     *      'city', 'country', 'industry', 'company_size', 'seniority'],
     *     ...
     *   ]
     * ]
     */
    public function searchPeople(array $filters, int $page = 1): array;

    /** Make a lightweight API call and return true if the key is valid. */
    public function testConnection(): bool;

    /** Human-readable provider name, e.g. 'Apollo.io'. */
    public function getProviderName(): string;
}
