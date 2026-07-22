<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('twilio_calls', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('organization_id')->constrained()->nullOnDelete();
            $table->string('recording_sid')->nullable()->after('recording_url');
        });
    }

    public function down(): void
    {
        Schema::table('twilio_calls', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('recording_sid');
        });
    }
};
