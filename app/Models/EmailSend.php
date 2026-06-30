<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class EmailSend extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'email_campaign_id', 'lead_id', 'email_used', 'status', 'error_message',
        'message_id', 'tracking_token', 'sent_at', 'opened_at', 'clicked_at',
        'is_followup', 'parent_send_id', 'followup_step',
    ];

    protected $casts = [
        'sent_at'       => 'datetime',
        'opened_at'     => 'datetime',
        'clicked_at'    => 'datetime',
        'is_followup'   => 'boolean',
    ];

    public function campaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'email_campaign_id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
