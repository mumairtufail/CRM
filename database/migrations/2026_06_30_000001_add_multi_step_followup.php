<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->json('followup_steps')->nullable()->after('followup_delay_hours');
        });

        Schema::table('email_sends', function (Blueprint $table) {
            $table->tinyInteger('followup_step')->unsigned()->nullable()->after('parent_send_id');

            $table->index(
                ['email_campaign_id', 'lead_id', 'is_followup', 'followup_step'],
                'es_campaign_lead_followup_step'
            );
        });
    }

    public function down(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->dropIndex('es_campaign_lead_followup_step');
            $table->dropColumn('followup_step');
        });

        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn('followup_steps');
        });
    }
};
