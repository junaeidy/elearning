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
        // Banned users table
        Schema::create('banned_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('banned_by')->constrained('users')->onDelete('cascade');
            $table->string('reason')->nullable();
            $table->timestamp('banned_until')->nullable(); // null = permanent
            $table->timestamps();

            $table->unique(['lesson_id', 'user_id']);
            $table->index('banned_until');
        });

        // Muted users table
        Schema::create('muted_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('muted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('muted_until')->nullable(); // null = permanent
            $table->timestamps();

            $table->unique(['lesson_id', 'user_id']);
            $table->index('muted_until');
        });

        // Flagged messages table
        Schema::create('flagged_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('chat_messages')->onDelete('cascade');
            $table->foreignId('flagged_by')->constrained('users')->onDelete('cascade');
            $table->string('reason');
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flagged_messages');
        Schema::dropIfExists('muted_users');
        Schema::dropIfExists('banned_users');
    }
};
