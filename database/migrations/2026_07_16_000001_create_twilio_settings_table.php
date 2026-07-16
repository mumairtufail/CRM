<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('twilio_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('account_sid');
            $table->text('auth_token'); // encrypted
            $table->string('phone_number');
            $table->string('twiml_app_sid')->nullable();
            $table->string('api_key')->nullable();
            $table->text('api_secret')->nullable(); // encrypted
            $table->boolean('is_active')->default(true);
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->unique('organization_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('twilio_settings');
    }
};
