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
        Schema::table('chat_messages', function (Blueprint $table) {
            // Threading support
            $table->foreignId('parent_message_id')->nullable()->constrained('chat_messages')->onDelete('cascade');
            $table->integer('thread_count')->default(0); // Number of replies
            
            // Mentions support
            $table->json('mentioned_user_ids')->nullable(); // Array of user IDs mentioned
            
            // Search optimization
            $table->index('created_at');
            $table->index('parent_message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['parent_message_id']);
            $table->dropColumn(['parent_message_id', 'thread_count', 'mentioned_user_ids']);
        });
    }
};
