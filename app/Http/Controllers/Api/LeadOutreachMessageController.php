<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Services\LeadOutreachMessageService;
use Illuminate\Http\Request;

class LeadOutreachMessageController extends Controller
{
    public function generate(Request $request, Lead $lead)
    {
        abort_unless($lead->organization_id === $request->user()->organization_id, 403);

        $validated = $request->validate([
            'instructions' => 'nullable|string|max:500',
        ]);

        $service = new LeadOutreachMessageService($lead->organization_id);

        if (! $service->isConfigured()) {
            return response()->json([
                'message' => 'No AI provider is configured for this workspace. Set one up under Settings > AI Provider.',
            ], 422);
        }

        $result = $service->generate([
            'first_name' => $lead->first_name,
            'last_name'  => $lead->last_name,
            'job_title'  => $lead->job_title,
            'company'    => $lead->company,
            'city'       => $lead->city,
            'country'    => $lead->country,
            'notes'      => $lead->notes,
        ], $validated['instructions'] ?? null);

        if ($result === null) {
            return response()->json(['message' => 'Message generation failed. Try again.'], 422);
        }

        return response()->json($result);
    }
}
