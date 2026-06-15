<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fetched_emails', function (Blueprint $table) {
            // 'inbox' = received (INBOX), 'sent' = outgoing (Sent folder / composed in-app)
            $table->string('folder', 20)->default('inbox')->after('smtp_credential_id');
            $table->index(['organization_id', 'folder', 'is_trashed', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::table('fetched_emails', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'folder', 'is_trashed', 'sent_at']);
            $table->dropColumn('folder');
        });
    }
};
