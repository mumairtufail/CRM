<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

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

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $this->validated($request);

        $plan->update($validated);
        $plan->modules()->sync($validated['modules']);

        return back()->with('success', 'Plan updated.');
    }

    public function toggleActive(Plan $plan): RedirectResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        return back()->with('success', $plan->is_active ? 'Plan activated.' : 'Plan deactivated.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->organizations()->exists()) {
            return back()->with('error', 'This plan is assigned to organizations and cannot be deleted.');
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'          => 'required|string|max:100',
            'tagline'       => 'nullable|string|max:255',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_yearly'  => 'nullable|numeric|min:0',
            'is_featured'   => 'boolean',
            'cta_text'      => 'nullable|string|max:100',
            'modules'       => 'array',
            'modules.*'     => [Rule::exists('modules', 'id')],
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
            'id'                => $plan->id,
            'name'              => $plan->name,
            'slug'              => $plan->slug,
            'tagline'           => $plan->tagline,
            'price_monthly'     => $plan->price_monthly,
            'price_yearly'      => $plan->price_yearly,
            'is_active'         => $plan->is_active,
            'is_featured'       => $plan->is_featured,
            'cta_text'          => $plan->cta_text,
            'organizations_count' => $plan->organizations_count,
            'modules'           => $plan->modules->map(fn ($m) => ['id' => $m->id, 'key' => $m->key, 'name' => $m->name]),
        ];
    }
}
