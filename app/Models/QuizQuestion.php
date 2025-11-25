<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type',
        'points',
        'order_index',
    ];

    protected $casts = [
        'points' => 'integer',
        'order_index' => 'integer',
    ];

    // Relationships
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options()
    {
        return $this->hasMany(QuizQuestionOption::class, 'question_id');
    }
}
