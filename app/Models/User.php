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

#[Fillable(['organization_id', 'role', 'is_superadmin', 'name', 'email', 'password', 'company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin', 'mail_batch_size', 'mail_batch_delay', 'active_template_id'])]
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
            'is_superadmin'      => 'boolean',
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

    public function isSuperadmin(): bool
    {
        return (bool) $this->is_superadmin;
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
