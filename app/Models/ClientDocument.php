<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class ClientDocument extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'client_id',
        'name', 'file_path', 'original_name', 'mime_type', 'size', 'notes',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size ?? 0;
        if ($bytes < 1024) return $bytes . ' B';
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }
}
