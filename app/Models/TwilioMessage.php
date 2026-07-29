<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TwilioMessage extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'sid',
        'from_number',
        'to_number',
        'direction',
        'body',
        'status',
    ];

    /**
     * Get the lead associated with this message based on the phone number.
     */
    public function lead(): ?Lead
    {
        $numberToFind = $this->direction === 'inbound' ? $this->from_number : $this->to_number;
        if (empty($numberToFind)) {
            return null;
        }

        $leadPhone = LeadPhone::matchNumber($numberToFind);

        return $leadPhone ? $leadPhone->lead : null;
    }
}
