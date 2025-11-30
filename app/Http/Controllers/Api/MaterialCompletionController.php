<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonMaterial;
use App\Models\MaterialCompletion;
use App\Models\LessonEnrollment;
use App\Events\ProgressUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaterialCompletionController extends Controller
{
    /**
     * Toggle material completion status
     */
    public function toggle(Lesson $lesson, LessonMaterial $material)
    {
        $studentId = Auth::id();

        // Check if student is enrolled in the lesson
        $enrollment = LessonEnrollment::where('lesson_id', $lesson->id)
            ->where('student_id', $studentId)
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Anda tidak terdaftar di kelas ini'], 403);
        }

        // Check if material belongs to this lesson
        if ($material->lesson_id !== $lesson->id) {
            return response()->json(['error' => 'Materi tidak ditemukan di kelas ini'], 404);
        }

        // Toggle completion
        $completion = MaterialCompletion::where('student_id', $studentId)
            ->where('material_id', $material->id)
            ->first();

        if ($completion) {
            // Already completed, mark as incomplete (delete record)
            $completion->delete();
            $isCompleted = false;
        } else {
            // Mark as completed
            MaterialCompletion::create([
                'student_id' => $studentId,
                'lesson_id' => $lesson->id,
                'material_id' => $material->id,
                'completed_at' => now(),
            ]);
            $isCompleted = true;
        }

        // Calculate new progress
        $totalMaterials = $lesson->materials()->count();
        $completedMaterials = MaterialCompletion::where('student_id', $studentId)
            ->where('lesson_id', $lesson->id)
            ->count();

        $progressPercentage = $totalMaterials > 0 
            ? round(($completedMaterials / $totalMaterials) * 100) 
            : 0;

        // Update enrollment progress
        $enrollment->update([
            'progress_percentage' => $progressPercentage,
            'completed_at' => $progressPercentage >= 100 ? now() : null,
        ]);

        // Broadcast progress update to all users in the lesson (including teachers)
        broadcast(new ProgressUpdated(
            $lesson->id,
            $studentId,
            $progressPercentage,
            $material->id,
            $isCompleted
        ));

        return response()->json([
            'success' => true,
            'is_completed' => $isCompleted,
            'progress_percentage' => $progressPercentage,
            'completed_materials' => $completedMaterials,
            'total_materials' => $totalMaterials,
        ]);
    }
}
