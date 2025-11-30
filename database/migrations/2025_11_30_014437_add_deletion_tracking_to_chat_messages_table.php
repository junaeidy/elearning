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
            $table->boolean('is_deleted')->default(false)->after('voice_duration');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null')->after('is_deleted');
            $table->timestamp('deleted_at')->nullable()->after('deleted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn(['is_deleted', 'deleted_by', 'deleted_at']);
        });
    }
};
