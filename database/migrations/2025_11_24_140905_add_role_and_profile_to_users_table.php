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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('id');
            $table->enum('role', ['teacher', 'student'])->default('student')->after('email');
            $table->string('full_name', 100)->after('role');
            $table->string('avatar')->nullable()->after('full_name');
            $table->boolean('is_active')->default(true)->after('avatar');
            
            // Social login fields
            $table->string('google_id')->nullable()->after('is_active');
            $table->string('facebook_id')->nullable()->after('google_id');
            $table->string('provider')->nullable()->after('facebook_id'); // google, facebook, etc
            
            // Make email & password nullable untuk social login
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'full_name', 'avatar', 'is_active', 'google_id', 'facebook_id', 'provider']);
        });
    }
};
