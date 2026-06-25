<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name', 'email', 'company', 'phone',
        'subject', 'message', 'status',
        'admin_notes', 'read_at', 'replied_at',
    ];

    protected $casts = [
        'read_at'    => 'datetime',
        'replied_at' => 'datetime',
    ];

    public function markRead(): void
    {
        if ($this->status === 'new') {
            $this->update(['status' => 'read', 'read_at' => now()]);
        }
    }

    public function scopeUnread($query)
    {
        return $query->where('status', 'new');
    }
}
