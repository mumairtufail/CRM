<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lead_group_members', function (Blueprint $table) {
            $table->foreignId('lead_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->timestamp('added_at')->useCurrent();

            $table->primary(['lead_group_id', 'lead_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_group_members');
    }
};
