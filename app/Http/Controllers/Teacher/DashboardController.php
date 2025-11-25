<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Calculate statistics
        $totalLessons = $user->teacherLessons()->count();
        $activeLessons = $user->teacherLessons()->where('status', 'active')->count();
        
        // Count total students enrolled in all teacher's lessons
        $totalStudents = $user->teacherLessons()
            ->withCount('enrollments')
            ->get()
            ->sum('enrollments_count');
        
        // Count total quizzes across all lessons
        $totalQuizzes = Quiz::whereIn('lesson_id', $user->teacherLessons()->pluck('id'))->count();

        $stats = [
            'total_lessons' => $totalLessons,
            'active_lessons' => $activeLessons,
            'total_students' => $totalStudents,
            'total_quizzes' => $totalQuizzes,
        ];

        // Get recent lessons with enrollment count
        $recentLessons = $user->teacherLessons()
            ->withCount('enrollments')
            ->with(['enrollments' => function ($query) {
                $query->with('student:id,full_name,avatar')
                    ->latest()
                    ->take(5);
            }])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'subject' => $lesson->subject,
                    'lesson_code' => $lesson->lesson_code,
                    'status' => $lesson->status,
                    'enrollments_count' => $lesson->enrollments_count,
                    'max_students' => $lesson->max_students,
                    'created_at' => $lesson->created_at->format('M d, Y'),
                    'students' => $lesson->enrollments->map(function ($enrollment) {
                        return [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->full_name,
                            'avatar' => $enrollment->student->avatar_url,
                        ];
                    }),
                ];
            });

        return Inertia::render('Teacher/Dashboard', [
            'stats' => $stats,
            'recentLessons' => $recentLessons,
        ]);
    }
}
