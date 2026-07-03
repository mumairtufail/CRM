<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'lead_id',
        'direction',
        'wa_message_id',
        'to_number',
        'from_number',
        'message_type',
        'template_name',
        'body',
        'status',
        'error_code',
        'error_message',
        'sent_by_user_id',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
