<?php

namespace App\Http\Controllers;

use App\Models\ChatbotConversation;
use App\Models\SystemSetting;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Public endpoint behind the landing-page chat widget. No auth — sessions
 * are keyed by a widget-generated UUID and throttled per IP.
 */
class ChatbotController extends Controller
{
    public function message(Request $request, ChatbotService $chatbot): JsonResponse
    {
        $config = SystemSetting::getChatbot();
        if (!$config['enabled']) {
            return response()->json(['message' => 'Chat is currently unavailable.'], 404);
        }

        $validated = $request->validate([
            'session_id' => 'required|uuid',
            'message'    => 'required|string|max:2000',
            'page'       => 'nullable|string|max:255',
        ]);

        $conversation = ChatbotConversation::firstOrCreate(
            ['session_id' => $validated['session_id']],
            [
                'page' => Str::limit($validated['page'] ?? '', 250, ''),
                'ip'   => $request->ip(),
            ]
        );

        // Cap runaway sessions so a single visitor can't burn the AI budget.
        if ($conversation->messages()->count() > 200) {
            return response()->json([
                'reply' => "We've been chatting a while! Drop us a line through the contact form and the team will pick it up from here.",
            ]);
        }

        $reply = $chatbot->reply($conversation, trim($validated['message']));

        if ($reply === null) {
            return response()->json([
                'reply' => "Sorry — I'm having trouble on my end right now. Please try again in a moment, or reach us through the contact form.",
            ]);
        }

        return response()->json(['reply' => $reply]);
    }
}
