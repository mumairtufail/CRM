<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Seeds a default LeadForm per existing organization, mirroring the fields the
     * old hardcoded PublicLeadController/intake form used to collect, so no org
     * loses its public capture capability when that system is replaced by the new
     * multi-form builder. Idempotent (skips orgs that already have a default form).
     */
    public function up(): void
    {
        $builtinFields = [
            ['key' => 'first_name', 'kind' => 'builtin', 'type' => 'text',     'label' => 'First Name', 'required' => true,  'placeholder' => null, 'options' => null, 'order' => 0],
            ['key' => 'last_name',  'kind' => 'builtin', 'type' => 'text',     'label' => 'Last Name',  'required' => false, 'placeholder' => null, 'options' => null, 'order' => 1],
            ['key' => 'email',      'kind' => 'builtin', 'type' => 'email',    'label' => 'Email',      'required' => true,  'placeholder' => null, 'options' => null, 'order' => 2],
            ['key' => 'phone',      'kind' => 'builtin', 'type' => 'phone',    'label' => 'Phone',      'required' => false, 'placeholder' => null, 'options' => null, 'order' => 3],
            ['key' => 'country',    'kind' => 'builtin', 'type' => 'text',     'label' => 'Country',    'required' => false, 'placeholder' => null, 'options' => null, 'order' => 4],
            ['key' => 'notes',      'kind' => 'builtin', 'type' => 'textarea', 'label' => 'Notes',      'required' => false, 'placeholder' => null, 'options' => null, 'order' => 5],
            ['key' => 'budget',     'kind' => 'builtin', 'type' => 'number',   'label' => 'Budget',     'required' => false, 'placeholder' => null, 'options' => null, 'order' => 6],
        ];

        $organizations = DB::table('organizations')->get();

        foreach ($organizations as $organization) {
            if (DB::table('lead_forms')->where('organization_id', $organization->id)->where('is_default', true)->exists()) {
                continue;
            }

            do {
                $slug = Str::lower(Str::random(8));
            } while (DB::table('lead_forms')->where('slug', $slug)->exists());

            DB::table('lead_forms')->insert([
                'organization_id' => $organization->id,
                'name'            => 'Website Contact Form',
                'slug'            => $slug,
                'fields'          => json_encode($builtinFields),
                'is_active'       => true,
                'is_default'      => true,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }

    public function down(): void
    {
        // No-op: reversing this would delete organizations' only form and orphan
        // any leads.lead_form_id rows created against it in the meantime.
    }
};
