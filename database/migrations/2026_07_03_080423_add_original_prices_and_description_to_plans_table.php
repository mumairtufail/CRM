<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->text('description')->nullable()->after('tagline');
            $table->decimal('price_monthly_original', 10, 2)->nullable()->after('price_monthly');
            $table->decimal('price_yearly_original', 10, 2)->nullable()->after('price_yearly');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['description', 'price_monthly_original', 'price_yearly_original']);
        });
    }
};
