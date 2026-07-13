<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use App\Models\LeadGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lead extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'organization_id', 'lead_form_id', 'assigned_to', 'created_by',
        'first_name', 'last_name', 'company', 'job_title', 'website',
        'linkedin_url', 'notes', 'source', 'status', 'priority',
        'deal_value', 'currency', 'country', 'city', 'industry',
        'avatar_url', 'social_handles', 'contact_channels', 'custom_fields', 'whatsapp_number', 'last_contacted_at', 'follow_up_at',
    ];

    protected $casts = [
        'social_handles'    => 'array',
        'contact_channels'  => 'array',
        'custom_fields'     => 'array',
        'deal_value'        => 'decimal:2',
        'last_contacted_at' => 'datetime',
        'follow_up_at'      => 'datetime',
    ];

    protected $appends = ['full_name', 'primary_email', 'primary_phone'];

    public function leadForm()
    {
        return $this->belongsTo(LeadForm::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function emails()
    {
        return $this->hasMany(LeadEmail::class);
    }

    public function phones()
    {
        return $this->hasMany(LeadPhone::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'lead_tag');
    }

    public function groups()
    {
        return $this->belongsToMany(LeadGroup::class, 'lead_group_members', 'lead_id', 'lead_group_id')
            ->withPivot('added_at');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->latest();
    }

    public function emailSends()
    {
        return $this->hasMany(EmailSend::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getPrimaryEmailAttribute(): ?string
    {
        // Reuse the eager-loaded relation — these accessors are in $appends, so
        // hitting the DB here turns every list serialization into an N+1.
        if ($this->relationLoaded('emails')) {
            return $this->emails->firstWhere('is_primary', true)?->email
                ?? $this->emails->first()?->email;
        }

        return $this->emails()->where('is_primary', true)->value('email')
            ?? $this->emails()->value('email');
    }

    public function getPrimaryPhoneAttribute(): ?string
    {
        if ($this->relationLoaded('phones')) {
            return $this->phones->firstWhere('is_primary', true)?->phone
                ?? $this->phones->first()?->phone;
        }

        return $this->phones()->where('is_primary', true)->value('phone')
            ?? $this->phones()->value('phone');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
              ->orWhere('company', 'like', "%{$search}%")
              ->orWhereHas('emails', fn ($q) => $q->where('email', 'like', "%{$search}%"));
        });
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
