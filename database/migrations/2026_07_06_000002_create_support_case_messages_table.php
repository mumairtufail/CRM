<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_case_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_case_id')->constrained()->cascadeOnDelete();
            $table->string('sender_type');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index('support_case_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_case_messages');
    }
};
