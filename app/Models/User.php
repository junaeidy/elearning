<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'full_name',
        'email',
        'password',
        'role',
        'avatar',
        'is_active',
        'google_id',
        'facebook_id',
        'provider',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function teacherLessons()
    {
        return $this->hasMany(Lesson::class, 'teacher_id');
    }

    public function enrolledLessons()
    {
        return $this->belongsToMany(Lesson::class, 'lesson_enrollments', 'student_id', 'lesson_id')
                    ->withTimestamps()
                    ->withPivot('progress_percentage', 'completed_at');
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class, 'student_id');
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withTimestamps()
                    ->withPivot('lesson_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function lessonEnrollments()
    {
        return $this->hasMany(LessonEnrollment::class, 'student_id');
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'student_id');
    }

    public function materialCompletions()
    {
        return $this->hasMany(MaterialCompletion::class, 'student_id');
    }

    // Helper methods
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            // Check if avatar is already a full URL (from social login)
            if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
                return $this->avatar;
            }
            // Otherwise, it's a local storage path
            return asset('storage/' . $this->avatar);
        }
        
        // Default avatar with initial
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->full_name) . '&background=FF6B6B&color=fff&size=200';
    }

    // Check if user registered via social login
    public function isSocialLogin(): bool
    {
        return !empty($this->provider);
    }
}
