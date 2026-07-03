<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('assigned_to')->constrained('users')->nullOnDelete();
        });

        // Best-effort backfill: LeadController::store() has always defaulted
        // assigned_to to the creator at creation time, so for pre-existing,
        // never-reassigned rows assigned_to is a reasonable stand-in for "who
        // created this." This is a best-effort default, not verified
        // attribution. Guarded by whereNull so re-running is a no-op.
        DB::table('leads')
            ->whereNull('created_by')
            ->whereNotNull('assigned_to')
            ->update(['created_by' => DB::raw('assigned_to')]);
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });
    }
};
