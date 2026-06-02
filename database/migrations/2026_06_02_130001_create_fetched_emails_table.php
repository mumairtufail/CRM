<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fetched_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('smtp_credential_id')->constrained()->cascadeOnDelete();
            $table->string('message_uid')->nullable();
            $table->string('message_id', 512)->nullable();
            $table->string('from_name')->nullable();
            $table->string('from_email');
            $table->json('to_addresses')->nullable();
            $table->json('cc_addresses')->nullable();
            $table->string('subject')->nullable();
            $table->longText('body_html')->nullable();
            $table->longText('body_text')->nullable();
            $table->boolean('is_read')->default(false);
            $table->boolean('is_starred')->default(false);
            $table->boolean('is_trashed')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->unique(['smtp_credential_id', 'message_uid']);
            $table->index(['organization_id', 'is_trashed', 'sent_at']);
            $table->index(['organization_id', 'is_starred']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fetched_emails');
    }
};
