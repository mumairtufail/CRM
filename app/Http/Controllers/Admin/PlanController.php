<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Plan;
use App\Services\PaddleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Paddle\SDK\Client;
use Paddle\SDK\Entities\Shared\CurrencyCode;
use Paddle\SDK\Entities\Shared\CustomData;
use Paddle\SDK\Entities\Shared\Interval;
use Paddle\SDK\Entities\Shared\Money;
use Paddle\SDK\Entities\Shared\PriceQuantity;
use Paddle\SDK\Entities\Shared\Status;
use Paddle\SDK\Entities\Shared\TaxCategory;
use Paddle\SDK\Entities\Shared\TimePeriod;
use Paddle\SDK\Resources\Prices\Operations\CreatePrice;
use Paddle\SDK\Resources\Products\Operations\CreateProduct;
use Paddle\SDK\Resources\Products\Operations\UpdateProduct;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with('modules:id,key,name')
            ->orderBy('sort_order')
            ->withCount('organizations')
            ->get()
            ->map(fn (Plan $plan) => $this->transform($plan));

        $modules = Module::orderBy('sort_order')->get(['id', 'key', 'name', 'description']);

        return Inertia::render('Admin/Plans/Index', [
            'plans'   => $plans,
            'modules' => $modules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $plan = Plan::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['name']),
        ]);

        $plan->modules()->sync($validated['modules']);

        $this->syncToPaddle($plan, null, null);

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $this->validated($request);

        $oldMonthly = $plan->price_monthly === null ? null : (float) $plan->price_monthly;
        $oldYearly  = $plan->price_yearly === null ? null : (float) $plan->price_yearly;

        $plan->update($validated);
        $plan->modules()->sync($validated['modules']);

        $this->syncToPaddle($plan, $oldMonthly, $oldYearly);

        return back()->with('success', 'Plan updated.');
    }

    public function toggleActive(Plan $plan): RedirectResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        if ($plan->paddle_product_id) {
            try {
                PaddleService::client()->products->update($plan->paddle_product_id, new UpdateProduct(
                    status: $plan->is_active ? Status::Active() : Status::Archived(),
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to sync Plan #{$plan->id} active status to Paddle: {$e->getMessage()}");
            }
        }

        return back()->with('success', $plan->is_active ? 'Plan activated.' : 'Plan deactivated.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->organizations()->exists()) {
            return back()->with('error', 'This plan is assigned to organizations and cannot be deleted.');
        }

        // Archived, never deleted in Paddle — a Plan row can be removed from
        // our own DB, but the Product/Price objects (and any historical
        // transactions against them) stay in Paddle permanently.
        if ($plan->paddle_product_id) {
            try {
                PaddleService::client()->products->update($plan->paddle_product_id, new UpdateProduct(
                    status: Status::Archived(),
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to archive Paddle product for Plan #{$plan->id}: {$e->getMessage()}");
            }
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted.');
    }

    /**
     * Creates (first save) or updates the Paddle product/prices behind a
     * plan. Prices are immutable in Paddle — a changed amount always mints a
     * brand-new Price under the same Product rather than editing one in
     * place; the old Price is left alone (harmless — it just stops being
     * offered for new checkouts, anyone already on it is unaffected).
     * Best-effort: a Paddle API failure logs a warning but never blocks
     * saving the plan itself.
     */
    private function syncToPaddle(Plan $plan, ?float $oldMonthly, ?float $oldYearly): void
    {
        if (!$plan->price_monthly) {
            return; // no monthly price yet — nothing sellable to sync
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
                $plan->paddle_price_id_monthly = $this->createPrice($client, $plan, $plan->price_monthly, Interval::Month());
            }

            if ($plan->price_yearly) {
                $yearlyChanged = $oldYearly === null || $oldYearly !== (float) $plan->price_yearly;
                if ($yearlyChanged || !$plan->paddle_price_id_yearly) {
                    $plan->paddle_price_id_yearly = $this->createPrice($client, $plan, $plan->price_yearly, Interval::Year());
                }
            }

            $plan->saveQuietly(); // avoid re-triggering module-cache observers for a Paddle-ID-only change
        } catch (\Throwable $e) {
            Log::warning("Failed to sync Plan #{$plan->id} to Paddle: {$e->getMessage()}");
        }
    }

    private function createPrice(Client $client, Plan $plan, float $amount, Interval $interval): string
    {
        $price = $client->prices->create(new CreatePrice(
            description: "{$plan->name} " . $interval->getValue() . 'ly',
            productId: $plan->paddle_product_id,
            unitPrice: new Money(amount: (string) (int) round($amount * 100), currencyCode: CurrencyCode::USD()),
            billingCycle: new TimePeriod(interval: $interval, frequency: 1),
            quantity: new PriceQuantity(minimum: 1, maximum: 1),
            customData: new CustomData(['plan_slug' => $plan->slug]),
        ));

        return $price->id;
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'                   => 'required|string|max:100',
            'tagline'                => 'nullable|string|max:255',
            'description'            => 'nullable|string',
            'price_monthly'          => 'nullable|numeric|min:0',
            'price_monthly_original' => 'nullable|numeric|min:0',
            'price_yearly'           => 'nullable|numeric|min:0',
            'price_yearly_original'  => 'nullable|numeric|min:0',
            'is_featured'            => 'boolean',
            'cta_text'               => 'nullable|string|max:100',
            'modules'                => 'array',
            'modules.*'              => [Rule::exists('modules', 'id')],
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $base = \Illuminate\Support\Str::slug($name) ?: 'plan';
        $slug = $base;
        $i = 1;

        while (Plan::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }

    private function transform(Plan $plan): array
    {
        return [
            'id'                     => $plan->id,
            'name'                   => $plan->name,
            'slug'                   => $plan->slug,
            'tagline'                => $plan->tagline,
            'description'            => $plan->description,
            'price_monthly'          => $plan->price_monthly,
            'price_monthly_original' => $plan->price_monthly_original,
            'price_yearly'           => $plan->price_yearly,
            'price_yearly_original'  => $plan->price_yearly_original,
            'is_active'              => $plan->is_active,
            'is_featured'            => $plan->is_featured,
            'cta_text'               => $plan->cta_text,
            'organizations_count'    => $plan->organizations_count,
            'modules'                => $plan->modules->map(fn ($m) => ['id' => $m->id, 'key' => $m->key, 'name' => $m->name]),
        ];
    }
}
