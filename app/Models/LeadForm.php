<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class LeadForm extends Model
{
    use BelongsToTenant, SoftDeletes;

    /**
     * Fixed catalog of built-in fields offered by the form builder. Keys are
     * reserved — a custom field may never reuse one of these keys, and a
     * builtin field's type/mapping is always taken from here, never from
     * client input, so a tampered request can't claim e.g. "budget" is a
     * dropdown.
     */
    public const BUILTIN_CATALOG = [
        'first_name' => ['label' => 'First Name', 'type' => 'text',     'maps_to' => 'leads.first_name', 'always_required' => true],
        'last_name'  => ['label' => 'Last Name',  'type' => 'text',     'maps_to' => 'leads.last_name',  'always_required' => false],
        'email'      => ['label' => 'Email',      'type' => 'email',    'maps_to' => 'lead_emails',       'always_required' => false],
        'phone'      => ['label' => 'Phone',      'type' => 'phone',    'maps_to' => 'lead_phones',       'always_required' => false],
        'country'    => ['label' => 'Country',    'type' => 'text',     'maps_to' => 'leads.country',     'always_required' => false],
        'notes'      => ['label' => 'Notes',      'type' => 'textarea', 'maps_to' => 'leads.notes',       'always_required' => false],
        'budget'     => [
            'label' => 'Budget', 'type' => 'dropdown', 'maps_to' => 'leads.deal_value', 'always_required' => false,
            'options' => [
                ['value' => 'under_1k',  'label' => 'Under $1,000',       'deal_value' => 500],
                ['value' => '1k_5k',     'label' => '$1,000 - $5,000',    'deal_value' => 3000],
                ['value' => '5k_25k',    'label' => '$5,000 - $25,000',   'deal_value' => 15000],
                ['value' => '25k_100k',  'label' => '$25,000 - $100,000', 'deal_value' => 62500],
                ['value' => 'over_100k', 'label' => '$100,000+',          'deal_value' => 100000],
            ],
        ],
    ];

    public const CUSTOM_FIELD_TYPES = ['text', 'number', 'dropdown', 'date', 'textarea'];

    protected $fillable = [
        'organization_id', 'name', 'slug', 'description',
        'fields', 'success_message', 'is_active', 'is_default',
    ];

    protected $casts = [
        'fields'            => 'array',
        'is_active'         => 'boolean',
        'is_default'        => 'boolean',
        'last_submitted_at' => 'datetime',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function formSessions()
    {
        return $this->hasMany(FormSession::class);
    }

    /**
     * The slug column is unique across ALL workspaces, not just the current
     * one — so this must bypass the tenant global scope. Without
     * withoutGlobalScope('tenant'), the uniqueness check below would only
     * look at the current organization's forms, letting two different
     * workspaces generate the same slug and collide on the DB's unique
     * constraint (or worse, on the public /f/{slug} route, which resolves
     * unscoped).
     */
    public static function generateUniqueSlug(int $length = 8): string
    {
        do {
            $slug = Str::lower(Str::random($length));
        } while (static::withoutGlobalScope('tenant')->withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }

    public function publicUrl(): string
    {
        return url("/f/{$this->slug}");
    }
}
