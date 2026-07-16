<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('twilio_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('sid')->nullable()->unique(); // Twilio Message SID
            $table->string('from_number');
            $table->string('to_number');
            $table->string('direction'); // inbound | outbound
            $table->text('body');
            $table->string('status'); // queued | sending | sent | delivered | failed | received
            $table->timestamps();

            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('twilio_messages');
    }
};
