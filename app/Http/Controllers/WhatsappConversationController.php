<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\WhatsappConversation;
use App\Models\WhatsappCredential;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappConversationController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

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

        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)->first();

        return Inertia::render('WhatsApp/Conversations/Index', [
            'leads'          => $leads,
            'search'         => $search,
            'hasCredential'  => (bool) $credential,
            'isVerified'     => $credential?->isVerified() ?? false,
        ]);
    }

    public function show(Request $request, Lead $lead)
    {
        WhatsappConversation::where('lead_id', $lead->id)
            ->where('direction', 'inbound')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = WhatsappConversation::where('lead_id', $lead->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'           => $m->id,
                'direction'    => $m->direction,
                'message_body' => $m->message_body,
                'is_bot_reply' => $m->is_bot_reply,
                'is_qualified' => $m->is_qualified,
                'created_at'   => $m->created_at->toIso8601String(),
            ]);

        return response()->json([
            'lead' => [
                'id'              => $lead->id,
                'name'            => $lead->full_name,
                'whatsapp_number' => $lead->whatsapp_number,
            ],
            'messages' => $messages,
        ]);
    }

    public function send(Request $request, Lead $lead)
    {
        $request->validate(['message' => 'required|string|max:4096']);

        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->first();

        if (!$credential) {
            return response()->json(['success' => false, 'message' => 'No active WhatsApp account configured.'], 422);
        }

        $service = new WhatsappService($credential);
        $result  = $service->send($lead, $request->message);

        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['error']], 422);
        }

        $msg = WhatsappConversation::create([
            'lead_id'            => $lead->id,
            'organization_id'    => $request->user()->organization_id,
            'lead_phone'         => $lead->whatsapp_number ?? '',
            'direction'          => 'outbound',
            'message_body'       => $request->message,
            'twilio_message_sid' => $result['message_sid'],
            'is_bot_reply'       => false,
            'is_read'            => true,
        ]);

        return response()->json(['success' => true, 'message' => $msg]);
    }
}
