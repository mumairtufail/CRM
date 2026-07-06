<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->timestamp('form_link_clicked_at')->nullable()->after('clicked_at');
        });

        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->unsignedInteger('form_clicks_count')->default(0)->after('clicked_count');
        });
    }

    public function down(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->dropColumn('form_link_clicked_at');
        });

        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn('form_clicks_count');
        });
    }
};
