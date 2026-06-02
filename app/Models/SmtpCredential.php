<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SmtpCredential extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'user_id', 'name', 'host', 'port', 'encryption',
        'username', 'password', 'from_name', 'from_email', 'is_active',
        'imap_host', 'imap_port', 'imap_encryption', 'last_fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'password'        => 'encrypted',
            'is_active'       => 'boolean',
            'port'            => 'integer',
            'imap_port'       => 'integer',
            'last_fetched_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fetchedEmails()
    {
        return $this->hasMany(FetchedEmail::class);
    }

    public function hasImap(): bool
    {
        return !empty($this->imap_host);
    }
}
