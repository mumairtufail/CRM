<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_provider_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('provider');          // claude | openai | kimi
            $table->text('api_key');             // encrypted
            $table->string('model');
            $table->string('base_url')->nullable(); // custom endpoint override
            $table->boolean('is_active')->default(true);
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->unique('organization_id');   // one AI config per org
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_provider_settings');
    }
};
