<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WhatsappSend extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'whatsapp_campaign_id',
        'lead_id',
        'organization_id',
        'to_number',
        'message_body',
        'twilio_message_sid',
        'status',
        'error_message',
        'error_code',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'is_followup',
        'parent_send_id',
    ];

    protected $casts = [
        'is_followup'  => 'boolean',
        'sent_at'      => 'datetime',
        'delivered_at' => 'datetime',
        'read_at'      => 'datetime',
        'failed_at'    => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(WhatsappCampaign::class, 'whatsapp_campaign_id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function parent()
    {
        return $this->belongsTo(WhatsappSend::class, 'parent_send_id');
    }

    public function followUp()
    {
        return $this->hasOne(WhatsappSend::class, 'parent_send_id');
    }
}
