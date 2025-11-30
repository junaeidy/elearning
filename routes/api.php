<?php

use App\Http\Controllers\Api\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Chat API routes - using web auth (session) instead of sanctum
Route::middleware(['auth'])->group(function () {
    Route::prefix('lessons/{lesson}')->group(function () {
        // Get messages
        Route::get('messages', [ChatController::class, 'index']);
        
        // Send message
        Route::post('messages', [ChatController::class, 'store']);
        
        // Delete message
        Route::delete('messages/{message}', [ChatController::class, 'destroy']);
        
        // Typing indicator
        Route::post('typing', [ChatController::class, 'typing']);
        
        // Raise hand
        Route::post('raise-hand', [ChatController::class, 'raiseHand']);
        
        // Online users
        Route::get('online-users', [ChatController::class, 'onlineUsers']);

        // Message reactions
        Route::post('messages/{message}/react', [ChatController::class, 'toggleReaction']);

        // Read receipts
        Route::post('messages/mark-read', [ChatController::class, 'markAsRead']);

        // Message search
        Route::get('messages/search', [ChatController::class, 'search']);

        // Threading - get replies
        Route::get('messages/{message}/replies', [ChatController::class, 'getReplies']);

        // Get users for mentions
        Route::get('users', [ChatController::class, 'getUsers']);

        // Moderation - Ban/Mute
        Route::post('ban-user', [ChatController::class, 'banUser']);
        Route::post('unban-user', [ChatController::class, 'unbanUser']);
        Route::post('mute-user', [ChatController::class, 'muteUser']);
        Route::post('unmute-user', [ChatController::class, 'unmuteUser']);

        // Moderation - Flagging
        Route::post('messages/{message}/flag', [ChatController::class, 'flagMessage']);
        Route::get('flagged-messages', [ChatController::class, 'getFlaggedMessages']);
        Route::post('flagged-messages/{flag}/review', [ChatController::class, 'reviewFlag']);

        // Material completion
        Route::post('materials/{material}/toggle-completion', [\App\Http\Controllers\Api\MaterialCompletionController::class, 'toggle']);
    });
});
