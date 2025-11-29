<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BannedUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'user_id',
        'banned_by',
        'reason',
        'banned_until',
    ];

    protected $casts = [
        'banned_until' => 'datetime',
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

    public function banner()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    // Check if ban is still active
    public function isActive()
    {
        return $this->banned_until === null || $this->banned_until->isFuture();
    }
}
