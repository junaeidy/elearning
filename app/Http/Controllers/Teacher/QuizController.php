<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Lesson;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the quizzes for a specific lesson
     */
    public function index(Lesson $lesson)
    {
        // Ensure the teacher owns this lesson
        $this->authorize('view', $lesson);

        $quizzes = $lesson->quizzes()
            ->withCount('questions', 'attempts')
            ->latest()
            ->get();

        return Inertia::render('Teacher/Quizzes/Index', [
            'lesson' => $lesson,
            'quizzes' => $quizzes
        ]);
    }

    /**
     * Show the form for creating a new quiz
     */
    public function create(Lesson $lesson)
    {
        $this->authorize('view', $lesson);

        return Inertia::render('Teacher/Quizzes/Create', [
            'lesson' => $lesson
        ]);
    }

    /**
     * Store a newly created quiz in storage
     */
    public function store(Request $request, Lesson $lesson)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'required|integer|min:1|max:10',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
        ]);

        $quiz = $lesson->quizzes()->create([
            ...$validated,
            'is_active' => false, // Initially inactive
        ]);

        return redirect()->route('teacher.quizzes.edit', [$lesson, $quiz])
            ->with('success', 'Kuis berhasil dibuat! Sekarang tambahkan beberapa pertanyaan.');
    }

    /**
     * Display the specified quiz
     */
    public function show(Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        $quiz->load([
            'questions.options',
            'attempts' => function ($query) {
                $query->with('student:id,name,email')
                    ->latest()
                    ->limit(10);
            }
        ]);

        $stats = [
            'total_attempts' => $quiz->attempts()->count(),
            'average_score' => $quiz->attempts()->whereNotNull('completed_at')->avg('score'),
            'highest_score' => $quiz->attempts()->whereNotNull('completed_at')->max('score'),
            'pass_rate' => $this->calculatePassRate($quiz),
        ];

        return Inertia::render('Teacher/Quizzes/Show', [
            'lesson' => $lesson,
            'quiz' => $quiz,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified quiz
     */
    public function edit(Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        $quiz->load('questions.options');

        return Inertia::render('Teacher/Quizzes/Edit', [
            'lesson' => $lesson,
            'quiz' => $quiz
        ]);
    }

    /**
     * Update the specified quiz in storage
     */
    public function update(Request $request, Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'required|integer|min:1|max:10',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
            'is_active' => 'boolean',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Pengaturan kuis berhasil diperbarui!');
    }

    /**
     * Remove the specified quiz from storage
     */
    public function destroy(Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        // Check if quiz has attempts
        if ($quiz->attempts()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus kuis yang sudah memiliki percobaan dari siswa.');
        }

        $quiz->delete();

        return redirect()->route('teacher.quizzes.index', $lesson)
            ->with('success', 'Kuis berhasil dihapus!');
    }

    /**
     * Toggle quiz active status
     */
    public function toggleActive(Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        // Check if quiz has at least one question
        if (!$quiz->is_active && $quiz->questions()->count() === 0) {
            return back()->with('error', 'Tidak dapat mengaktifkan kuis tanpa pertanyaan. Tambahkan minimal satu pertanyaan terlebih dahulu.');
        }

        $quiz->update([
            'is_active' => !$quiz->is_active
        ]);

        $status = $quiz->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Kuis berhasil {$status}!");
    }

    /**
     * Add a question to the quiz
     */
    public function addQuestion(Request $request, Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,true_false,essay',
            'points' => 'required|integer|min:1|max:100',
            'options' => 'required_if:question_type,multiple_choice,true_false|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        // Validate that at least one option is correct for multiple choice
        if (in_array($validated['question_type'], ['multiple_choice', 'true_false'])) {
            $hasCorrect = collect($validated['options'])->contains('is_correct', true);
            if (!$hasCorrect) {
                return back()->withErrors(['options' => 'Minimal satu pilihan jawaban harus ditandai sebagai jawaban yang benar.']);
            }
        }

        // Get the next order number
        $order = $quiz->questions()->max('order_index') + 1;

        $question = $quiz->questions()->create([
            'question_text' => $validated['question_text'],
            'question_type' => $validated['question_type'],
            'points' => $validated['points'],
            'order_index' => $order,
        ]);

        // Add options if applicable
        if (isset($validated['options'])) {
            foreach ($validated['options'] as $index => $option) {
                $question->options()->create([
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'],
                    'order_index' => $index + 1,
                ]);
            }
        }

        return back()->with('success', 'Pertanyaan berhasil ditambahkan!');
    }

    /**
     * Update a question
     */
    public function updateQuestion(Request $request, Lesson $lesson, Quiz $quiz, QuizQuestion $question)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,true_false,essay',
            'points' => 'required|integer|min:1|max:100',
            'options' => 'required_if:question_type,multiple_choice,true_false|array|min:2',
            'options.*.id' => 'nullable|exists:quiz_question_options,id',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        // Validate that at least one option is correct
        if (in_array($validated['question_type'], ['multiple_choice', 'true_false'])) {
            $hasCorrect = collect($validated['options'])->contains('is_correct', true);
            if (!$hasCorrect) {
                return back()->withErrors(['options' => 'Minimal satu pilihan jawaban harus ditandai sebagai jawaban yang benar.']);
            }
        }

        $question->update([
            'question_text' => $validated['question_text'],
            'question_type' => $validated['question_type'],
            'points' => $validated['points'],
        ]);

        // Update or create options
        if (isset($validated['options'])) {
            // Get existing option IDs
            $existingIds = $question->options()->pluck('id')->toArray();
            $submittedIds = collect($validated['options'])->pluck('id')->filter()->toArray();

            // Delete options that were removed
            $toDelete = array_diff($existingIds, $submittedIds);
            QuizQuestionOption::whereIn('id', $toDelete)->delete();

            // Update or create options
            foreach ($validated['options'] as $index => $option) {
                if (isset($option['id'])) {
                    // Update existing option
                    QuizQuestionOption::where('id', $option['id'])->update([
                        'option_text' => $option['option_text'],
                        'is_correct' => $option['is_correct'],
                        'order_index' => $index + 1,
                    ]);
                } else {
                    // Create new option
                    $question->options()->create([
                        'option_text' => $option['option_text'],
                        'is_correct' => $option['is_correct'],
                        'order_index' => $index + 1,
                    ]);
                }
            }
        }

        return back()->with('success', 'Pertanyaan berhasil diperbarui!');
    }

    /**
     * Delete a question
     */
    public function deleteQuestion(Lesson $lesson, Quiz $quiz, QuizQuestion $question)
    {
        $this->authorize('view', $lesson);

        $question->delete();

        return back()->with('success', 'Pertanyaan berhasil dihapus!');
    }

    /**
     * Reorder questions
     */
    public function reorderQuestions(Request $request, Lesson $lesson, Quiz $quiz)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:quiz_questions,id',
            'questions.*.order' => 'required|integer|min:1',
        ]);

        foreach ($validated['questions'] as $item) {
            QuizQuestion::where('id', $item['id'])
                ->where('quiz_id', $quiz->id)
                ->update(['order_index' => $item['order']]);
        }

        return back()->with('success', 'Urutan pertanyaan berhasil diperbarui!');
    }

    /**
     * Calculate pass rate for a quiz
     */
    private function calculatePassRate(Quiz $quiz)
    {
        $completedAttempts = $quiz->attempts()->whereNotNull('completed_at')->count();
        
        if ($completedAttempts === 0) {
            return 0;
        }

        $passedAttempts = $quiz->attempts()
            ->whereNotNull('completed_at')
            ->where('score', '>=', $quiz->passing_score)
            ->count();

        return round(($passedAttempts / $completedAttempts) * 100, 2);
    }
}
