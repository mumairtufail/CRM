<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('causer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('causer_name')->nullable();
            $table->string('action', 100);
            $table->string('description')->nullable();
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['organization_id', 'created_at']);
            $table->index(['subject_type', 'subject_id']);
            $table->index('causer_id');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
