<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_form_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token', 64)->unique();
            $table->json('values')->nullable();
            $table->string('identifying_email')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('status')->default('in_progress');
            $table->timestamp('started_at');
            $table->timestamp('last_active_at');
            $table->timestamp('submitted_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'lead_form_id']);
            $table->index('identifying_email');
            $table->index(['status', 'last_active_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_sessions');
    }
};
