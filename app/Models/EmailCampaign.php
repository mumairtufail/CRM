<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailCampaign extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'name', 'subject', 'body_html', 'body_text', 'status',
        'from_name', 'from_email', 'filters',
        'recipient_mode', 'group_id',
        'total_recipients', 'sent_count', 'opened_count',
        'clicked_count', 'bounced_count', 'unsubscribed_count',
        'scheduled_at', 'sent_at',
    ];

    protected $casts = [
        'filters'      => 'array',
        'scheduled_at' => 'datetime',
        'sent_at'      => 'datetime',
    ];

    public function sends()
    {
        return $this->hasMany(EmailSend::class, 'email_campaign_id');
    }

    public function group()
    {
        return $this->belongsTo(LeadGroup::class, 'group_id');
    }
}
