<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmtpCredential extends Model
{
    protected $fillable = [
        'user_id', 'name', 'host', 'port', 'encryption',
        'username', 'password', 'from_name', 'from_email', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'password'  => 'encrypted',
            'is_active' => 'boolean',
            'port'      => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
