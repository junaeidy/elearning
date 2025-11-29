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
    });
});
