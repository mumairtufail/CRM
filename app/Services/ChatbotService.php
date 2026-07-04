<?php

namespace App\Services;

use App\Models\ChatbotConversation;
use App\Models\ChatbotKnowledgeEntry;
use App\Models\ChatbotMessage;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Log;

/**
 * Public-site support chatbot. Answers from the admin-managed knowledge base
 * using the platform admin's AI provider, and records every conversation
 * (one ChatbotConversation per visitor session, full transcript in
 * chatbot_messages).
 */
class ChatbotService
{
    /**
     * Default persona/system prompt. Shown in (and editable from) the admin
     * settings panel; used whenever no custom prompt is saved.
     */
    public static function defaultSystemPrompt(): string
    {
        return <<<'PROMPT'
You are {agent_name}, a support and sales agent on the website's live chat. You write like a real person on a chat shift — warm, natural, and to the point.

How you talk:
- Keep replies short: 1-3 sentences for most questions. Chat is a back-and-forth, not an essay.
- Sound human and conversational. Use contractions. Mirror the visitor's tone and language.
- Never open with canned lines like "How may I assist you today?" — talk the way a friendly colleague would.
- No bullet lists or headings unless the visitor asks for a breakdown. No emojis unless the visitor uses them first.
- Ask one good follow-up question when you need more context to actually help.

What you know:
- Answer ONLY from the knowledge base below. It is the single source of truth about the product, pricing, and policies.
- If the knowledge base doesn't cover something, say so plainly ("Good question — I don't have that in front of me") and offer to have a teammate follow up. Ask for their email so the team can reach them.
- Never invent features, prices, discounts, or commitments that aren't in the knowledge base.

Honesty:
- If a visitor directly asks whether they're talking to a bot or an AI, answer honestly in one short sentence (you're the site's automated assistant) and offer to loop in a human teammate — then get right back to helping. Don't dwell on it, and never claim to be human.

Your goal:
- Actually solve the visitor's problem or answer their question first. If they show buying interest (pricing, demo, getting started), guide them to sign up or leave their email for the team.
PROMPT;
    }

    /**
     * Resolved system prompt: custom (admin-saved) or default, with the
     * agent name substituted and the knowledge base appended.
     */
    public function buildSystemPrompt(): string
    {
        $config = SystemSetting::getChatbot();

        $prompt = trim($config['system_prompt'] ?? '') !== ''
            ? $config['system_prompt']
            : self::defaultSystemPrompt();

        $prompt = str_replace('{agent_name}', $config['agent_name'] ?: 'Sarah', $prompt);

        return $prompt . "\n\nKNOWLEDGE BASE:\n" . $this->knowledgeBaseText();
    }

    /**
     * Handle an incoming visitor message: persist it, get the AI reply,
     * persist that too. Returns [reply, conversation] or [null, conversation]
     * when the AI provider is unavailable.
     */
    public function reply(ChatbotConversation $conversation, string $incoming): ?string
    {
        $conversation->messages()->create(['role' => 'visitor', 'content' => $incoming]);
        $conversation->update(['last_message_at' => now()]);

        $ai = AiService::forAdmin();
        if (!$ai) {
            Log::warning('Chatbot: no active admin AI provider configured.');
            return null;
        }

        $reply = $ai->chat(
            $this->buildSystemPrompt(),
            $this->buildUserMessage($conversation),
            600
        );

        if ($reply === null) {
            return null;
        }

        $reply = trim($reply);
        $conversation->messages()->create(['role' => 'agent', 'content' => $reply]);
        $conversation->update(['last_message_at' => now()]);

        return $reply;
    }

    /**
     * Serialize recent history (including the just-saved incoming message)
     * as a single user turn for the unified AiService interface.
     */
    private function buildUserMessage(ChatbotConversation $conversation): string
    {
        $history = $conversation->messages()
            ->orderByDesc('id')
            ->limit(16)
            ->get()
            ->reverse();

        $lines = $history->map(function (ChatbotMessage $msg) {
            $role = $msg->role === 'visitor' ? 'Visitor' : 'You';
            return "{$role}: {$msg->content}";
        });

        return $lines->join("\n") . "\n\nYou:";
    }

    private function knowledgeBaseText(): string
    {
        $entries = ChatbotKnowledgeEntry::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if ($entries->isEmpty()) {
            return 'No knowledge base entries yet. Answer general greetings politely, explain you don\'t have details in front of you, and offer to have a teammate follow up.';
        }

        return $entries->map(fn ($e) => "### {$e->title}\n{$e->content}")->join("\n\n");
    }
}
