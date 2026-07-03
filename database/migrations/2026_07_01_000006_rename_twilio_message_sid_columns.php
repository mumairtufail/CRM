<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_sends', function (Blueprint $table) {
            $table->renameColumn('twilio_message_sid', 'wa_message_id');
        });

        Schema::table('whatsapp_conversations', function (Blueprint $table) {
            $table->renameColumn('twilio_message_sid', 'wa_message_id');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_sends', function (Blueprint $table) {
            $table->renameColumn('wa_message_id', 'twilio_message_sid');
        });

        Schema::table('whatsapp_conversations', function (Blueprint $table) {
            $table->renameColumn('wa_message_id', 'twilio_message_sid');
        });
    }
};
