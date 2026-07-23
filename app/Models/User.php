<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['organization_id', 'role', 'role_id', 'is_active', 'name', 'email', 'password', 'google_id', 'avatar', 'callback_phone', 'mail_batch_size', 'mail_batch_delay', 'active_template_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * These proxy to the Organization (see accessors below) so branding is
     * shared tenant-wide instead of drifting per user; they have no backing
     * column on `users` but still need to serialize into Inertia props.
     */
    protected $appends = ['company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin'];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'is_active'          => 'boolean',
            'mail_batch_size'    => 'integer',
            'mail_batch_delay'   => 'integer',
            'active_template_id' => 'integer',
        ];
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Named `assignedRole` (not `role`) to avoid colliding with the existing
     * `role` string column/attribute ('owner'|'member').
     */
    public function assignedRole()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function hasPermission(string $key): bool
    {
        if ($this->isOwner()) {
            return true;
        }

        if (! $this->role_id) {
            return false;
        }

        return in_array($key, Role::cachedPermissionKeys($this->role_id), true);
    }

    public function smtpCredentials()
    {
        return $this->hasMany(SmtpCredential::class);
    }

    public function activeSmtpCredential()
    {
        return $this->hasOne(SmtpCredential::class)->where('is_active', true);
    }

    /**
     * The SMTP account this user should actually send/receive through: their
     * own active one, or the organization owner's active one as a tenant-wide
     * default for agents who haven't configured a personal mailbox.
     */
    public function effectiveSmtpCredential(): ?SmtpCredential
    {
        return $this->activeSmtpCredential ?? $this->organization?->owner?->activeSmtpCredential;
    }

    /**
     * Workspace branding lives on the Organization so every user in the
     * tenant sees what the admin configured, not their own separate copy.
     */
    protected function companyName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_name,
            set: fn ($value) => $this->proxyToOrganization('company_name', $value),
        );
    }

    protected function companyLogo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_logo,
            set: fn ($value) => $this->proxyToOrganization('company_logo', $value),
        );
    }

    protected function companyWebsite(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_website,
            set: fn ($value) => $this->proxyToOrganization('company_website', $value),
        );
    }

    protected function companyPhone(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_phone,
            set: fn ($value) => $this->proxyToOrganization('company_phone', $value),
        );
    }

    protected function companyEmail(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_email,
            set: fn ($value) => $this->proxyToOrganization('company_email', $value),
        );
    }

    protected function companyLinkedin(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->organization?->company_linkedin,
            set: fn ($value) => $this->proxyToOrganization('company_linkedin', $value),
        );
    }

    private function proxyToOrganization(string $key, $value): array
    {
        $this->organization?->update([$key => $value]);

        return [];
    }

    public function emailTemplates()
    {
        return $this->hasMany(EmailTemplate::class);
    }

    public function activeEmailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class, 'active_template_id');
    }
}
