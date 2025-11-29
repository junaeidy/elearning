<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'subject',
        'lesson_code',
        'cover_image',
        'start_date',
        'end_date',
        'status',
        'max_students',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function materials()
    {
        return $this->hasMany(LessonMaterial::class);
    }

    public function enrollments()
    {
        return $this->hasMany(LessonEnrollment::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'lesson_enrollments', 'lesson_id', 'student_id')
                    ->withTimestamps()
                    ->withPivot('progress_percentage', 'completed_at');
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    // Helper methods
    public static function generateCode()
    {
        do {
            $code = strtoupper(\Illuminate\Support\Str::random(6));
        } while (self::where('lesson_code', $code)->exists());
        
        return $code;
    }

    public function getEnrolledCountAttribute()
    {
        return $this->enrollments()->count();
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isFull()
    {
        return $this->enrolledCount >= $this->max_students;
    }
}
