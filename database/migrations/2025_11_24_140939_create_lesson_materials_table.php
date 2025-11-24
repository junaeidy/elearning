<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lesson_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('title', 200);
            $table->enum('type', ['video', 'pdf', 'image', 'audio', 'slide']);
            $table->string('file_path', 500);
            $table->bigInteger('file_size'); // in bytes
            $table->string('mime_type', 100);
            $table->integer('order_index')->default(0);
            $table->integer('duration')->nullable(); // for video/audio in seconds
            $table->timestamps();
            
            $table->index(['lesson_id', 'order_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_materials');
    }
};
