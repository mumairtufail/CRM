<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // The webhook envelope's `occurred_at`, not `updated_at` (which is
            // when WE last wrote the row) — lets a late-arriving but genuinely
            // older event be detected and skipped instead of clobbering newer
            // state, since Paddle deliveries are at-least-once and can race.
            $table->timestamp('paddle_event_occurred_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('paddle_event_occurred_at');
        });
    }
};
