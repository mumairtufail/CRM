<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\ChatbotKnowledgeEntry;
use App\Models\SystemSetting;
use App\Services\ChatbotService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotSettingsController extends Controller
{
    // ── Settings (Chatbot tab in Admin > Settings) ────────────────────────────

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled'         => 'required|boolean',
            'agent_name'      => 'required|string|max:50',
            'welcome_message' => 'required|string|max:500',
            'system_prompt'   => 'nullable|string|max:10000',
        ]);

        SystemSetting::saveChatbot($validated);
        SystemSetting::clearChatbotCache();

        return back()->with('success', 'Chatbot settings saved.');
    }

    // ── Knowledge base CRUD ───────────────────────────────────────────────────

    public function storeKnowledge(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string|max:20000',
        ]);

        $validated['sort_order'] = (int) ChatbotKnowledgeEntry::max('sort_order') + 1;
        ChatbotKnowledgeEntry::create($validated);

        return back()->with('success', 'Knowledge base entry added.');
    }

    public function updateKnowledge(Request $request, ChatbotKnowledgeEntry $entry): RedirectResponse
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'content'   => 'required|string|max:20000',
            'is_active' => 'required|boolean',
        ]);

        $entry->update($validated);

        return back()->with('success', 'Knowledge base entry updated.');
    }

    public function destroyKnowledge(ChatbotKnowledgeEntry $entry): RedirectResponse
    {
        $entry->delete();

        return back()->with('success', 'Knowledge base entry deleted.');
    }

    // ── Recorded conversations ────────────────────────────────────────────────

    public function conversations(Request $request): Response
    {
        // Guard: don't 500 if the deploy hasn't run the chatbot migration yet.
        if (!\Illuminate\Support\Facades\Schema::hasTable('chatbot_conversations')) {
            return Inertia::render('Admin/ChatbotConversations', [
                'conversations' => ['data' => [], 'links' => []],
                'filters'       => ['search' => ''],
            ]);
        }

        $conversations = ChatbotConversation::withCount('messages')
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = $request->string('search');
                $q->where(fn ($w) => $w
                    ->where('visitor_name', 'like', "%{$s}%")
                    ->orWhere('visitor_email', 'like', "%{$s}%")
                    ->orWhere('session_id', 'like', "%{$s}%"));
            })
            ->orderByDesc('last_message_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ChatbotConversations', [
            'conversations' => $conversations,
            'filters'       => ['search' => $request->get('search', '')],
        ]);
    }

    public function showConversation(ChatbotConversation $conversation): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'conversation' => $conversation,
            'messages'     => $conversation->messages()->orderBy('id')->get(),
        ]);
    }

    public function destroyConversation(ChatbotConversation $conversation): RedirectResponse
    {
        $conversation->delete();

        return back()->with('success', 'Conversation deleted.');
    }
}
