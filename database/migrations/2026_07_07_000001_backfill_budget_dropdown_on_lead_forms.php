<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const BUDGET_OPTIONS = [
        ['value' => 'under_1k',  'label' => 'Under $1,000',       'deal_value' => 500],
        ['value' => '1k_5k',     'label' => '$1,000 - $5,000',    'deal_value' => 3000],
        ['value' => '5k_25k',    'label' => '$5,000 - $25,000',   'deal_value' => 15000],
        ['value' => '25k_100k',  'label' => '$25,000 - $100,000', 'deal_value' => 62500],
        ['value' => 'over_100k', 'label' => '$100,000+',          'deal_value' => 100000],
    ];

    /**
     * Rewrites the "budget" entry embedded in every lead_forms.fields JSON
     * column so already-saved forms match the new dropdown catalog —
     * normalizeFields() only re-derives this on the next save, so without
     * this backfill old forms would keep showing budget as a number input.
     */
    public function up(): void
    {
        DB::table('lead_forms')->orderBy('id')->chunkById(100, function ($forms) {
            foreach ($forms as $form) {
                $fields = json_decode($form->fields, true) ?? [];
                $changed = false;

                foreach ($fields as &$field) {
                    if (($field['kind'] ?? null) === 'builtin' && ($field['key'] ?? null) === 'budget') {
                        $field['type'] = 'dropdown';
                        $field['options'] = self::BUDGET_OPTIONS;
                        $changed = true;
                    }
                }
                unset($field);

                if ($changed) {
                    DB::table('lead_forms')->where('id', $form->id)->update([
                        'fields' => json_encode($fields),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        DB::table('lead_forms')->orderBy('id')->chunkById(100, function ($forms) {
            foreach ($forms as $form) {
                $fields = json_decode($form->fields, true) ?? [];
                $changed = false;

                foreach ($fields as &$field) {
                    if (($field['kind'] ?? null) === 'builtin' && ($field['key'] ?? null) === 'budget') {
                        $field['type'] = 'number';
                        $field['options'] = null;
                        $changed = true;
                    }
                }
                unset($field);

                if ($changed) {
                    DB::table('lead_forms')->where('id', $form->id)->update([
                        'fields' => json_encode($fields),
                    ]);
                }
            }
        });
    }
};
