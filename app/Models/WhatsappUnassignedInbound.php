<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappUnassignedInbound extends Model
{
    protected $table = 'whatsapp_unassigned_inbound';

    protected $fillable = [
        'wa_message_id',
        'from_number',
        'body',
        'message_type',
        'raw_payload',
        'matched_organization_ids',
        'status',
        'assigned_organization_id',
        'assigned_lead_id',
        'assigned_by',
        'assigned_at',
    ];

    protected function casts(): array
    {
        return [
            'raw_payload'              => 'array',
            'matched_organization_ids' => 'array',
            'assigned_at'              => 'datetime',
        ];
    }

    public function assignedOrganization()
    {
        return $this->belongsTo(Organization::class, 'assigned_organization_id');
    }

    public function assignedLead()
    {
        return $this->belongsTo(Lead::class, 'assigned_lead_id');
    }
}
