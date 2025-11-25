<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuizQuestionOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'option_text',
        'is_correct',
        'order_index',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'order_index' => 'integer',
    ];

    // Relationships
    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
