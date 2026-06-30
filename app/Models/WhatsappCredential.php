<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WhatsappCredential extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'account_sid',
        'auth_token',
        'from_number',
        'display_name',
        'is_active',
        'verified_at',
    ];

    protected $hidden = ['auth_token'];

    protected function casts(): array
    {
        return [
            'auth_token'  => 'encrypted',
            'is_active'   => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    public function getFormattedFromNumber(): string
    {
        $number = $this->from_number;
        if (!str_starts_with($number, 'whatsapp:')) {
            $number = 'whatsapp:' . $number;
        }
        return $number;
    }
}
