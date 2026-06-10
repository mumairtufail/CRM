<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'client_id',
        'name', 'description', 'status',
        'start_date', 'due_date', 'budget', 'currency',
    ];

    protected $casts = [
        'budget'     => 'decimal:2',
        'start_date' => 'date',
        'due_date'   => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function tasks()
    {
        return $this->hasMany(ProjectTask::class)->orderBy('sort_order')->orderBy('created_at');
    }

    public function documents()
    {
        return $this->hasMany(ProjectDocument::class)->latest();
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
