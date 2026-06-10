<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeadGroup extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'color',
    ];

    public function leads()
    {
        return $this->belongsToMany(Lead::class, 'lead_group_members')
            ->withPivot('added_at')
            ->orderBy('leads.first_name');
    }

    public function campaigns()
    {
        return $this->hasMany(EmailCampaign::class, 'group_id');
    }
}
