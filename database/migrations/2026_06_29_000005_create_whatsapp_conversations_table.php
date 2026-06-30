<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('lead_phone');
            $table->enum('direction', ['inbound', 'outbound']);
            $table->text('message_body');
            $table->string('twilio_message_sid')->nullable();
            $table->boolean('is_bot_reply')->default(false);
            $table->boolean('is_read')->default(false);
            $table->boolean('is_qualified')->default(false);
            $table->timestamp('received_at')->nullable();
            $table->timestamps();

            $table->index(['lead_id', 'created_at']);
            $table->index(['organization_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_conversations');
    }
};
