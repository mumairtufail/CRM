<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();
        });

        Schema::create('lead_tag', function (Blueprint $table) {
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['lead_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_tag');
        Schema::dropIfExists('tags');
    }
};
