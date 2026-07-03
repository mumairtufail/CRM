<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_whatsapp_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('meta_app_id')->nullable();
            $table->string('meta_business_account_id')->nullable();
            $table->string('phone_number_id')->nullable();
            $table->string('display_phone_number')->nullable();
            $table->text('access_token')->nullable();
            $table->text('meta_app_secret')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->text('webhook_verify_token')->nullable();
            $table->string('status')->default('inactive');
            // inactive, active, revoked, expired
            $table->timestamp('last_verified_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_whatsapp_credentials');
    }
};
