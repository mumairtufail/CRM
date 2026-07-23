<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErrorLog extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'source',
        'message',
        'exception_class',
        'file',
        'line',
        'trace',
        'url',
        'organization_id',
        'causer_id',
        'causer_name',
        'ip_address',
        'user_agent',
        'context',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }
}
