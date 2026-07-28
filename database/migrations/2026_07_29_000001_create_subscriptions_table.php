<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            // The Paddle IDs — upserts from webhook events are always keyed on these,
            // never blind-inserted, since deliveries are at-least-once and can arrive
            // out of order.
            $table->string('paddle_subscription_id')->unique();
            $table->string('paddle_customer_id');
            $table->string('status'); // raw Paddle status: active, trialing, past_due, paused, canceled
            $table->string('price_id');
            $table->string('product_id');
            $table->string('plan_slug')->nullable(); // from custom_data at checkout — see PADDLE_PLAN_SLUG_MAP
            $table->string('scheduled_change_action')->nullable(); // cancel | pause | resume
            $table->timestamp('scheduled_change_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
