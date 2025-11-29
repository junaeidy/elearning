<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MutedUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'user_id',
        'muted_by',
        'muted_until',
    ];

    protected $casts = [
        'muted_until' => 'datetime',
    ];

    // Relationships
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function muter()
    {
        return $this->belongsTo(User::class, 'muted_by');
    }

    // Check if mute is still active
    public function isActive()
    {
        return $this->muted_until === null || $this->muted_until->isFuture();
    }
}
