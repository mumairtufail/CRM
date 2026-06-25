<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->boolean('is_followup')->default(false)->after('tracking_token');
            $table->unsignedBigInteger('parent_send_id')->nullable()->after('is_followup');
            $table->foreign('parent_send_id')->references('id')->on('email_sends')->nullOnDelete();

            // Performance indexes for follow-up candidate queries
            $table->index(['email_campaign_id', 'status', 'sent_at'], 'es_campaign_status_sent_at');
            $table->index('parent_send_id', 'es_parent_send_id');
        });
    }

    public function down(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->dropForeign(['parent_send_id']);
            $table->dropIndex('es_campaign_status_sent_at');
            $table->dropIndex('es_parent_send_id');
            $table->dropColumn(['is_followup', 'parent_send_id']);
        });
    }
};
