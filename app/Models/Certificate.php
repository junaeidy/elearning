<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'lesson_id',
        'certificate_number',
        'final_score',
        'file_path',
        'qr_code_path',
        'issued_at',
    ];

    protected $casts = [
        'final_score' => 'integer',
        'issued_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    // Helper methods
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    public function getQrCodeUrlAttribute()
    {
        return asset('storage/' . $this->qr_code_path);
    }
}
