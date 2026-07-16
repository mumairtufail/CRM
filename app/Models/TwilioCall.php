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
        'sid',
        'from_number',
        'to_number',
        'direction',
        'status',
        'duration',
        'recording_url',
        'voicemail_text',
    ];

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

        // Clean the number for matching (removing + and spaces)
        $cleanNumber = preg_replace('/[^0-9]/', '', $numberToFind);

        // Search in LeadPhone
        $leadPhone = LeadPhone::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', '') LIKE ?", ["%{$cleanNumber}%"])
            ->first();

        return $leadPhone ? $leadPhone->lead : null;
    }
}
