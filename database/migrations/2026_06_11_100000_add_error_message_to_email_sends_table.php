<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->string('error_message', 500)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->dropColumn('error_message');
        });
    }
};
