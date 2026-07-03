<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SupportCase extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'subject', 'status', 'created_by', 'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(SupportCaseMessage::class)->orderBy('created_at');
    }

    /**
     * Separate from messages() (which is ordered oldest-first for the thread
     * view) — latestOfMany() defines its own independent ordering, so a
     * naive ->latest() constraint on messages() would otherwise be dominated
     * by that relation's baked-in ascending order.
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(SupportCaseMessage::class)->latestOfMany();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}
