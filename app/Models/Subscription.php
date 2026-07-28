<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use BelongsToTenant;

    /**
     * Statuses that currently grant paid access — kept as one constant so the
     * single-subscription check (grantsAccess()) and any DB-level filtering
     * (Organization::activeSubscription()) can never drift apart.
     */
    public const ACCESS_GRANTING_STATUSES = ['active', 'trialing', 'past_due'];

    protected $fillable = [
        'organization_id',
        'paddle_subscription_id',
        'paddle_customer_id',
        'status',
        'paddle_event_occurred_at',
        'price_id',
        'product_id',
        'plan_slug',
        'scheduled_change_action',
        'scheduled_change_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_change_at'      => 'datetime',
            'paddle_event_occurred_at' => 'datetime',
        ];
    }

    /**
     * Whether this subscription currently grants paid access, independent of any
     * scheduled_change — a subscription set to cancel/pause at period end still
     * grants access right up until Paddle actually flips its status. Only a
     * `canceled` or `paused` status revokes access; `past_due` keeps a grace
     * period rather than cutting a customer off over one failed charge.
     */
    public function grantsAccess(): bool
    {
        return in_array($this->status, self::ACCESS_GRANTING_STATUSES, true);
    }
}
