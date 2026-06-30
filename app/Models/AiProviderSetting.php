<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class AiProviderSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'provider',
        'api_key',
        'model',
        'base_url',
        'is_active',
        'validated_at',
    ];

    protected $hidden = ['api_key'];

    protected function casts(): array
    {
        return [
            'api_key'      => 'encrypted',
            'is_active'    => 'boolean',
            'validated_at' => 'datetime',
        ];
    }

    public function isValidated(): bool
    {
        return !is_null($this->validated_at);
    }

    /** Human label for the provider slug */
    public function providerLabel(): string
    {
        return match ($this->provider) {
            'claude' => 'Claude (Anthropic)',
            'openai' => 'OpenAI',
            'kimi'   => 'Kimi K2 (NVIDIA NIM)',
            default  => ucfirst($this->provider),
        };
    }
}
