<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_unassigned_inbound', function (Blueprint $table) {
            $table->id();
            $table->string('wa_message_id')->unique();
            $table->string('from_number');
            $table->text('body')->nullable();
            $table->string('message_type')->default('text');
            $table->json('raw_payload')->nullable();
            $table->json('matched_organization_ids')->nullable();
            $table->string('status')->default('pending');
            // pending, assigned, ignored
            $table->foreignId('assigned_organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('assigned_lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_unassigned_inbound');
    }
};
