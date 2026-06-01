<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedSmallInteger('mail_batch_size')->default(10)->after('company_logo');
            $table->unsignedSmallInteger('mail_batch_delay')->default(5)->after('mail_batch_size');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['mail_batch_size', 'mail_batch_delay']);
        });
    }
};
