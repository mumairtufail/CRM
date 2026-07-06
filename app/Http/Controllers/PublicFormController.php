<?php

namespace App\Http\Controllers;

use App\Models\FormSession;
use App\Models\Lead;
use App\Models\LeadForm;
use App\Models\Notification;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PublicFormController extends Controller
{
    public function show(LeadForm $form)
    {
        abort_if(! $form->is_active, 410, 'This form is no longer accepting submissions.');

        return Inertia::render('Public/DynamicForm', [
            'form' => [
                'slug'              => $form->slug,
                'name'              => $form->name,
                'description'       => $form->description,
                'fields'            => $form->fields,
                'success_message'   => $form->success_message,
                'organization_name' => $form->organization->name,
            ],
        ]);
    }

    public function store(Request $request, LeadForm $form)
    {
        abort_if(! $form->is_active, 410, 'This form is no longer accepting submissions.');

        // Scope all created records to this organization for the request — no
        // middleware sets tenant context on this unauthenticated route.
        app(TenantContext::class)->set($form->organization);

        $validated = $request->validate([
            ...$this->buildRules($form),
            'session_token' => 'nullable|string|max:64',
            'utm_source'    => 'nullable|string|max:100',
            'utm_medium'    => 'nullable|string|max:100',
            'utm_campaign'  => 'nullable|string|max:100',
        ]);
        $submitted = $validated['fields'] ?? [];
        $sessionToken = $validated['session_token'] ?? null;
        $utmSource    = $validated['utm_source'] ?? null;
        $utmMedium    = $validated['utm_medium'] ?? null;
        $utmCampaign  = $validated['utm_campaign'] ?? null;

        $leadAttributes = [
            'lead_form_id' => $form->id,
            'source'       => "form:{$form->slug}",
            'status'       => 'new',
        ];
        $customFields = [];
        $emailValue = null;
        $phoneValue = null;

        foreach ($form->fields as $field) {
            $value = $submitted[$field['key']] ?? null;
            if ($value === null || $value === '') {
                continue;
            }

            if ($field['kind'] === 'builtin') {
                match ($field['key']) {
                    'first_name' => $leadAttributes['first_name'] = $value,
                    'last_name'  => $leadAttributes['last_name']  = $value,
                    'country'    => $leadAttributes['country']    = $value,
                    'notes'      => $leadAttributes['notes']      = $value,
                    'budget'     => $this->applyBudget($leadAttributes, $customFields, $field, $value),
                    'email'      => $emailValue = $value,
                    'phone'      => $phoneValue = $value,
                    default      => null,
                };
            } else {
                $customFields[$field['key']] = $value;
            }
        }

        $lead = DB::transaction(function () use ($leadAttributes, $customFields, $emailValue, $phoneValue, $form, $sessionToken, $utmSource, $utmMedium, $utmCampaign) {
            $lead = Lead::create([
                ...$leadAttributes,
                'custom_fields' => $customFields ?: null,
            ]);

            if ($emailValue) {
                $lead->emails()->create(['email' => $emailValue, 'type' => 'work', 'is_primary' => true]);
            }

            if ($phoneValue) {
                $lead->phones()->create(['phone' => $phoneValue, 'type' => 'mobile', 'is_primary' => true]);
            }

            $form->increment('submissions_count');
            $form->forceFill(['last_submitted_at' => now()])->save();

            // Link (or create, if no autosave ever fired) the tracking session so it
            // reads as "submitted" rather than being swept up as abandoned later.
            // UTM fields are also passed here (not just from autosave) since a fast
            // fill can submit before any field ever blurs and fires an autosave —
            // without this, that session would be created with no attribution.
            if ($sessionToken) {
                $session = FormSession::firstOrCreate(
                    ['session_token' => $sessionToken, 'lead_form_id' => $form->id],
                    [
                        'status' => 'in_progress', 'started_at' => now(), 'last_active_at' => now(), 'values' => [],
                        'utm_source' => $utmSource, 'utm_medium' => $utmMedium, 'utm_campaign' => $utmCampaign,
                    ]
                );

                $session->update([
                    'status'         => 'submitted',
                    'submitted_at'   => now(),
                    'last_active_at' => now(),
                    'lead_id'        => $lead->id,
                    // Backfill attribution if autosave created the row before UTM
                    // params were captured on this end — favor keeping attribution
                    // over strict first-touch.
                    'utm_source'     => $session->utm_source ?? $utmSource,
                    'utm_medium'     => $session->utm_medium ?? $utmMedium,
                    'utm_campaign'   => $session->utm_campaign ?? $utmCampaign,
                ]);
            }

            Notification::record([
                'organization_id' => $form->organization_id,
                'type'            => 'lead.created',
                'title'           => 'New lead from your form',
                'body'            => "{$lead->full_name} submitted \"{$form->name}\"",
                'link'            => "/leads/{$lead->id}",
            ]);

            return $lead;
        });

        return back()->with('submitted', true)->with('success_message', $form->success_message);
    }

    /**
     * Lightweight autosave, fired on field blur — records that a visitor
     * started (or is still working through) this form, and what they've
     * filled in so far, so an abandoned fill can be followed up on.
     */
    public function autosave(Request $request, LeadForm $form)
    {
        abort_if(! $form->is_active, 410);

        app(TenantContext::class)->set($form->organization);

        $validated = $request->validate([
            'session_token' => 'required|string|max:64',
            'field_key'     => 'required|string|max:60',
            'value'         => 'nullable|string|max:2000',
            'utm_source'    => 'nullable|string|max:100',
            'utm_medium'    => 'nullable|string|max:100',
            'utm_campaign'  => 'nullable|string|max:100',
        ]);

        $fieldKeys = collect($form->fields)->pluck('key');
        abort_unless($fieldKeys->contains($validated['field_key']), 422, 'Unknown field.');

        // Scoped to this form's id, not just the token, so a token can't be
        // replayed against a different form to hijack another session's row.
        $session = FormSession::firstOrCreate(
            ['session_token' => $validated['session_token'], 'lead_form_id' => $form->id],
            [
                'status'         => 'in_progress',
                'started_at'     => now(),
                'last_active_at' => now(),
                'values'         => [],
                'utm_source'     => $validated['utm_source'] ?? null,
                'utm_medium'     => $validated['utm_medium'] ?? null,
                'utm_campaign'   => $validated['utm_campaign'] ?? null,
                'ip_address'     => $request->ip(),
                'user_agent'     => substr((string) $request->userAgent(), 0, 255),
            ]
        );

        $values = $session->values ?? [];
        $values[$validated['field_key']] = $validated['value'];

        $attributes = [
            'values'         => $values,
            'last_active_at' => now(),
        ];

        // A visitor who left and came back is back "in progress", not abandoned.
        if ($session->status === 'abandoned') {
            $attributes['status'] = 'in_progress';
        }

        $emailFieldKey = collect($form->fields)->firstWhere('key', 'email')['key'] ?? null;
        if ($emailFieldKey && $validated['field_key'] === $emailFieldKey && filled($validated['value'])) {
            $attributes['identifying_email'] = $validated['value'];
        }

        $session->update($attributes);

        return response()->noContent();
    }

    /**
     * Builds validation rules directly from the form's own field schema —
     * there is no fixed rule list, the stored schema is the rule list.
     */
    private function buildRules(LeadForm $form): array
    {
        $rules = [];

        foreach ($form->fields as $field) {
            $prefix = ($field['required'] ?? false) ? 'required' : 'nullable';
            $parts = [$prefix];

            switch ($field['type']) {
                case 'email':
                    $parts[] = 'email';
                    $parts[] = 'max:255';
                    break;
                case 'phone':
                    $parts[] = 'string';
                    $parts[] = 'max:50';
                    break;
                case 'number':
                    $parts[] = 'numeric';
                    break;
                case 'date':
                    $parts[] = 'date';
                    break;
                case 'dropdown':
                    $parts[] = 'string';
                    $parts[] = Rule::in($this->optionValues($field));
                    break;
                case 'textarea':
                    $parts[] = 'string';
                    $parts[] = 'max:2000';
                    break;
                case 'text':
                default:
                    $parts[] = 'string';
                    $parts[] = 'max:150';
                    break;
            }

            $rules["fields.{$field['key']}"] = $parts;
        }

        return $rules;
    }

    /**
     * A dropdown's options may be plain strings (custom fields, where the
     * option IS the value) or {value,label} pairs (the builtin budget
     * field, where the value is a range key and the label is the display
     * text) — this normalizes either shape down to just the valid values.
     */
    private function optionValues(array $field): array
    {
        return array_map(
            fn ($option) => is_array($option) ? $option['value'] : $option,
            $field['options'] ?? []
        );
    }

    /**
     * The budget dropdown's submitted value is a range key (e.g. "1k_5k"),
     * not a number — resolve it to the catalog's numeric proxy for
     * leads.deal_value, and keep the human-readable range in custom_fields
     * since deal_value alone can't tell "$1k-$5k" apart from "$3k exactly".
     */
    private function applyBudget(array &$leadAttributes, array &$customFields, array $field, string $value): void
    {
        $option = collect($field['options'] ?? [])->firstWhere('value', $value);

        if (! $option) {
            return;
        }

        $leadAttributes['deal_value'] = $option['deal_value'];
        $customFields['budget_range'] = $option['label'];
    }
}
