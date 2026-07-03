<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Lead;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappConversation;
use App\Models\WhatsappTemplate;
use App\Models\WhatsappUsageMonthly;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappConversationController extends Controller
{
    private const FRIENDLY_ERRORS = [
        'TENANT_DISABLED'      => "WhatsApp isn't active on your account yet.",
        'QUOTA_EXCEEDED'       => "You've reached this month's WhatsApp message limit.",
        'NO_POOLED_CREDENTIAL' => 'WhatsApp is not configured. Please contact support.',
        'NO_PHONE'             => 'This lead has no phone number configured.',
        'INVALID_TEMPLATE'     => 'Unknown or unapproved message template.',
    ];

    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $orgId  = $request->user()->organization_id;

        $leadsWithMessages = WhatsappConversation::select('lead_id')
            ->distinct()
            ->pluck('lead_id');

        $leads = Lead::whereIn('id', $leadsWithMessages)
            ->when($search, fn ($q) => $q->search($search))
            ->with('emails')
            ->get()
            ->map(fn ($lead) => [
                'id'               => $lead->id,
                'name'             => $lead->full_name,
                'company'          => $lead->company,
                'whatsapp_number'  => $lead->whatsapp_number,
                'unread_count'     => WhatsappConversation::where('lead_id', $lead->id)
                    ->where('direction', 'inbound')
                    ->where('is_read', false)
                    ->count(),
                'last_message'     => WhatsappConversation::where('lead_id', $lead->id)
                    ->latest()
                    ->first()?->only(['message_body', 'direction', 'created_at']),
            ]);

        $settings = TenantWhatsappSettings::forOrganization($orgId);
        $usage    = WhatsappUsageMonthly::currentMonthFor($orgId);

        return Inertia::render('WhatsApp/Conversations/Index', [
            'leads'       => $leads,
            'search'      => $search,
            'enabled'     => (bool) $settings?->isUsableForSend(),
            'quotaLimit'  => $settings?->monthly_message_quota,
            'quotaUsed'   => $usage?->sent_count ?? 0,
            'templates'   => WhatsappTemplate::approved()->pluck('name'),
        ]);
    }

    public function show(Request $request, Lead $lead)
    {
        WhatsappConversation::where('lead_id', $lead->id)
            ->where('direction', 'inbound')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = WhatsappConversation::where('lead_id', $lead->id)
            ->with('whatsappMessage:id,status')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'           => $m->id,
                'direction'    => $m->direction,
                'message_body' => $m->message_body,
                'is_bot_reply' => $m->is_bot_reply,
                'is_qualified' => $m->is_qualified,
                'status'       => $m->whatsappMessage?->status ?? ($m->direction === 'outbound' ? 'sent' : null),
                'created_at'   => $m->created_at->toIso8601String(),
            ]);

        return response()->json([
            'lead' => [
                'id'              => $lead->id,
                'name'            => $lead->full_name,
                'whatsapp_number' => $lead->whatsapp_number,
            ],
            'messages'     => $messages,
            'session_open' => $this->hasOpenSession($lead),
        ]);
    }

    public function send(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'message'        => 'required_without:template_name|nullable|string|max:4096',
            'message_type'   => 'nullable|in:text,template',
            'template_name'  => 'required_if:message_type,template|nullable|string|max:255',
        ]);

        $messageType = $validated['message_type'] ?? 'text';

        if (!$this->hasOpenSession($lead) && $messageType !== 'template') {
            return response()->json([
                'success' => false,
                'message' => 'No open conversation session with this lead — send a template message to start one.',
            ], 422);
        }

        $service = new WhatsappService();
        $result  = $service->send(
            $lead,
            $validated['message'] ?? '',
            $request->user()->organization_id,
            $messageType,
            $validated['template_name'] ?? null,
        );

        if (!$result['success']) {
            $message = self::FRIENDLY_ERRORS[$result['error_code']] ?? $result['error'];
            return response()->json(['success' => false, 'message' => $message], 422);
        }

        $msg = WhatsappConversation::create([
            'lead_id'             => $lead->id,
            'organization_id'     => $request->user()->organization_id,
            'whatsapp_message_id' => $result['whatsapp_message_id'] ?? null,
            'lead_phone'          => $lead->whatsapp_number ?? '',
            'direction'           => 'outbound',
            'message_body'        => $validated['message'] ?? "[template: {$validated['template_name']}]",
            'wa_message_id'       => $result['wa_message_id'],
            'is_bot_reply'        => false,
            'is_read'             => true,
        ]);

        Activity::create([
            'lead_id'     => $lead->id,
            'user_id'     => $request->user()->id,
            'type'        => 'whatsapp',
            'description' => 'Sent WhatsApp message',
            'meta'        => ['channel' => 'whatsapp', 'message_type' => $messageType],
        ]);

        return response()->json(['success' => true, 'message' => $msg]);
    }

    private function hasOpenSession(Lead $lead): bool
    {
        return WhatsappConversation::where('lead_id', $lead->id)
            ->where('direction', 'inbound')
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();
    }
}
