<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonController extends Controller
{
    /**
     * Display a listing of enrolled lessons.
     */
    public function index()
    {
        $enrolledLessons = auth()->user()->enrolledLessons()
            ->with(['teacher:id,name,avatar', 'materials', 'quizzes'])
            ->withCount('materials', 'quizzes')
            ->get()
            ->map(function ($lesson) {
                $teacher = $lesson->teacher;
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
                    'subject' => $lesson->subject,
                    'cover_image' => $lesson->cover_image,
                    'teacher' => $teacher ? [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'avatar' => $teacher->avatar,
                        'avatar_url' => $teacher->avatar_url,
                    ] : null,
                    'materials_count' => $lesson->materials_count,
                    'quizzes_count' => $lesson->quizzes_count,
                    'progress_percentage' => $lesson->pivot->progress_percentage ?? 0,
                    'completed_at' => $lesson->pivot->completed_at,
                    'enrolled_at' => $lesson->pivot->created_at,
                ];
            });

        return Inertia::render('Student/Lessons/Index', [
            'lessons' => $enrolledLessons,
        ]);
    }

    /**
     * Show the form for joining a lesson.
     */
    public function showJoinForm()
    {
        return Inertia::render('Student/Lessons/Join');
    }

    /**
     * Join a lesson using lesson code.
     */
    public function join(Request $request)
    {
        $request->validate([
            'lesson_code' => 'required|string|exists:lessons,lesson_code',
        ]);

        $lesson = Lesson::where('lesson_code', $request->lesson_code)->first();

        // Check if lesson exists
        if (!$lesson) {
            return back()->with('error', 'Kode kelas tidak ditemukan!');
        }

        // Check if lesson is active
        if ($lesson->status !== 'active') {
            return back()->with('error', 'Kelas ini belum aktif!');
        }

        // Check if already enrolled
        $alreadyEnrolled = auth()->user()->enrolledLessons()
            ->where('lesson_id', $lesson->id)
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()->route('student.lessons.show', $lesson)
                ->with('info', 'Anda sudah terdaftar di kelas ini!');
        }

        // Check max students limit
        $currentEnrollments = $lesson->enrollments()->count();
        if ($lesson->max_students && $currentEnrollments >= $lesson->max_students) {
            return back()->with('error', 'Kelas ini sudah penuh! Batas maksimal siswa telah tercapai.');
        }

        // Create enrollment
        LessonEnrollment::create([
            'lesson_id' => $lesson->id,
            'student_id' => auth()->id(),
            'progress_percentage' => 0,
        ]);

        return redirect()->route('student.lessons.show', $lesson)
            ->with('success', '🎉 Successfully joined the lesson!');
    }

    /**
     * Display the specified lesson.
     */
    public function show(Lesson $lesson)
    {
        // Check if student is enrolled
        $enrollment = auth()->user()->enrolledLessons()
            ->where('lesson_id', $lesson->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.lessons.join')
                ->with('error', 'Anda harus mendaftar di kelas ini terlebih dahulu!');
        }

        // Load lesson with relationships
        $lesson->load([
            'teacher:id,name,avatar,email',
            'materials' => function ($query) {
                $query->orderBy('created_at');
            },
            'quizzes',
            'enrollments' => function ($query) {
                $query->with('student:id,name,avatar');
            },
        ]);

        // Get student's quiz attempts for this lesson
        $quizAttempts = auth()->user()->quizAttempts()
            ->whereIn('quiz_id', $lesson->quizzes->pluck('id'))
            ->with('quiz:id,title,passing_score')
            ->get();

        // Calculate progress
        $totalMaterials = $lesson->materials->count();
        $totalQuizzes = $lesson->quizzes->count();
        
        return Inertia::render('Student/Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'subject' => $lesson->subject,
                'lesson_code' => $lesson->lesson_code,
                'cover_image' => $lesson->cover_image,
                'start_date' => $lesson->start_date,
                'end_date' => $lesson->end_date,
                'teacher' => [
                    'id' => $lesson->teacher->id,
                    'name' => $lesson->teacher->name,
                    'avatar' => $lesson->teacher->avatar,
                    'avatar_url' => $lesson->teacher->avatar_url,
                    'email' => $lesson->teacher->email,
                ],
                'materials' => $lesson->materials,
                'quizzes' => $lesson->quizzes->map(function ($quiz) use ($quizAttempts) {
                    $attempts = $quizAttempts->where('quiz_id', $quiz->id);
                    $bestAttempt = $attempts->sortByDesc('score')->first();
                    
                    return [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                        'description' => $quiz->description,
                        'duration_minutes' => $quiz->duration_minutes,
                        'passing_score' => $quiz->passing_score,
                        'max_attempts' => $quiz->max_attempts,
                        'is_active' => $quiz->is_active,
                        'total_questions' => $quiz->questions()->count(),
                        'attempts_count' => $attempts->count(),
                        'best_score' => $bestAttempt ? $bestAttempt->score : null,
                        'is_passed' => $bestAttempt ? $bestAttempt->is_passed : false,
                        'can_attempt' => $attempts->count() < $quiz->max_attempts,
                    ];
                }),
                'students_count' => $lesson->enrollments->count(),
                'total_materials' => $totalMaterials,
                'total_quizzes' => $totalQuizzes,
            ],
            'enrollment' => [
                'progress_percentage' => $enrollment->pivot->progress_percentage ?? 0,
                'completed_at' => $enrollment->pivot->completed_at,
                'enrolled_at' => $enrollment->pivot->created_at,
            ],
        ]);
    }

    /**
     * Update lesson progress.
     */
    public function updateProgress(Request $request, Lesson $lesson)
    {
        $enrollment = LessonEnrollment::where('lesson_id', $lesson->id)
            ->where('student_id', auth()->id())
            ->firstOrFail();

        $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        $enrollment->update([
            'progress_percentage' => $request->progress_percentage,
            'completed_at' => $request->progress_percentage >= 100 ? now() : null,
        ]);

        return back()->with('success', 'Progress berhasil diperbarui!');
    }

    /**
     * Leave a lesson (unenroll).
     */
    public function leave(Lesson $lesson)
    {
        $enrollment = LessonEnrollment::where('lesson_id', $lesson->id)
            ->where('student_id', auth()->id())
            ->first();

        if (!$enrollment) {
            return back()->with('error', 'Anda tidak terdaftar di kelas ini!');
        }

        $enrollment->delete();

        return redirect()->route('student.lessons.index')
            ->with('success', 'Berhasil keluar dari kelas!');
    }
}
