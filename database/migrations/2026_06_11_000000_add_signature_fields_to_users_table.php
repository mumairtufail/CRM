<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_website')->nullable()->after('company_logo');
            $table->string('company_phone', 50)->nullable()->after('company_website');
            $table->string('company_email')->nullable()->after('company_phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_website', 'company_phone', 'company_email']);
        });
    }
};
