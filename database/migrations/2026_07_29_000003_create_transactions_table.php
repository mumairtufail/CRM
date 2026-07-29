<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            // Idempotent upserts (same rationale as subscriptions) are always
            // keyed on this, never a blind insert.
            $table->string('paddle_transaction_id')->unique();
            $table->string('paddle_subscription_id')->nullable();
            $table->string('status'); // completed, billed, paid, past_due, canceled, ...
            $table->string('currency_code', 3);
            $table->unsignedBigInteger('total'); // minor units (e.g. cents), raw from Paddle — formatted for display server-side
            $table->string('plan_slug')->nullable();
            $table->timestamp('billed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
