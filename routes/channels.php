<?php

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/*
|--------------------------------------------------------------------------
| Lesson Chat Channels
|--------------------------------------------------------------------------
|
| Here you may define all of the channel authentication routes that
| your application needs. These are used to authorize private/presence
| channels.
|
*/

// Private channel for lesson chat
Broadcast::channel('lesson.{lessonId}', function (User $user, int $lessonId) {
    $lesson = Lesson::find($lessonId);
    
    if (!$lesson) {
        return false;
    }
    
    // Allow if user is the teacher
    if ($lesson->teacher_id === $user->id) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'role' => 'teacher',
        ];
    }
    
    // Allow if user is enrolled as student
    $isEnrolled = $lesson->enrollments()
        ->where('student_id', $user->id)
        ->exists();
    
    if ($isEnrolled) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'role' => 'student',
        ];
    }
    
    return false;
});

// Presence channel for online users (optional, for future use)
Broadcast::channel('lesson-presence.{lessonId}', function (User $user, int $lessonId) {
    $lesson = Lesson::find($lessonId);
    
    if (!$lesson) {
        return false;
    }
    
    // Check if user has access to the lesson
    if ($lesson->teacher_id === $user->id || 
        $lesson->enrollments()->where('student_id', $user->id)->exists()) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'role' => $lesson->teacher_id === $user->id ? 'teacher' : 'student',
        ];
    }
    
    return false;
});

// Private channel for user notifications (mentions, etc.)
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});
