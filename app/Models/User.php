<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'company_name', 'company_logo', 'mail_batch_size', 'mail_batch_delay'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'mail_batch_size'   => 'integer',
            'mail_batch_delay'  => 'integer',
        ];
    }

    public function smtpCredentials()
    {
        return $this->hasMany(SmtpCredential::class);
    }

    public function activeSmtpCredential()
    {
        return $this->hasOne(SmtpCredential::class)->where('is_active', true);
    }
}
