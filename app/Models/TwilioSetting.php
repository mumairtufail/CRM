<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TwilioSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'account_sid',
        'auth_token',
        'phone_number',
        'twiml_app_sid',
        'api_key',
        'api_secret',
        'is_active',
        'validated_at',
    ];

    protected $hidden = ['auth_token', 'api_secret'];

    protected function casts(): array
    {
        return [
            'auth_token'   => 'encrypted',
            'api_secret'   => 'encrypted',
            'is_active'    => 'boolean',
            'validated_at' => 'datetime',
        ];
    }

    public function isValidated(): bool
    {
        return !is_null($this->validated_at);
    }
}
