<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Lead;
use Illuminate\Http\Request;

/**
 * Single-lead import used by the LinkedIn Chrome extension. Reuses the same
 * Lead model / relations as LeadController::store() and the CSV importer,
 * just scoped to one profile captured client-side from the DOM.
 */
class LeadImportController extends Controller
{
    private const SOCIAL_PLATFORMS = ['twitter', 'instagram', 'facebook', 'tiktok', 'youtube'];

    public function importSingle(Request $request)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'nullable|string|max:100',
            'email'        => 'nullable|email|max:200',
            'phone'        => 'nullable|string|max:50',
            'company'      => 'nullable|string|max:150',
            'job_title'    => 'nullable|string|max:150',
            'status'       => 'nullable|string|max:50',
            'priority'     => 'nullable|string|max:20',
            'deal_value'   => 'nullable|numeric|min:0',
            'currency'     => 'nullable|string|max:3',
            'country'      => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'industry'     => 'nullable|string|max:100',
            'website'      => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'twitter'      => 'nullable|string|max:255',
            'instagram'    => 'nullable|string|max:255',
            'facebook'     => 'nullable|string|max:255',
            'tiktok'       => 'nullable|string|max:255',
            'youtube'      => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
        ]);

        $user = $request->user();
        $organizationId = $user->organization_id;

        $socialHandles = [];
        foreach (self::SOCIAL_PLATFORMS as $platform) {
            if (! empty($validated[$platform])) {
                $socialHandles[] = ['platform' => $platform, 'url' => $validated[$platform]];
            }
        }

        $attributes = [
            'first_name'     => $validated['first_name'],
            'last_name'      => $validated['last_name'] ?? null,
            'company'        => $validated['company'] ?? null,
            'job_title'      => $validated['job_title'] ?? null,
            'website'        => $validated['website'] ?? null,
            'linkedin_url'   => $validated['linkedin_url'] ?? null,
            'notes'          => $validated['notes'] ?? null,
            'status'         => $validated['status'] ?? 'new',
            'priority'       => $validated['priority'] ?? 'medium',
            'deal_value'     => $validated['deal_value'] ?? null,
            'currency'       => $validated['currency'] ?? 'USD',
            'country'        => $validated['country'] ?? null,
            'city'           => $validated['city'] ?? null,
            'industry'       => $validated['industry'] ?? null,
            'social_handles' => $socialHandles ?: null,
            'source'         => 'linkedin_extension',
        ];

        $existing = $this->findByLinkedinUrl($organizationId, $validated['linkedin_url'] ?? null);

        if ($existing) {
            $existing->fill($attributes);
            $existing->save();
            $lead = $existing;
            $description = 'Lead updated via LinkedIn extension';
            $created = false;
        } else {
            $lead = Lead::create(array_merge($attributes, [
                'organization_id' => $organizationId,
                'assigned_to'     => $user->id,
                'created_by'      => $user->id,
            ]));
            $description = 'Lead created via LinkedIn extension';
            $created = true;
        }

        if (! empty($validated['email'])) {
            $lead->emails()->updateOrCreate(
                ['email' => $validated['email']],
                ['type' => 'work', 'is_primary' => $lead->emails()->count() === 0]
            );
        }

        if (! empty($validated['phone'])) {
            $lead->phones()->updateOrCreate(
                ['phone' => $validated['phone']],
                ['type' => 'mobile', 'is_primary' => $lead->phones()->count() === 0]
            );
        }

        Activity::create([
            'organization_id' => $organizationId,
            'lead_id'         => $lead->id,
            'user_id'         => $user->id,
            'type'            => 'import',
            'description'     => $description,
        ]);

        return response()->json([
            'lead'    => $lead->fresh(['emails', 'phones']),
            'created' => $created,
        ]);
    }

    private function findByLinkedinUrl(int $organizationId, ?string $linkedinUrl): ?Lead
    {
        if (empty($linkedinUrl)) {
            return null;
        }

        $normalized = $this->normalizeLinkedinUrl($linkedinUrl);

        return Lead::where('organization_id', $organizationId)
            ->whereNotNull('linkedin_url')
            ->get()
            ->first(fn (Lead $lead) => $this->normalizeLinkedinUrl($lead->linkedin_url) === $normalized);
    }

    private function normalizeLinkedinUrl(string $url): string
    {
        $url = strtolower(trim($url));
        $url = preg_replace('#^https?://(www\.)?#', '', $url);

        return rtrim($url, '/');
    }
}
