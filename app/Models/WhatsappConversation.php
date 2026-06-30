<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WhatsappConversation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'lead_id',
        'organization_id',
        'lead_phone',
        'direction',
        'message_body',
        'twilio_message_sid',
        'is_bot_reply',
        'is_read',
        'is_qualified',
        'received_at',
    ];

    protected $casts = [
        'is_bot_reply'  => 'boolean',
        'is_read'       => 'boolean',
        'is_qualified'  => 'boolean',
        'received_at'   => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
