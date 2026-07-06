<?php

namespace App\Http\Controllers;

use App\Services\AiEmailComposerService;
use Illuminate\Http\Request;

class AiEmailComposerController extends Controller
{
    public function draft(Request $request)
    {
        $validated = $request->validate([
            'hook'       => 'required|string|max:1000',
            'free_offer' => 'required|string|max:500',
            'has_form'   => 'boolean',
        ]);

        $service = new AiEmailComposerService();

        if (!$service->isConfigured()) {
            return response()->json([
                'not_configured' => true,
                'message'        => 'No AI provider is configured for your workspace.',
            ], 403);
        }

        $draft = $service->generateDraft([
            'hook'       => $validated['hook'],
            'free_offer' => $validated['free_offer'],
            'has_form'   => (bool) ($validated['has_form'] ?? false),
        ]);

        if ($draft === null) {
            return response()->json(['message' => 'AI generation failed. Please try again.'], 422);
        }

        return response()->json($draft);
    }

    public function followups(Request $request)
    {
        $validated = $request->validate([
            'hook'           => 'required|string|max:1000',
            'free_offer'     => 'required|string|max:500',
            'chosen_subject' => 'required|string|max:500',
            'body_html'      => 'required|string',
            'count'          => 'required|integer|min:1|max:3',
        ]);

        $service = new AiEmailComposerService();

        if (!$service->isConfigured()) {
            return response()->json([
                'not_configured' => true,
                'message'        => 'No AI provider is configured for your workspace.',
            ], 403);
        }

        $steps = $service->generateFollowUps([
            'hook'           => $validated['hook'],
            'free_offer'     => $validated['free_offer'],
            'chosen_subject' => $validated['chosen_subject'],
            'body_html'      => $validated['body_html'],
        ], (int) $validated['count']);

        if ($steps === null) {
            return response()->json(['message' => 'AI generation failed. Please try again.'], 422);
        }

        return response()->json(['steps' => $steps]);
    }

    public function rewrite(Request $request)
    {
        $validated = $request->validate([
            'hook'        => 'required|string|max:1000',
            'free_offer'  => 'required|string|max:500',
            'has_form'    => 'boolean',
            'subject'     => 'required|string|max:500',
            'body_html'   => 'required|string',
            'instruction' => 'required|string|max:500',
            'target'      => 'required|string|in:subject,body,both',
        ]);

        $service = new AiEmailComposerService();

        if (!$service->isConfigured()) {
            return response()->json([
                'not_configured' => true,
                'message'        => 'No AI provider is configured for your workspace.',
            ], 403);
        }

        $result = $service->rewrite([
            'hook'        => $validated['hook'],
            'free_offer'  => $validated['free_offer'],
            'has_form'    => (bool) ($validated['has_form'] ?? false),
            'subject'     => $validated['subject'],
            'body_html'   => $validated['body_html'],
            'instruction' => $validated['instruction'],
            'target'      => $validated['target'],
        ]);

        if ($result === null) {
            return response()->json(['message' => 'AI rewrite failed. Please try again.'], 422);
        }

        return response()->json($result);
    }
}
