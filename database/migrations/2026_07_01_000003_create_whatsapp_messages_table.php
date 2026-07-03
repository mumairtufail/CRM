<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->string('direction');
            // inbound, outbound
            $table->string('wa_message_id')->nullable()->unique();
            $table->string('to_number')->nullable();
            $table->string('from_number')->nullable();
            $table->string('message_type')->default('text');
            // text, template, media
            $table->string('template_name')->nullable();
            $table->text('body')->nullable();
            $table->string('status')->default('queued');
            // queued, sent, delivered, read, failed
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->foreignId('sent_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
