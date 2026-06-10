<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->string('recipient_mode')->default('all')->after('filters'); // all | filter | group
            $table->foreignId('group_id')->nullable()->after('recipient_mode')->constrained('lead_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn(['recipient_mode', 'group_id']);
        });
    }
};
