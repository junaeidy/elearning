<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Teacher\StudentController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\MaterialController;
use App\Http\Controllers\Teacher\QuizController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\QuizAttemptController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

// Social Login Routes
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');

// Dashboard redirect based on role
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    if ($user->isTeacher()) {
        return redirect()->route('teacher.dashboard');
    }
    
    return redirect()->route('student.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Teacher Routes
Route::middleware(['auth', 'teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
    
    // Student Management
    Route::resource('students', StudentController::class);
    
    // Lesson Management
    Route::get('lessons/generate-code', [LessonController::class, 'generateCode'])->name('lessons.generate-code');
    Route::resource('lessons', LessonController::class);
    Route::post('lessons/{lesson}/toggle-status', [LessonController::class, 'toggleStatus'])->name('lessons.toggle-status');
    
    // Material Management
    Route::post('lessons/{lesson}/materials', [MaterialController::class, 'store'])->name('lessons.materials.store');
    Route::put('lessons/{lesson}/materials/{material}', [MaterialController::class, 'update'])->name('lessons.materials.update');
    Route::delete('lessons/{lesson}/materials/{material}', [MaterialController::class, 'destroy'])->name('lessons.materials.destroy');
    Route::get('lessons/{lesson}/materials/{material}/download', [MaterialController::class, 'download'])->name('lessons.materials.download');
    Route::post('lessons/{lesson}/materials/reorder', [MaterialController::class, 'reorder'])->name('lessons.materials.reorder');
    
    // Quiz Management
    Route::get('lessons/{lesson}/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('lessons/{lesson}/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create');
    Route::post('lessons/{lesson}/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::get('lessons/{lesson}/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::get('lessons/{lesson}/quizzes/{quiz}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');
    Route::put('lessons/{lesson}/quizzes/{quiz}', [QuizController::class, 'update'])->name('quizzes.update');
    Route::delete('lessons/{lesson}/quizzes/{quiz}', [QuizController::class, 'destroy'])->name('quizzes.destroy');
    Route::post('lessons/{lesson}/quizzes/{quiz}/toggle-active', [QuizController::class, 'toggleActive'])->name('quizzes.toggle-active');
    
    // Quiz Questions Management
    Route::post('lessons/{lesson}/quizzes/{quiz}/questions', [QuizController::class, 'addQuestion'])->name('quizzes.questions.store');
    Route::put('lessons/{lesson}/quizzes/{quiz}/questions/{question}', [QuizController::class, 'updateQuestion'])->name('quizzes.questions.update');
    Route::delete('lessons/{lesson}/quizzes/{quiz}/questions/{question}', [QuizController::class, 'deleteQuestion'])->name('quizzes.questions.destroy');
    Route::post('lessons/{lesson}/quizzes/{quiz}/questions/reorder', [QuizController::class, 'reorderQuestions'])->name('quizzes.questions.reorder');
});

// Student Routes
Route::middleware(['auth', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    
    // Quiz Attempts
    Route::get('lessons/{lesson}/quizzes', [QuizAttemptController::class, 'index'])->name('quizzes.index');
    Route::post('lessons/{lesson}/quizzes/{quiz}/start', [QuizAttemptController::class, 'start'])->name('quiz-attempts.start');
    Route::get('lessons/{lesson}/quiz-attempts/{attempt}/take', [QuizAttemptController::class, 'take'])->name('quiz-attempts.take');
    Route::post('lessons/{lesson}/quiz-attempts/{attempt}/submit-answer', [QuizAttemptController::class, 'submitAnswer'])->name('quiz-attempts.submit-answer');
    Route::post('lessons/{lesson}/quiz-attempts/{attempt}/submit', [QuizAttemptController::class, 'submit'])->name('quiz-attempts.submit');
    Route::get('lessons/{lesson}/quiz-attempts/{attempt}/result', [QuizAttemptController::class, 'result'])->name('quiz-attempts.result');
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
