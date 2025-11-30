<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request, Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        if ($lesson->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf,image,audio,slide,document',
            'file' => 'required|file|max:204800', // max 200MB (in KB)
            'order_index' => 'nullable|integer|min:0',
        ], [
            'file.max' => 'File terlalu besar. Ukuran maksimal adalah 200MB.',
            'file.required' => 'File wajib dipilih.',
            'title.required' => 'Judul materi wajib diisi.',
            'type.required' => 'Tipe materi wajib dipilih.',
        ]);

        // Validate file type based on material type
        $mimeTypeRules = [
            'video' => ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
            'pdf' => ['application/pdf'],
            'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            'audio' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
            'slide' => ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'document' => ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        ];

        $file = $request->file('file');
        $mimeType = $file->getMimeType();

        // Validate mime type
        if (isset($mimeTypeRules[$validated['type']]) && !in_array($mimeType, $mimeTypeRules[$validated['type']])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe file tidak sesuai dengan tipe materi yang dipilih.'
            ], 422);
        }

        try {
            // Store file
            $path = $file->store('materials/' . $lesson->id, 'public');

            // Get the next order number if not provided
            if (!isset($validated['order_index'])) {
                $validated['order_index'] = $lesson->materials()->max('order_index') + 1;
            }

            // Create material
            $material = $lesson->materials()->create([
                'title' => $validated['title'],
                'type' => $validated['type'],
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $mimeType,
                'order_index' => $validated['order_index'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil diunggah!',
                'material' => $material
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, Lesson $lesson, LessonMaterial $material)
    {
        // Ensure the lesson belongs to the authenticated teacher
        if ($lesson->teacher_id !== auth()->id() || $material->lesson_id !== $lesson->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf,image,audio,slide,document',
            'order_index' => 'nullable|integer|min:0',
        ]);

        $material->update($validated);

        return back()->with('success', 'Materi berhasil diperbarui!');
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Lesson $lesson, LessonMaterial $material)
    {
        // Ensure the lesson belongs to the authenticated teacher
        if ($lesson->teacher_id !== auth()->id() || $material->lesson_id !== $lesson->id) {
            abort(403, 'Unauthorized action.');
        }

        // Delete file from storage
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return back()->with('success', 'Materi berhasil dihapus!');
    }

    /**
     * Download the specified material.
     */
    public function download(Lesson $lesson, LessonMaterial $material)
    {
        // Check if user has access to this material
        // Teacher can download their own materials
        // Students can download materials from enrolled lessons
        $hasAccess = false;

        if (auth()->user()->isTeacher() && $lesson->teacher_id === auth()->id()) {
            $hasAccess = true;
        } elseif (auth()->user()->isStudent()) {
            $hasAccess = $lesson->enrollments()->where('student_id', auth()->id())->exists();
        }

        if (!$hasAccess || $material->lesson_id !== $lesson->id) {
            abort(403, 'Unauthorized action.');
        }

        $filePath = storage_path('app/public/' . $material->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $material->title . '.' . pathinfo($material->file_path, PATHINFO_EXTENSION));
    }

    /**
     * Reorder materials.
     */
    public function reorder(Request $request, Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        if ($lesson->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'materials' => 'required|array',
            'materials.*.id' => 'required|exists:lesson_materials,id',
            'materials.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['materials'] as $materialData) {
            LessonMaterial::where('id', $materialData['id'])
                ->where('lesson_id', $lesson->id)
                ->update(['order_index' => $materialData['order']]);
        }

        return back()->with('success', 'Urutan materi berhasil diperbarui!');
    }
}
