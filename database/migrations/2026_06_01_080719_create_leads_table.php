<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('company')->nullable();
            $table->string('job_title')->nullable();
            $table->string('website')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->text('notes')->nullable();
            $table->string('source')->default('manual');
            $table->string('status')->default('new');
            $table->string('priority')->default('medium');
            $table->decimal('deal_value', 15, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('industry')->nullable();
            $table->string('avatar_url')->nullable();
            $table->json('social_handles')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('follow_up_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('source');
            $table->index('follow_up_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
