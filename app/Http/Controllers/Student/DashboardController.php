<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get enrolled lessons with teacher info and progress
        $enrolledLessons = $user->enrolledLessons()
            ->with(['teacher:id,full_name,avatar'])
            ->withPivot('progress_percentage', 'completed_at')
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
                    'subject' => $lesson->subject,
                    'cover_image' => $lesson->cover_image ? asset('storage/' . $lesson->cover_image) : null,
                    'teacher' => [
                        'name' => $lesson->teacher->full_name,
                        'avatar' => $lesson->teacher->avatar_url,
                    ],
                    'progress' => $lesson->pivot->progress_percentage ?? 0,
                    'completed' => !is_null($lesson->pivot->completed_at),
                    'completed_at' => $lesson->pivot->completed_at?->format('M d, Y'),
                ];
            });

        // Get recent achievements
        $recentAchievements = $user->achievements()
            ->withPivot('lesson_id', 'created_at')
            ->latest('user_achievements.created_at')
            ->take(5)
            ->get()
            ->map(function ($achievement) {
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'badge_color' => $achievement->badge_color,
                    'earned_at' => $achievement->pivot->created_at->format('M d, Y'),
                ];
            });

        // Calculate stats
        $stats = [
            'total_enrolled' => $enrolledLessons->count(),
            'completed_lessons' => $enrolledLessons->where('completed', true)->count(),
            'in_progress' => $enrolledLessons->where('completed', false)->count(),
            'total_achievements' => $user->achievements()->count(),
        ];

        return Inertia::render('Student/Dashboard', [
            'enrolledLessons' => $enrolledLessons,
            'recentAchievements' => $recentAchievements,
            'stats' => $stats,
        ]);
    }
}
