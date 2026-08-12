<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Plan;
use App\Services\PaddleService;
use App\Services\PlanPaddleSync;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Paddle\SDK\Entities\Shared\Status;
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

        PlanPaddleSync::sync($plan, null, null);

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $this->validated($request);

        $oldMonthly = $plan->price_monthly === null ? null : (float) $plan->price_monthly;
        $oldYearly  = $plan->price_yearly === null ? null : (float) $plan->price_yearly;

        $plan->update($validated);
        $plan->modules()->sync($validated['modules']);

        PlanPaddleSync::sync($plan, $oldMonthly, $oldYearly);

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
            'lead_limit'             => 'nullable|integer|min:0',
            'user_limit'             => 'nullable|integer|min:0',
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
            'lead_limit'             => $plan->lead_limit,
            'user_limit'             => $plan->user_limit,
            'organizations_count'    => $plan->organizations_count,
            'modules'                => $plan->modules->map(fn ($m) => ['id' => $m->id, 'key' => $m->key, 'name' => $m->name]),
        ];
    }
}
