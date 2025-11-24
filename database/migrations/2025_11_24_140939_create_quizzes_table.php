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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->default(30);
            $table->decimal('passing_score', 5, 2)->default(70.00);
            $table->integer('max_attempts')->default(3);
            $table->boolean('is_active')->default(false);
            $table->boolean('randomize_questions')->default(true);
            $table->boolean('show_correct_answers')->default(true);
            $table->timestamps();
            
            $table->index('lesson_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
