<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    /**
     * Determine whether the user can view any lessons.
     */
    public function viewAny(User $user): bool
    {
        return $user->isTeacher();
    }

    /**
     * Determine whether the user can view the lesson.
     */
    public function view(User $user, Lesson $lesson): bool
    {
        // Teacher can view their own lessons
        if ($user->isTeacher() && $user->id === $lesson->teacher_id) {
            return true;
        }
        
        // Student can view if enrolled
        if ($user->isStudent()) {
            return $lesson->enrollments()
                ->where('student_id', $user->id)
                ->exists();
        }
        
        return false;
    }

    /**
     * Determine whether the user can create lessons.
     */
    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    /**
     * Determine whether the user can update the lesson.
     */
    public function update(User $user, Lesson $lesson): bool
    {
        return $user->isTeacher() && $user->id === $lesson->teacher_id;
    }

    /**
     * Determine whether the user can delete the lesson.
     */
    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->isTeacher() && $user->id === $lesson->teacher_id;
    }
}
