<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportCaseMessage extends Model
{
    protected $fillable = [
        'support_case_id', 'sender_type', 'user_id', 'admin_id', 'body',
    ];

    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function getSenderNameAttribute(): string
    {
        return $this->sender_type === 'admin'
            ? ($this->admin?->name ?? 'Support Team')
            : ($this->user?->name ?? 'Former team member');
    }
}
