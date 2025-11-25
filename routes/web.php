<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Teacher\StudentController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\MaterialController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
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
});

// Student Routes
Route::middleware(['auth', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
