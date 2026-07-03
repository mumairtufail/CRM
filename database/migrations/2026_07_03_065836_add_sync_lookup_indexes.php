<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Indexes for the lookups FetchEmailsJob runs on every inbound message
     * during inbox sync (reply matching, lead resolution, dedup) — these were
     * previously unindexed full/composite-mismatched scans.
     */
    public function up(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->index(['organization_id', 'message_id']);
        });

        Schema::table('lead_emails', function (Blueprint $table) {
            $table->index('email');
        });

        Schema::table('fetched_emails', function (Blueprint $table) {
            $table->index(['smtp_credential_id', 'message_id']);
            $table->index(['organization_id', 'folder', 'message_id']);
        });
    }

    public function down(): void
    {
        Schema::table('email_sends', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'message_id']);
        });

        Schema::table('lead_emails', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });

        Schema::table('fetched_emails', function (Blueprint $table) {
            $table->dropIndex(['smtp_credential_id', 'message_id']);
            $table->dropIndex(['organization_id', 'folder', 'message_id']);
        });
    }
};
