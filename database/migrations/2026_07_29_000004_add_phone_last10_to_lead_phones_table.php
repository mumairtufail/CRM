<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lead phone lookups (Twilio call/SMS webhooks) matched numbers via a
     * REPLACE(...)-wrapped leading-wildcard LIKE, which forces a full table
     * scan on every inbound call/text. This adds an indexed column holding
     * the last 10 digits of each phone — enough to match regardless of
     * country-code/formatting differences — so lookups become exact,
     * indexed equality checks instead.
     */
    public function up(): void
    {
        Schema::table('lead_phones', function (Blueprint $table) {
            $table->string('phone_last10', 10)->nullable()->after('phone');
        });

        DB::table('lead_phones')->orderBy('id')->chunkById(500, function ($rows) {
            foreach ($rows as $row) {
                $digits = substr(preg_replace('/[^0-9]/', '', (string) $row->phone), -10);
                DB::table('lead_phones')->where('id', $row->id)->update(['phone_last10' => $digits ?: null]);
            }
        });

        Schema::table('lead_phones', function (Blueprint $table) {
            $table->index('phone_last10');
        });
    }

    public function down(): void
    {
        Schema::table('lead_phones', function (Blueprint $table) {
            $table->dropIndex(['phone_last10']);
            $table->dropColumn('phone_last10');
        });
    }
};
