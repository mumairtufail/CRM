<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadPhone extends Model
{
    protected $fillable = ['lead_id', 'phone', 'type', 'is_primary'];

    protected $casts = ['is_primary' => 'boolean'];

    protected static function booted(): void
    {
        static::saving(function (LeadPhone $leadPhone) {
            $leadPhone->phone_last10 = self::last10($leadPhone->phone);
        });
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Find the lead phone matching a raw number (any formatting), via the
     * indexed last-10-digits column instead of an unindexable LIKE scan.
     */
    public static function matchNumber(?string $rawNumber): ?self
    {
        $key = self::last10($rawNumber);

        return $key ? self::where('phone_last10', $key)->first() : null;
    }

    private static function last10(?string $rawNumber): ?string
    {
        $digits = preg_replace('/[^0-9]/', '', (string) $rawNumber);

        return $digits ? substr($digits, -10) : null;
    }
}
