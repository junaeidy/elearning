<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class LessonController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of lessons for the authenticated teacher.
     */
    public function index(Request $request)
    {
        $query = Lesson::where('teacher_id', auth()->id())
            ->with(['enrollments', 'materials', 'quizzes']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('subject', 'like', "%{$searchTerm}%")
                  ->orWhere('lesson_code', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by subject
        if ($request->has('subject') && $request->subject) {
            $query->where('subject', $request->subject);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $lessons = $query->paginate(10)->withQueryString();

        // Add computed properties
        $lessons->getCollection()->transform(function ($lesson) {
            $lesson->enrolled_count = $lesson->enrollments->count();
            $lesson->materials_count = $lesson->materials->count();
            $lesson->quizzes_count = $lesson->quizzes->count();
            return $lesson;
        });

        return Inertia::render('Teacher/Lessons/Index', [
            'lessons' => $lessons,
            'filters' => $request->only(['search', 'status', 'subject', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new lesson.
     */
    public function create()
    {
        return Inertia::render('Teacher/Lessons/Create', [
            'generatedCode' => Lesson::generateCode(),
        ]);
    }

    /**
     * Store a newly created lesson in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'subject' => 'required|string|max:100',
            'lesson_code' => 'required|string|max:10|unique:lessons,lesson_code',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:draft,active,inactive,completed',
            'max_students' => 'required|integer|min:1|max:100',
        ]);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('lesson-covers', 'public');
        }

        // Set teacher_id to current authenticated user
        $validated['teacher_id'] = auth()->id();

        $lesson = Lesson::create($validated);

        return redirect()->route('teacher.lessons.show', $lesson)
            ->with('success', 'Pelajaran berhasil dibuat!');
    }

    /**
     * Display the specified lesson.
     */
    public function show(Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        $this->authorize('view', $lesson);

        $lesson->load([
            'materials' => function ($query) {
                $query->orderBy('order_index', 'asc');
            },
            'enrollments.student',
            'quizzes' => function ($query) {
                $query->withCount(['questions', 'attempts']);
            }
        ]);

        // Add computed properties
        $lesson->enrolled_count = $lesson->enrollments->count();
        $lesson->materials_count = $lesson->materials->count();
        $lesson->quizzes_count = $lesson->quizzes->count();
        $lesson->cover_image_url = $lesson->cover_image ? asset('storage/' . $lesson->cover_image) : null;

        return Inertia::render('Teacher/Lessons/Show', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Show the form for editing the specified lesson.
     */
    public function edit(Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        $this->authorize('update', $lesson);

        $lesson->cover_image_url = $lesson->cover_image ? asset('storage/' . $lesson->cover_image) : null;

        return Inertia::render('Teacher/Lessons/Edit', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Update the specified lesson in storage.
     */
    public function update(Request $request, Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        $this->authorize('update', $lesson);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'subject' => 'required|string|max:100',
            'lesson_code' => 'required|string|max:10|unique:lessons,lesson_code,' . $lesson->id,
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:draft,active,inactive,completed',
            'max_students' => 'required|integer|min:1|max:100',
        ]);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            // Delete old cover image if exists
            if ($lesson->cover_image) {
                Storage::disk('public')->delete($lesson->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('lesson-covers', 'public');
        } else {
            // Remove cover_image from validated data if no new file uploaded
            unset($validated['cover_image']);
        }

        $lesson->update($validated);

        return redirect()->route('teacher.lessons.show', $lesson)
            ->with('success', 'Pelajaran berhasil diperbarui!');
    }

    /**
     * Remove the specified lesson from storage.
     */
    public function destroy(Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        $this->authorize('delete', $lesson);

        // Delete cover image if exists
        if ($lesson->cover_image) {
            Storage::disk('public')->delete($lesson->cover_image);
        }

        // Delete all materials files
        foreach ($lesson->materials as $material) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
        }

        $lesson->delete();

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Pelajaran berhasil dihapus!');
    }

    /**
     * Generate a new unique lesson code.
     */
    public function generateCode()
    {
        return response()->json([
            'code' => Lesson::generateCode(),
        ]);
    }

    /**
     * Toggle lesson status (activate/deactivate).
     */
    public function toggleStatus(Lesson $lesson)
    {
        // Ensure the lesson belongs to the authenticated teacher
        $this->authorize('update', $lesson);

        $newStatus = $lesson->status === 'active' ? 'inactive' : 'active';
        $lesson->update(['status' => $newStatus]);

        return back()->with('success', 'Status pelajaran berhasil diperbarui!');
    }
}
