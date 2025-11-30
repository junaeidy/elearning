<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'sender_id',
        'message',
        'message_type',
        'parent_message_id',
        'thread_count',
        'mentioned_user_ids',
        'voice_url',
        'voice_duration',
        'is_deleted',
        'deleted_by',
        'deleted_at',
    ];

    protected $casts = [
        'mentioned_user_ids' => 'array',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Accessor for backward compatibility
    public function getTypeAttribute()
    {
        return $this->message_type;
    }

    // Relationships
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class, 'message_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class, 'message_id');
    }

    public function parentMessage()
    {
        return $this->belongsTo(ChatMessage::class, 'parent_message_id');
    }

    public function replies()
    {
        return $this->hasMany(ChatMessage::class, 'parent_message_id');
    }

    public function mentionedUsers()
    {
        return $this->belongsToMany(User::class, 'mentioned_user_ids');
    }

    public function flags()
    {
        return $this->hasMany(FlaggedMessage::class, 'message_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    // Helper methods
    public function getReactionCounts()
    {
        return $this->reactions()
            ->selectRaw('reaction, COUNT(*) as count')
            ->groupBy('reaction')
            ->pluck('count', 'reaction');
    }

    public function hasUserReacted($userId, $reaction)
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->where('reaction', $reaction)
            ->exists();
    }

    public function isReadBy($userId)
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }
}
