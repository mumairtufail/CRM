<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('paddle_product_id')->nullable()->after('sort_order');
            $table->string('paddle_price_id_monthly')->nullable()->after('paddle_product_id');
            $table->string('paddle_price_id_yearly')->nullable()->after('paddle_price_id_monthly');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['paddle_product_id', 'paddle_price_id_monthly', 'paddle_price_id_yearly']);
        });
    }
};
