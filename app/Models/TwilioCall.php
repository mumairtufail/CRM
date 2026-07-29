<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwilioCall extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'user_id',
        'sid',
        'from_number',
        'to_number',
        'direction',
        'status',
        'duration',
        'recording_url',
        'recording_sid',
        'voicemail_text',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the lead associated with this call based on the phone number.
     * We try to match either from_number or to_number against the lead's phones.
     */
    public function lead(): ?Lead
    {
        $numberToFind = $this->direction === 'inbound' ? $this->from_number : $this->to_number;
        if (empty($numberToFind)) {
            return null;
        }

        // Search in LeadPhone
        $leadPhone = LeadPhone::matchNumber($numberToFind);

        return $leadPhone ? $leadPhone->lead : null;
    }
}
