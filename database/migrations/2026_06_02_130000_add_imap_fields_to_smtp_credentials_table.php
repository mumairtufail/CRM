<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('smtp_credentials', function (Blueprint $table) {
            $table->string('imap_host')->nullable()->after('from_email');
            $table->unsignedSmallInteger('imap_port')->nullable()->default(993)->after('imap_host');
            $table->string('imap_encryption')->nullable()->default('ssl')->after('imap_port');
            $table->timestamp('last_fetched_at')->nullable()->after('imap_encryption');
        });
    }

    public function down(): void
    {
        Schema::table('smtp_credentials', function (Blueprint $table) {
            $table->dropColumn(['imap_host', 'imap_port', 'imap_encryption', 'last_fetched_at']);
        });
    }
};
