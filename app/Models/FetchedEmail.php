<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class FetchedEmail extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'smtp_credential_id',
        'folder',
        'message_uid',
        'message_id',
        'from_name',
        'from_email',
        'to_addresses',
        'cc_addresses',
        'subject',
        'body_html',
        'body_text',
        'is_read',
        'is_starred',
        'is_trashed',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'to_addresses' => 'array',
            'cc_addresses' => 'array',
            'is_read'      => 'boolean',
            'is_starred'   => 'boolean',
            'is_trashed'   => 'boolean',
            'sent_at'      => 'datetime',
        ];
    }

    public function credential()
    {
        return $this->belongsTo(SmtpCredential::class, 'smtp_credential_id');
    }

    public function attachments()
    {
        return $this->hasMany(EmailAttachment::class);
    }

    public function scopeInbox($query)
    {
        return $query->where('folder', 'inbox')->where('is_trashed', false);
    }

    public function scopeSent($query)
    {
        return $query->where('folder', 'sent')->where('is_trashed', false);
    }

    public function scopeStarred($query)
    {
        return $query->where('is_starred', true)->where('is_trashed', false);
    }

    public function scopeTrashed($query)
    {
        return $query->where('is_trashed', true);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
