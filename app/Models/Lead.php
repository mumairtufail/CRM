<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'company', 'job_title', 'website',
        'linkedin_url', 'notes', 'source', 'status', 'priority',
        'deal_value', 'currency', 'country', 'city', 'industry',
        'avatar_url', 'social_handles', 'last_contacted_at', 'follow_up_at',
    ];

    protected $casts = [
        'social_handles'    => 'array',
        'deal_value'        => 'decimal:2',
        'last_contacted_at' => 'datetime',
        'follow_up_at'      => 'datetime',
    ];

    protected $appends = ['full_name', 'primary_email', 'primary_phone'];

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

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getPrimaryEmailAttribute(): ?string
    {
        return $this->emails()->where('is_primary', true)->value('email')
            ?? $this->emails()->value('email');
    }

    public function getPrimaryPhoneAttribute(): ?string
    {
        return $this->phones()->where('is_primary', true)->value('phone')
            ?? $this->phones()->value('phone');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('company', 'like', "%{$search}%")
              ->orWhereHas('emails', fn ($q) => $q->where('email', 'like', "%{$search}%"));
        });
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
