<?php

namespace App\Contracts;

interface LeadGenerationInterface
{
    public function searchContacts(array $filters, int $page = 1): array;
    public function searchAccounts(array $filters): array;
    public function parsePromptToFilters(string $prompt): array;
}
