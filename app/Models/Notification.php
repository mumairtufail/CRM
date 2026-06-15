<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Notification extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id', 'type', 'title', 'body', 'link', 'data',
    ];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Create a notification and record it on the dedicated channel. Used from
     * background jobs and public tracking routes where no tenant is bound, so
     * organization_id must always be passed explicitly by the caller.
     */
    public static function push(array $attrs): self
    {
        $notification = static::create($attrs);

        Log::channel('notifications')->info('Notification created', [
            'id'    => $notification->id,
            'type'  => $notification->type,
            'org'   => $notification->organization_id,
            'title' => $notification->title,
        ]);

        return $notification;
    }

    public function markRead(): void
    {
        if ($this->read_at === null) {
            $this->forceFill(['read_at' => now()])->save();
        }
    }
}
