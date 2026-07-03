<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Models\WhatsappUnassignedInbound;
use Illuminate\Http\Request;

class WhatsappUnassignedInboundController extends Controller
{
    public function assign(Request $request, WhatsappUnassignedInbound $inbound)
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'lead_id'         => 'nullable|exists:leads,id',
        ]);

        $lead = $validated['lead_id'] ?? null
            ? Lead::withoutGlobalScopes()->find($validated['lead_id'])
            : null;

        $logRow = WhatsappMessage::withoutGlobalScopes()->create([
            'organization_id' => $validated['organization_id'],
            'lead_id'         => $lead?->id,
            'direction'       => 'inbound',
            'wa_message_id'   => $inbound->wa_message_id,
            'from_number'     => $inbound->from_number,
            'message_type'    => $inbound->message_type,
            'body'            => $inbound->body,
            'status'          => 'delivered',
        ]);

        if ($lead) {
            WhatsappConversation::withoutGlobalScopes()->create([
                'lead_id'             => $lead->id,
                'organization_id'     => $validated['organization_id'],
                'whatsapp_message_id' => $logRow->id,
                'lead_phone'          => $inbound->from_number,
                'direction'           => 'inbound',
                'message_body'        => $inbound->body ?? '',
                'wa_message_id'       => $inbound->wa_message_id,
                'is_bot_reply'        => false,
                'received_at'         => now(),
            ]);
        }

        $inbound->update([
            'status'                   => 'assigned',
            'assigned_organization_id' => $validated['organization_id'],
            'assigned_lead_id'         => $lead?->id,
            'assigned_by'              => $request->user('admin')->id,
            'assigned_at'              => now(),
        ]);

        return back()->with('success', 'Message assigned.');
    }

    public function ignore(Request $request, WhatsappUnassignedInbound $inbound)
    {
        $inbound->update([
            'status'      => 'ignored',
            'assigned_by' => $request->user('admin')->id,
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Message ignored.');
    }
}
