<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsappCampaign extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'name',
        'message_body',
        'status',
        'recipient_mode',
        'group_id',
        'filters',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'read_count',
        'failed_count',
        'followup_enabled',
        'followup_body',
        'followup_delay_hours',
        'sent_at',
    ];

    protected $casts = [
        'filters'          => 'array',
        'followup_enabled' => 'boolean',
        'sent_at'          => 'datetime',
    ];

    public function sends()
    {
        return $this->hasMany(WhatsappSend::class);
    }

    public function group()
    {
        return $this->belongsTo(LeadGroup::class, 'group_id');
    }
}
