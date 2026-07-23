<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->string('source', 20); // backend | frontend
            $table->string('message', 1000);
            $table->string('exception_class')->nullable();
            $table->string('file')->nullable();
            $table->unsignedInteger('line')->nullable();
            $table->text('trace')->nullable();
            $table->string('url')->nullable();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('causer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('causer_name')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->json('context')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['source', 'created_at']);
            $table->index('organization_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('error_logs');
    }
};
