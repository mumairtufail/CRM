<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->boolean('followup_enabled')->default(false)->after('sent_at');
            $table->string('followup_subject')->nullable()->after('followup_enabled');
            $table->longText('followup_body_html')->nullable()->after('followup_subject');
            $table->unsignedSmallInteger('followup_delay_hours')->default(48)->after('followup_body_html');
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn(['followup_enabled', 'followup_subject', 'followup_body_html', 'followup_delay_hours']);
        });
    }
};
