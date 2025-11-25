<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizAnswer;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class QuizAttemptController extends Controller
{
    /**
     * Show available quizzes for a lesson
     */
    public function index(Lesson $lesson)
    {
        // Check if student is enrolled
        $enrollment = $lesson->enrollments()
            ->where('student_id', auth()->id())
            ->first();

        if (!$enrollment) {
            abort(403, 'Anda belum terdaftar di pelajaran ini.');
        }

        $quizzes = $lesson->quizzes()
            ->where('is_active', true)
            ->withCount('questions')
            ->with(['attempts' => function ($query) {
                $query->where('student_id', auth()->id());
            }])
            ->get()
            ->map(function ($quiz) {
                $userAttempts = $quiz->attempts->count();
                $bestScore = $quiz->attempts->max('score');
                $lastAttempt = $quiz->attempts->sortByDesc('created_at')->first();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'duration_minutes' => $quiz->duration_minutes,
                    'passing_score' => $quiz->passing_score,
                    'max_attempts' => $quiz->max_attempts,
                    'questions_count' => $quiz->questions_count,
                    'user_attempts' => $userAttempts,
                    'best_score' => $bestScore,
                    'can_attempt' => $userAttempts < $quiz->max_attempts,
                    'last_attempt' => $lastAttempt,
                    'is_available' => $this->isQuizAvailable($quiz),
                ];
            });

        return Inertia::render('Student/Quizzes/Index', [
            'lesson' => $lesson,
            'quizzes' => $quizzes
        ]);
    }

    /**
     * Start a new quiz attempt
     */
    public function start(Lesson $lesson, Quiz $quiz)
    {
        // Verify enrollment
        $enrollment = $lesson->enrollments()
            ->where('student_id', auth()->id())
            ->first();

        if (!$enrollment) {
            abort(403, 'Anda belum terdaftar di pelajaran ini.');
        }

        // Check if quiz is active
        if (!$quiz->is_active) {
            return back()->with('error', 'Kuis ini saat ini tidak tersedia.');
        }

        // Check if quiz is within time window
        if (!$this->isQuizAvailable($quiz)) {
            return back()->with('error', 'Kuis ini belum tersedia atau sudah ditutup.');
        }

        // Check max attempts
        $attemptCount = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', auth()->id())
            ->count();

        if ($attemptCount >= $quiz->max_attempts) {
            return back()->with('error', 'Anda telah mencapai batas maksimal percobaan untuk kuis ini.');
        }

        // Check if has incomplete attempt
        $incompleteAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', auth()->id())
            ->whereNull('completed_at')
            ->first();

        if ($incompleteAttempt) {
            // Check if time has expired
            $timeLimit = Carbon::parse($incompleteAttempt->started_at)
                ->addMinutes($quiz->duration_minutes);

            if (Carbon::now()->greaterThan($timeLimit)) {
                // Auto-submit expired attempt
                $this->autoSubmit($incompleteAttempt);
                return back()->with('error', 'Percobaan sebelumnya telah kadaluarsa. Silakan mulai percobaan baru.');
            }

            // Resume existing attempt
            return redirect()->route('student.quiz-attempts.take', [$lesson, $incompleteAttempt]);
        }

        // Create new attempt
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => auth()->id(),
            'total_questions' => $quiz->questions()->count(),
            'attempt_number' => $attemptCount + 1,
            'started_at' => now(),
        ]);

        return redirect()->route('student.quiz-attempts.take', [$lesson, $attempt])
            ->with('success', 'Kuis dimulai! Semoga berhasil!');
    }

    /**
     * Show the quiz taking interface
     */
    public function take(Lesson $lesson, QuizAttempt $attempt)
    {
        // Verify this is the student's attempt
        if ($attempt->student_id !== auth()->id()) {
            abort(403);
        }

        // Check if already completed
        if ($attempt->completed_at) {
            return redirect()->route('student.quiz-attempts.result', [$lesson, $attempt]);
        }

        // Check if time has expired
        $timeLimit = Carbon::parse($attempt->started_at)
            ->addMinutes($attempt->quiz->duration_minutes);

        if (Carbon::now()->greaterThan($timeLimit)) {
            // Auto-submit
            $this->autoSubmit($attempt);
            return redirect()->route('student.quiz-attempts.result', [$lesson, $attempt])
                ->with('info', 'Waktu habis. Kuis Anda telah otomatis dikumpulkan.');
        }

        // Load quiz with questions and options
        $quiz = $attempt->quiz()->with(['questions' => function ($query) {
            $query->orderBy('order_index')->with('options');
        }])->first();

        // Load existing answers
        $existingAnswers = $attempt->answers()
            ->get()
            ->keyBy('question_id')
            ->map(function ($answer) {
                return [
                    'selected_option_id' => $answer->selected_option_id,
                    'answer_text' => $answer->answer_text,
                ];
            });

        // Calculate remaining time in seconds
        $remainingSeconds = max(0, Carbon::now()->diffInSeconds($timeLimit, false));

        return Inertia::render('Student/QuizAttempt/Take', [
            'lesson' => $lesson,
            'quiz' => $quiz,
            'attempt' => $attempt,
            'questions' => $quiz->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question_text' => $question->question_text,
                    'question_type' => $question->question_type,
                    'points' => $question->points,
                    'order' => $question->order,
                    'options' => $question->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'option_text' => $option->option_text,
                            'order' => $option->order,
                        ];
                    }),
                ];
            }),
            'existingAnswers' => $existingAnswers,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    /**
     * Submit an answer for a question
     */
    public function submitAnswer(Request $request, Lesson $lesson, QuizAttempt $attempt)
    {
        // Verify this is the student's attempt
        if ($attempt->student_id !== auth()->id()) {
            abort(403);
        }

        // Check if already completed
        if ($attempt->completed_at) {
            return response()->json(['error' => 'Kuis sudah dikumpulkan'], 400);
        }

        // Check if time has expired
        $timeLimit = Carbon::parse($attempt->started_at)
            ->addMinutes($attempt->quiz->duration_minutes);

        if (Carbon::now()->greaterThan($timeLimit)) {
            return response()->json(['error' => 'Waktu habis'], 400);
        }

        $validated = $request->validate([
            'question_id' => 'required|exists:quiz_questions,id',
            'selected_option_id' => 'nullable|exists:quiz_question_options,id',
            'answer_text' => 'nullable|string',
        ]);

        $question = QuizQuestion::find($validated['question_id']);

        // Verify question belongs to this quiz
        if ($question->quiz_id !== $attempt->quiz_id) {
            return response()->json(['error' => 'Pertanyaan tidak valid'], 400);
        }

        // Determine if answer is correct (for auto-graded questions)
        $isCorrect = null;
        $pointsEarned = 0;

        if (in_array($question->question_type, ['multiple_choice', 'true_false']) && isset($validated['selected_option_id'])) {
            $selectedOption = $question->options()->find($validated['selected_option_id']);
            $isCorrect = $selectedOption ? $selectedOption->is_correct : false;
            $pointsEarned = $isCorrect ? $question->points : 0;
        }

        // Update or create answer
        QuizAnswer::updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
            ],
            [
                'selected_option_id' => $validated['selected_option_id'] ?? null,
                'answer_text' => $validated['answer_text'] ?? null,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Jawaban tersimpan'
        ]);
    }

    /**
     * Submit the entire quiz
     */
    public function submit(Lesson $lesson, QuizAttempt $attempt)
    {
        // Verify this is the student's attempt
        if ($attempt->student_id !== auth()->id()) {
            abort(403);
        }

        // Check if already completed
        if ($attempt->completed_at) {
            return redirect()->route('student.quiz-attempts.result', [$lesson, $attempt]);
        }

        $this->calculateAndSaveScore($attempt);

        return redirect()->route('student.quiz-attempts.result', [$lesson, $attempt])
            ->with('success', 'Kuis berhasil dikumpulkan!');
    }

    /**
     * Show quiz results
     */
    public function result(Lesson $lesson, QuizAttempt $attempt)
    {
        // Verify this is the student's attempt
        if ($attempt->student_id !== auth()->id()) {
            abort(403);
        }

        // Load quiz with questions and correct answers
        $quiz = $attempt->quiz()->with(['questions' => function ($query) {
            $query->orderBy('order_index')->with('options');
        }])->first();

        // Load student's answers
        $answers = $attempt->answers()
            ->with(['question.options', 'selectedOption'])
            ->get()
            ->keyBy('question_id');

        $questionsWithAnswers = $quiz->questions->map(function ($question) use ($answers) {
            $answer = $answers->get($question->id);

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'points' => $question->points,
                'options' => $question->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                        'is_correct' => $option->is_correct,
                    ];
                }),
                'student_answer' => $answer ? [
                    'selected_option_id' => $answer->selected_option_id,
                    'answer_text' => $answer->answer_text,
                    'is_correct' => $answer->is_correct,
                    'points_earned' => $answer->points_earned,
                ] : null,
            ];
        });

        $passed = $attempt->score >= $quiz->passing_score;

        return Inertia::render('Student/QuizAttempt/Result', [
            'lesson' => $lesson,
            'quiz' => $quiz,
            'attempt' => $attempt,
            'questions' => $questionsWithAnswers,
            'passed' => $passed,
            'can_retry' => $attempt->attempt_number < $quiz->max_attempts,
        ]);
    }

    /**
     * Calculate and save the final score
     */
    private function calculateAndSaveScore(QuizAttempt $attempt)
    {
        // Count correct answers and calculate score
        $correctAnswers = $attempt->answers()
            ->where('is_correct', true)
            ->count();

        $totalPoints = $attempt->answers()->sum('points_earned');
        $maxPoints = $attempt->quiz->questions()->sum('points');

        $score = $maxPoints > 0 ? round(($totalPoints / $maxPoints) * 100) : 0;

        $attempt->update([
            'correct_answers' => $correctAnswers,
            'score' => $score,
            'completed_at' => now(),
        ]);

        return $attempt;
    }

    /**
     * Auto-submit an attempt when time expires
     */
    private function autoSubmit(QuizAttempt $attempt)
    {
        if (!$attempt->completed_at) {
            $this->calculateAndSaveScore($attempt);
        }
    }

    /**
     * Check if quiz is available based on time window
     */
    private function isQuizAvailable(Quiz $quiz)
    {
        $now = Carbon::now();

        if ($quiz->start_time && $now->lessThan($quiz->start_time)) {
            return false;
        }

        if ($quiz->end_time && $now->greaterThan($quiz->end_time)) {
            return false;
        }

        return true;
    }
}
