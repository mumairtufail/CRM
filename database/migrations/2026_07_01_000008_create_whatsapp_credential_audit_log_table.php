<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_credential_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_whatsapp_credential_id')->nullable();
            $table->foreign('platform_whatsapp_credential_id', 'wcal_credential_id_foreign')
                ->references('id')->on('platform_whatsapp_credentials')->nullOnDelete();
            $table->string('action');
            // created, updated, test_connection_success, test_connection_failed, rotated, auto_disabled_tenant
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('changes')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_credential_audit_log');
    }
};
