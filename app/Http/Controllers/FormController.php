<?php

namespace App\Http\Controllers;

use App\Models\LeadForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FormController extends Controller
{
    private const SLUG_REGEX = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    public function index()
    {
        $forms = LeadForm::withCount('formSessions')
            ->orderByDesc('is_default')
            ->latest()
            ->get()
            ->map(fn (LeadForm $f) => [
                'id'                => $f->id,
                'name'              => $f->name,
                'is_active'         => $f->is_active,
                'is_default'        => $f->is_default,
                'public_url'        => $f->publicUrl(),
                'visitors_count'    => $f->form_sessions_count,
                'submissions_count' => $f->submissions_count,
                'last_submitted_at' => $f->last_submitted_at?->diffForHumans(),
                'created_at'        => $f->created_at->diffForHumans(),
            ]);

        return Inertia::render('Forms/Index', [
            'forms' => $forms,
        ]);
    }

    public function create()
    {
        return Inertia::render('Forms/Create', [
            'builtinCatalog' => $this->builtinCatalogForFrontend(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            ...$this->rules(),
            'slug' => [
                'nullable', 'string', 'min:3', 'max:24',
                'regex:'.self::SLUG_REGEX,
                // Bypasses Eloquent's tenant scope — this is a raw DB query,
                // so it correctly checks across every workspace, not just ours.
                Rule::unique('lead_forms', 'slug'),
            ],
        ], [
            'slug.regex' => 'The link may only contain lowercase letters, numbers, and hyphens.',
            'slug.unique' => 'That link is already taken — try another.',
        ]);
        $fields = $this->normalizeFields($validated['fields']);

        $form = LeadForm::create([
            'name'            => $validated['name'],
            'description'     => $validated['description'] ?? null,
            'success_message' => $validated['success_message'] ?? null,
            'fields'          => $fields,
            'slug'            => $validated['slug'] ?: LeadForm::generateUniqueSlug(),
        ]);

        return redirect()->route('forms.index')
            ->with('success', "Form \"{$form->name}\" created.");
    }

    public function edit(LeadForm $form)
    {
        return Inertia::render('Forms/Edit', [
            'form' => [
                'id'              => $form->id,
                'name'            => $form->name,
                'description'     => $form->description,
                'success_message' => $form->success_message,
                'fields'          => $form->fields,
                'public_url'      => $form->publicUrl(),
            ],
            'builtinCatalog' => $this->builtinCatalogForFrontend(),
        ]);
    }

    public function update(Request $request, LeadForm $form)
    {
        $validated = $request->validate($this->rules());
        $fields = $this->normalizeFields($validated['fields']);

        $form->update([
            'name'            => $validated['name'],
            'description'     => $validated['description'] ?? null,
            'success_message' => $validated['success_message'] ?? null,
            'fields'          => $fields,
        ]);

        return redirect()->route('forms.index')
            ->with('success', "Form \"{$form->name}\" updated.");
    }

    public function toggleActive(LeadForm $form)
    {
        $form->update(['is_active' => ! $form->is_active]);

        return back()->with('success', $form->is_active ? 'Form activated.' : 'Form deactivated.');
    }

    public function destroy(LeadForm $form)
    {
        if (LeadForm::count() === 1) {
            return back()->withErrors([
                'form' => 'Every workspace needs at least one form — create another before deleting this one.',
            ]);
        }

        $form->delete();

        return redirect()->route('forms.index')
            ->with('success', "Form \"{$form->name}\" deleted.");
    }

    /**
     * Live availability check for the custom-slug field in the form builder.
     * Deliberately a raw DB lookup (not an Eloquent query) so it's never
     * accidentally narrowed by the tenant scope — availability must be
     * checked across every workspace, since the slug column is globally
     * unique.
     */
    public function checkSlug(Request $request)
    {
        $slug = (string) $request->input('slug', '');

        if ($slug === '' || ! preg_match(self::SLUG_REGEX, $slug) || strlen($slug) < 3 || strlen($slug) > 24) {
            return response()->json(['available' => false, 'reason' => 'invalid']);
        }

        $taken = DB::table('lead_forms')->where('slug', $slug)->exists();

        return response()->json(['available' => ! $taken]);
    }

    public function listForSelect()
    {
        $forms = LeadForm::where('is_active', true)
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get()
            ->map(fn (LeadForm $f) => [
                'id'         => $f->id,
                'name'       => $f->name,
                'public_url' => $f->publicUrl(),
            ]);

        return response()->json($forms);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function builtinCatalogForFrontend(): array
    {
        return collect(LeadForm::BUILTIN_CATALOG)
            ->map(fn ($def, $key) => [
                'key'             => $key,
                'label'           => $def['label'],
                'type'            => $def['type'],
                'always_required' => $def['always_required'],
                'options'         => $def['options'] ?? null,
            ])
            ->values()
            ->all();
    }

    private function rules(): array
    {
        return [
            'name'                 => 'required|string|max:150',
            'description'          => 'nullable|string|max:500',
            'success_message'      => 'nullable|string|max:300',
            'fields'               => 'required|array|min:1',
            'fields.*.key'         => 'required|string|max:60',
            'fields.*.kind'        => 'required|in:builtin,custom',
            'fields.*.type'        => 'required|in:text,number,dropdown,date,textarea,email,phone',
            'fields.*.label'       => 'required|string|max:150',
            'fields.*.required'    => 'boolean',
            'fields.*.placeholder' => 'nullable|string|max:150',
            // Shape varies: plain strings for custom dropdowns, or the builtin
            // catalog's {value,label,deal_value} objects (e.g. budget) — the
            // latter are discarded and re-derived server-side in
            // normalizeFields() regardless, so this only needs to confirm
            // "an array", not police each item's shape.
            'fields.*.options'     => 'nullable|array',
        ];
    }

    /**
     * Re-derives each field against the built-in catalog / allowed custom
     * types rather than trusting the client, so a tampered request can't
     * e.g. claim "budget" is a dropdown. Custom fields may reuse a
     * catalog key (e.g. label it "Budget") since PublicFormController
     * dispatches on `kind` first — a same-keyed custom field just lands
     * in custom_fields instead of getting the builtin's special handling.
     */
    private function normalizeFields(array $fields): array
    {
        $catalog = LeadForm::BUILTIN_CATALOG;
        $seenKeys = [];
        $hasFirstName = false;
        $normalized = [];

        foreach (array_values($fields) as $i => $field) {
            $kind = $field['kind'];
            $key = $field['key'];

            abort_if(in_array($key, $seenKeys, true), 422, "Duplicate field key \"{$key}\".");
            $seenKeys[] = $key;

            if ($kind === 'builtin') {
                abort_unless(isset($catalog[$key]), 422, "Unknown built-in field \"{$key}\".");

                if ($key === 'first_name') {
                    $hasFirstName = true;
                }

                $normalized[] = [
                    'key'         => $key,
                    'kind'        => 'builtin',
                    'type'        => $catalog[$key]['type'],
                    'label'       => $field['label'] ?: $catalog[$key]['label'],
                    'required'    => $catalog[$key]['always_required'] || (bool) ($field['required'] ?? false),
                    'placeholder' => $field['placeholder'] ?? null,
                    // Builtin options are always server-derived from the catalog, never
                    // client input — this is what stops a tampered request from e.g.
                    // inventing its own budget tiers.
                    'options'     => $catalog[$key]['options'] ?? null,
                    'order'       => $i,
                ];
            } else {
                abort_unless(in_array($field['type'], LeadForm::CUSTOM_FIELD_TYPES, true), 422, "Invalid custom field type \"{$field['type']}\".");

                $options = null;
                if ($field['type'] === 'dropdown') {
                    $options = array_values(array_filter($field['options'] ?? []));
                    abort_if(empty($options), 422, "Dropdown field \"{$field['label']}\" needs at least one option.");
                }

                $normalized[] = [
                    'key'         => $key,
                    'kind'        => 'custom',
                    'type'        => $field['type'],
                    'label'       => $field['label'],
                    'required'    => (bool) ($field['required'] ?? false),
                    'placeholder' => $field['placeholder'] ?? null,
                    'options'     => $options,
                    'order'       => $i,
                ];
            }
        }

        abort_unless($hasFirstName, 422, 'First Name is required on every form.');

        return $normalized;
    }
}
