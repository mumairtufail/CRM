<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSend extends Model
{
    protected $fillable = [
        'email_campaign_id', 'lead_id', 'email_used', 'status',
        'message_id', 'sent_at', 'opened_at', 'clicked_at',
    ];

    protected $casts = [
        'sent_at'    => 'datetime',
        'opened_at'  => 'datetime',
        'clicked_at' => 'datetime',
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
