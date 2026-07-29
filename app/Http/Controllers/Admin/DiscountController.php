<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PaddleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Paddle\SDK\Entities\Discount\DiscountType;
use Paddle\SDK\Entities\Shared\CurrencyCode;
use Paddle\SDK\Entities\Shared\CustomData;
use Paddle\SDK\Resources\Discounts\Operations\CreateDiscount;
use Paddle\SDK\Resources\Discounts\Operations\UpdateDiscount;

/**
 * No local DB table — unlike Plans, discount codes have no module-gating or
 * organization relationship to track locally, so Paddle's own API is the
 * single source of truth. Also unlike Prices, Discounts are NOT immutable —
 * update() edits one in place rather than needing to mint a replacement.
 */
class DiscountController extends Controller
{
    public function index()
    {
        $client = PaddleService::client();

        $discounts = collect(iterator_to_array($client->discounts->list()))
            ->map(fn ($d) => $this->transform($d))
            ->values();

        return Inertia::render('Admin/Discounts/Index', [
            'discounts'    => $discounts,
            'priceOptions' => $this->priceOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        PaddleService::client()->discounts->create(new CreateDiscount(
            amount: $this->normalizedAmount($validated),
            description: $validated['description'],
            type: $validated['type'] === 'percentage' ? DiscountType::Percentage() : DiscountType::Flat(),
            enabledForCheckout: true,
            recur: $validated['recur'],
            currencyCode: CurrencyCode::USD(),
            code: $validated['code'],
            maximumRecurringIntervals: $validated['recur'] ? ($validated['maximum_recurring_intervals'] ?: null) : null,
            usageLimit: $validated['usage_limit'] ?: null,
            restrictTo: !empty($validated['restrict_to']) ? $validated['restrict_to'] : null,
            expiresAt: $validated['expires_at'] ? "{$validated['expires_at']}T23:59:59Z" : null,
            customData: new CustomData(['created_via' => 'admin_panel']),
        ));

        return back()->with('success', 'Discount code created.');
    }

    public function update(Request $request, string $discount): RedirectResponse
    {
        $validated = $this->validated($request, $discount);

        PaddleService::client()->discounts->update($discount, new UpdateDiscount(
            amount: $this->normalizedAmount($validated),
            description: $validated['description'],
            type: $validated['type'] === 'percentage' ? DiscountType::Percentage() : DiscountType::Flat(),
            recur: $validated['recur'],
            code: $validated['code'],
            maximumRecurringIntervals: $validated['recur'] ? ($validated['maximum_recurring_intervals'] ?: null) : null,
            usageLimit: $validated['usage_limit'] ?: null,
            restrictTo: !empty($validated['restrict_to']) ? $validated['restrict_to'] : null,
            expiresAt: $validated['expires_at'] ? "{$validated['expires_at']}T23:59:59Z" : null,
        ));

        return back()->with('success', 'Discount code updated.');
    }

    /**
     * Archived, never deleted — Paddle has no delete endpoint for discounts;
     * an archived code simply stops being redeemable.
     */
    public function destroy(string $discount): RedirectResponse
    {
        PaddleService::client()->discounts->archive($discount);

        return back()->with('success', 'Discount code archived.');
    }

    private function validated(Request $request, ?string $discountId = null): array
    {
        return $request->validate([
            'description'                => 'required|string|max:255',
            'code'                       => [
                'required', 'string', 'max:32', 'alpha_dash',
                // Paddle enforces code uniqueness itself; this is just a
                // friendlier client-side-ish message than a raw API error.
            ],
            'type'                       => ['required', Rule::in(['percentage', 'flat'])],
            'amount'                     => 'required|numeric|min:0.01',
            'recur'                      => 'boolean',
            'maximum_recurring_intervals' => 'nullable|integer|min:1',
            'usage_limit'                => 'nullable|integer|min:1',
            'restrict_to'                => 'nullable|array',
            'restrict_to.*'              => 'string',
            'expires_at'                 => 'nullable|date',
        ]);
    }

    /**
     * Paddle wants a percentage as a plain number string ("25" for 25%), and
     * a flat amount in minor units ("1900" for $19.00) — same minor-units
     * convention used for Prices elsewhere in this app.
     */
    private function normalizedAmount(array $validated): string
    {
        if ($validated['type'] === 'percentage') {
            return (string) (int) round($validated['amount']);
        }

        return (string) (int) round($validated['amount'] * 100);
    }

    /**
     * Every monthly/yearly price across the real Paddle-linked plans, for the
     * "restrict this code to specific plans" picker.
     */
    private function priceOptions(): array
    {
        return Plan::whereNotNull('paddle_product_id')->orderBy('sort_order')->get()
            ->flatMap(fn (Plan $plan) => array_filter([
                $plan->paddle_price_id_monthly ? ['id' => $plan->paddle_price_id_monthly, 'label' => "{$plan->name} — Monthly"] : null,
                $plan->paddle_price_id_yearly ? ['id' => $plan->paddle_price_id_yearly, 'label' => "{$plan->name} — Yearly"] : null,
            ]))
            ->values()
            ->all();
    }

    private function transform($discount): array
    {
        return [
            'id'                          => $discount->id,
            'description'                 => $discount->description,
            'code'                        => $discount->code,
            'status'                      => $discount->status->getValue(),
            'type'                        => $discount->type->getValue(),
            'amount'                      => $discount->amount,
            'recur'                       => $discount->recur,
            'maximum_recurring_intervals' => $discount->maximumRecurringIntervals,
            'usage_limit'                 => $discount->usageLimit,
            'times_used'                  => $discount->timesUsed,
            'restrict_to'                 => $discount->restrictTo,
            'expires_at'                  => $discount->expiresAt?->format('Y-m-d'),
        ];
    }
}
