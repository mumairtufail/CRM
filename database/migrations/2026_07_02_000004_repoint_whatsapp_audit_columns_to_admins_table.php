<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * These "who did this" audit columns were added when the platform superadmin was
 * still just a `users` row. Now that superadmins live in their own `admins` table
 * (see the admin guard split), the FK targets must follow them there.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_whatsapp_credentials', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->foreign('created_by')->references('id')->on('admins')->nullOnDelete();
        });

        Schema::table('tenant_whatsapp_settings', function (Blueprint $table) {
            $table->dropForeign(['enabled_by']);
            $table->foreign('enabled_by')->references('id')->on('admins')->nullOnDelete();
        });

        Schema::table('whatsapp_unassigned_inbound', function (Blueprint $table) {
            $table->dropForeign(['assigned_by']);
            $table->foreign('assigned_by')->references('id')->on('admins')->nullOnDelete();
        });

        Schema::table('whatsapp_credential_audit_log', function (Blueprint $table) {
            $table->dropForeign(['changed_by']);
            $table->foreign('changed_by')->references('id')->on('admins')->nullOnDelete();
        });

        Schema::table('whatsapp_templates', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->foreign('created_by')->references('id')->on('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('platform_whatsapp_credentials', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('tenant_whatsapp_settings', function (Blueprint $table) {
            $table->dropForeign(['enabled_by']);
            $table->foreign('enabled_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('whatsapp_unassigned_inbound', function (Blueprint $table) {
            $table->dropForeign(['assigned_by']);
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('whatsapp_credential_audit_log', function (Blueprint $table) {
            $table->dropForeign(['changed_by']);
            $table->foreign('changed_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('whatsapp_templates', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }
};
