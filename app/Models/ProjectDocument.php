<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProjectDocument extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'project_id',
        'name', 'file_path', 'original_name', 'mime_type', 'size', 'notes',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        if ($bytes < 1024)        return $bytes . ' B';
        if ($bytes < 1048576)     return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
