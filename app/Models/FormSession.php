<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class FormSession extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'lead_form_id', 'lead_id', 'session_token',
        'values', 'identifying_email', 'utm_source', 'utm_medium', 'utm_campaign',
        'status', 'started_at', 'last_active_at', 'submitted_at',
        'ip_address', 'user_agent',
    ];

    protected $casts = [
        'values'         => 'array',
        'started_at'     => 'datetime',
        'last_active_at' => 'datetime',
        'submitted_at'   => 'datetime',
    ];

    public function leadForm()
    {
        return $this->belongsTo(LeadForm::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
