<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Map of outreach channel => ISO timestamp the lead was contacted on it.
            // e.g. { "mail": "2026-06-15T10:00:00+00:00", "linkedin": "..." }
            $table->json('contact_channels')->nullable()->after('social_handles');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn('contact_channels');
        });
    }
};
