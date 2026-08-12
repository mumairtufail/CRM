<?php

namespace App\Services;

use App\Models\Plan;
use Illuminate\Support\Facades\Log;
use Paddle\SDK\Client;
use Paddle\SDK\Entities\Shared\CurrencyCode;
use Paddle\SDK\Entities\Shared\CustomData;
use Paddle\SDK\Entities\Shared\Interval;
use Paddle\SDK\Entities\Shared\Money;
use Paddle\SDK\Entities\Shared\PriceQuantity;
use Paddle\SDK\Entities\Shared\TaxCategory;
use Paddle\SDK\Entities\Shared\TimePeriod;
use Paddle\SDK\Resources\Prices\Operations\CreatePrice;
use Paddle\SDK\Resources\Products\Operations\CreateProduct;
use Paddle\SDK\Resources\Products\Operations\UpdateProduct;

class PlanPaddleSync
{
    /**
     * Creates (first save) or updates the Paddle product/prices behind a
     * plan. Prices are immutable in Paddle — a changed amount always mints a
     * brand-new Price under the same Product rather than editing one in
     * place; the old Price is left alone (harmless — it just stops being
     * offered for new checkouts, anyone already on it is unaffected).
     * Best-effort: a Paddle API failure logs a warning but never blocks
     * saving the plan itself.
     *
     * Shared by Admin\PlanController (editing a plan in the UI) and
     * PlanSeeder (deploying new default prices from a fresh checkout), so
     * both paths keep price_monthly/price_yearly and the Paddle price IDs
     * in sync instead of one silently drifting from the other.
     */
    public static function sync(Plan $plan, ?float $oldMonthly, ?float $oldYearly): void
    {
        // price_monthly is a decimal:2 cast, so it's the string "0.00" for a
        // free plan — PHP only treats the literal string "0" as falsy, so a
        // plain !$plan->price_monthly check would miss this and try to mint
        // a real $0 Paddle product/price.
        if ((float) $plan->price_monthly <= 0) {
            return; // free plan — nothing sellable to sync
        }

        try {
            $client = PaddleService::client();

            if (!$plan->paddle_product_id) {
                $product = $client->products->create(new CreateProduct(
                    name: $plan->name,
                    taxCategory: TaxCategory::Standard(),
                    description: $plan->tagline,
                    customData: new CustomData(['plan_slug' => $plan->slug]),
                ));
                $plan->paddle_product_id = $product->id;
            } elseif ($plan->wasChanged('name') || $plan->wasChanged('tagline')) {
                $client->products->update($plan->paddle_product_id, new UpdateProduct(
                    name: $plan->name,
                    description: $plan->tagline,
                ));
            }

            $monthlyChanged = $oldMonthly === null || $oldMonthly !== (float) $plan->price_monthly;
            if ($monthlyChanged || !$plan->paddle_price_id_monthly) {
                $plan->paddle_price_id_monthly = self::createPrice($client, $plan, (float) $plan->price_monthly, Interval::Month());
            }

            if ($plan->price_yearly) {
                $yearlyChanged = $oldYearly === null || $oldYearly !== (float) $plan->price_yearly;
                if ($yearlyChanged || !$plan->paddle_price_id_yearly) {
                    $plan->paddle_price_id_yearly = self::createPrice($client, $plan, (float) $plan->price_yearly, Interval::Year());
                }
            }

            $plan->saveQuietly(); // avoid re-triggering module-cache observers for a Paddle-ID-only change
        } catch (\Throwable $e) {
            Log::warning("Failed to sync Plan #{$plan->id} to Paddle: {$e->getMessage()}");
        }
    }

    private static function createPrice(Client $client, Plan $plan, float $amount, Interval $interval): string
    {
        $price = $client->prices->create(new CreatePrice(
            description: "{$plan->name} ".$interval->getValue().'ly',
            productId: $plan->paddle_product_id,
            unitPrice: new Money(amount: (string) (int) round($amount * 100), currencyCode: CurrencyCode::USD()),
            billingCycle: new TimePeriod(interval: $interval, frequency: 1),
            quantity: new PriceQuantity(minimum: 1, maximum: 1),
            customData: new CustomData(['plan_slug' => $plan->slug]),
        ));

        return $price->id;
    }
}
