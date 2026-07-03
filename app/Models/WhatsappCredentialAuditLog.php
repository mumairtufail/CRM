<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappCredentialAuditLog extends Model
{
    protected $table = 'whatsapp_credential_audit_log';

    protected $fillable = [
        'platform_whatsapp_credential_id',
        'action',
        'changed_by',
        'changes',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    public function changedBy()
    {
        return $this->belongsTo(Admin::class, 'changed_by');
    }
}
