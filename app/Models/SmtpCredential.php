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
