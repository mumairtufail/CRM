<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->json('custom_fields')->nullable()->after('social_handles');
            $table->foreignId('lead_form_id')->nullable()->after('organization_id')
                ->constrained('lead_forms')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lead_form_id');
            $table->dropColumn('custom_fields');
        });
    }
};
