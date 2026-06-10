<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class ProjectTask extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'project_id',
        'title', 'description', 'status', 'priority', 'due_date', 'sort_order',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
