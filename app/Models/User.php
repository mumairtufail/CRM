<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['organization_id', 'role', 'role_id', 'is_active', 'name', 'email', 'password', 'company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin', 'mail_batch_size', 'mail_batch_delay', 'active_template_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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

    public function emailTemplates()
    {
        return $this->hasMany(EmailTemplate::class);
    }

    public function activeEmailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class, 'active_template_id');
    }
}
