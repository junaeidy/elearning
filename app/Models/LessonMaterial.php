<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LessonMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'type',
        'file_path',
        'file_size',
        'mime_type',
        'order_index',
        'duration',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'order_index' => 'integer',
    ];

    // Relationships
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    // Helper methods
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
