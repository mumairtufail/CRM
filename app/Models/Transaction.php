<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'paddle_transaction_id',
        'paddle_subscription_id',
        'status',
        'currency_code',
        'total',
        'plan_slug',
        'billed_at',
    ];

    protected function casts(): array
    {
        return [
            'billed_at' => 'datetime',
            'total'     => 'integer',
        ];
    }

    /**
     * Human-readable amount (e.g. "$19.00") from the raw minor-units total —
     * formatted here, once, rather than in every view that needs to show it.
     */
    public function formattedTotal(): string
    {
        return (new \NumberFormatter('en_US', \NumberFormatter::CURRENCY))
            ->formatCurrency($this->total / 100, $this->currency_code);
    }
}
