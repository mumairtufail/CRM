<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Admin-managed knowledge base the public chatbot answers from.
        Schema::create('chatbot_knowledge_entries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // One row per visitor chat session — each conversation recorded separately.
        Schema::create('chatbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id')->unique();
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->string('page')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chatbot_conversations')->cascadeOnDelete();
            $table->string('role', 20); // 'visitor' | 'agent'
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('chatbot_knowledge_entries');
    }
};
