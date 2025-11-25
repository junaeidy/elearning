<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LessonEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'student_id',
        'progress_percentage',
        'completed_at',
    ];

    protected $casts = [
        'progress_percentage' => 'integer',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Helper methods
    public function isCompleted()
    {
        return !is_null($this->completed_at);
    }

    public function markAsCompleted()
    {
        $this->update([
            'completed_at' => now(),
            'progress_percentage' => 100,
        ]);
    }
}
