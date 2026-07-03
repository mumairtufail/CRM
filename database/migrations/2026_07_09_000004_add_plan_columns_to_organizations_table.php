<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('owner_id')->constrained()->nullOnDelete();
            $table->enum('plan_status', ['active', 'inactive'])->default('active')->after('plan_id');
            $table->timestamp('plan_assigned_at')->nullable()->after('plan_status');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_id');
            $table->dropColumn(['plan_status', 'plan_assigned_at']);
        });
    }
};
