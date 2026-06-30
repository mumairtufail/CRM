<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\WhatsappConversation;
use App\Models\WhatsappKnowledgeBase;
use Illuminate\Support\Facades\Log;

class WhatsappBotService
{
    /**
     * Generate a bot reply for an incoming WhatsApp message.
     * Uses the org's saved AI provider (Claude / OpenAI / Kimi).
     */
    public function generateReply(Lead $lead, string $incoming, int $organizationId): array
    {
        $ai = AiService::forOrg($organizationId);

        if (!$ai) {
            Log::info('WhatsApp bot: no AI provider configured for org', ['org_id' => $organizationId]);
            return ['success' => false, 'error' => 'No AI provider configured'];
        }

        $knowledgeBase = $this->getKnowledgeBase($organizationId);
        $history       = $this->getConversationHistory($lead->id);
        $system        = $this->buildSystemPrompt($knowledgeBase, $lead);

        // Build the full conversation as a single user turn for models that
        // don't support multi-turn history natively via the unified interface.
        $userMessage = $this->buildUserMessage($history, $incoming);

        $reply = $ai->chat($system, $userMessage, 500);

        if ($reply === null) {
            Log::error('WhatsApp bot: AI call returned null', ['org_id' => $organizationId]);
            return ['success' => false, 'error' => 'AI service unavailable'];
        }

        return [
            'success'      => true,
            'reply'        => trim($reply),
            'is_qualified' => $this->detectQualification($incoming),
        ];
    }

    private function buildSystemPrompt(string $knowledgeBase, Lead $lead): string
    {
        return "You are a professional sales assistant representing this business.
Your job is to qualify leads and answer questions using ONLY the information in the knowledge base below.
Do NOT make up information. If you do not know something, say you will check and get back to them.
Keep replies concise, friendly, and professional. Maximum 3 sentences per reply.
Sound human, not robotic. If the lead expresses clear interest in buying, booking a call, or wants pricing, that is a qualified lead.

LEAD NAME: {$lead->first_name} {$lead->last_name}

KNOWLEDGE BASE:
{$knowledgeBase}

Always reply in the same language the lead is using.";
    }

    private function buildUserMessage(array $history, string $newMessage): string
    {
        if (empty($history)) {
            return $newMessage;
        }

        $lines = [];
        foreach ($history as $msg) {
            $role   = $msg['direction'] === 'inbound' ? 'Customer' : 'Assistant';
            $lines[] = "{$role}: {$msg['message_body']}";
        }
        $lines[] = "Customer: {$newMessage}";

        return implode("\n", $lines) . "\n\nAssistant:";
    }

    private function getConversationHistory(int $leadId): array
    {
        return WhatsappConversation::where('lead_id', $leadId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->toArray();
    }

    private function getKnowledgeBase(int $organizationId): string
    {
        $entries = WhatsappKnowledgeBase::withoutGlobalScopes()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->get();

        if ($entries->isEmpty()) {
            return 'No knowledge base configured. Answer general queries politely.';
        }

        return $entries->map(fn ($e) => "### {$e->title}\n{$e->content}")->join("\n\n");
    }

    private function detectQualification(string $incoming): bool
    {
        $keywords = [
            'interested', 'yes', 'sure', 'how much', 'price', 'pricing',
            'cost', 'book', 'schedule', 'call', 'demo', 'buy', 'purchase',
            'sign up', 'get started', 'tell me more', 'sounds good',
        ];

        $lower = strtolower($incoming);
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) return true;
        }

        return false;
    }
}
