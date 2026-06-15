<?php

namespace App\Http\Controllers;

use App\Contracts\LeadGenerationInterface;
use App\Exceptions\LeadGenerationNotConfiguredException;
use App\Models\Lead;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadGenerationController extends Controller
{
    public function __construct(protected LeadGenerationInterface $service) {}

    public function index()
    {
        $org      = app(TenantContext::class)->get() ?? auth()->user()?->organization;
        $settings = $org?->settings ?? [];

        $configured   = !empty($settings['lead_generation_provider']) && !empty($settings['lead_generation_api_key']);
        $providerName = match ($settings['lead_generation_provider'] ?? null) {
            'pdl'   => 'People Data Labs',
            'apollo'=> 'Apollo.io',
            default => null,
        };

        return Inertia::render('LeadGeneration/Index', [
            'configured'   => $configured,
            'providerName' => $providerName,
        ]);
    }

    public function parsePrompt(Request $request)
    {
        $request->validate(['prompt' => 'required|string|max:1000']);

        try {
            $filters = $this->service->parsePromptToFilters($request->input('prompt'));
            return response()->json(['filters' => $filters]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function search(Request $request)
    {
        $request->validate([
            'filters' => 'required|array',
            'page'    => 'nullable|integer|min:1|max:500',
        ]);

        try {
            $results = $this->service->searchContacts(
                $request->input('filters'),
                (int) $request->input('page', 1)
            );
            return response()->json($results);
        } catch (LeadGenerationNotConfiguredException $e) {
            return response()->json([
                'not_configured' => true,
                'message'        => $e->getMessage(),
            ], 403);
        } catch (\RuntimeException $e) {
            $message = $e->getMessage();
            $status  = match (true) {
                str_contains($message, 'Too many')                                    => 429,
                str_contains($message, 'allowance') || str_contains($message, 'limit') => 402,
                default                                                                => 422,
            };
            return response()->json(['message' => $message], $status);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'contacts'   => 'required|array|min:1|max:100',
            'contacts.*' => 'array',
        ]);

        $imported = 0;
        $skipped  = 0;

        foreach ($request->input('contacts') as $contact) {
            $firstName   = trim($contact['first_name'] ?? '');
            $lastName    = trim($contact['last_name'] ?? '');
            $companyName = trim($contact['company_name'] ?? '');

            if (!$firstName && !$lastName) {
                $skipped++;
                continue;
            }

            $exists = Lead::where('first_name', $firstName)
                ->where('last_name', $lastName)
                ->where('company', $companyName)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $lead = Lead::create([
                'first_name'   => $firstName,
                'last_name'    => $lastName,
                'job_title'    => $contact['title'] ?? null,
                'company'      => $companyName ?: null,
                'linkedin_url' => $contact['linkedin_url'] ?? null,
                'city'         => $contact['city'] ?? null,
                'country'      => $contact['country'] ?? null,
                'industry'     => $contact['industry'] ?? null,
                'source'       => 'AI Search',
                'status'       => 'new',
            ]);

            $email = trim($contact['email'] ?? '');
            // Skip Apollo's masked placeholder addresses — they are not real.
            if ($email && !str_contains($email, 'email_not_unlocked') && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $lead->emails()->create(['email' => $email, 'type' => 'work', 'is_primary' => true]);
            }

            $phone = trim($contact['phone'] ?? '');
            if ($phone) {
                $lead->phones()->create(['phone' => $phone, 'type' => 'mobile', 'is_primary' => true]);
            }

            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
        ]);
    }
}
