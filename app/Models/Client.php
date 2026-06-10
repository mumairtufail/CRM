<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'lead_id',
        'name', 'email', 'phone', 'company', 'job_title',
        'status', 'notes', 'deal_value', 'currency', 'converted_at',
    ];

    protected $casts = [
        'deal_value'   => 'decimal:2',
        'converted_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class)->withTrashed();
    }

    public function documents()
    {
        return $this->hasMany(ClientDocument::class)->latest();
    }

    public function projects()
    {
        return $this->hasMany(Project::class)->latest();
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
