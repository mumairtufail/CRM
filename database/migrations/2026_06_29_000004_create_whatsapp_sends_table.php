<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_sends', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('to_number');
            $table->text('message_body');
            $table->string('twilio_message_sid')->nullable()->unique();
            $table->string('status')->default('pending');
            // pending, queued, sent, delivered, read, failed, undelivered
            $table->text('error_message')->nullable();
            $table->string('error_code')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->boolean('is_followup')->default(false);
            $table->foreignId('parent_send_id')->nullable()->constrained('whatsapp_sends')->nullOnDelete();
            $table->timestamps();

            $table->index(['whatsapp_campaign_id', 'status']);
            $table->index(['lead_id', 'whatsapp_campaign_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_sends');
    }
};
