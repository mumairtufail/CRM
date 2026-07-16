<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('twilio_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('sid')->nullable()->unique(); // Twilio Call SID (nullable for simulated/failed logs)
            $table->string('from_number');
            $table->string('to_number');
            $table->string('direction'); // inbound | outbound
            $table->string('status'); // queued | ringing | in-progress | completed | failed | busy | no-answer | canceled | voicemail
            $table->integer('duration')->nullable(); // duration in seconds
            $table->text('recording_url')->nullable();
            $table->text('voicemail_text')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('twilio_calls');
    }
};
