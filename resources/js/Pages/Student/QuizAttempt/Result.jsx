import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import confetti from 'canvas-confetti';

export default function Result({ lesson, quiz, attempt, questions, passed, can_retry }) {
    // Trigger confetti if passed
    useEffect(() => {
        if (passed) {
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        }
    }, [passed]);

    // Calculate percentage for each question type
    const correctCount = questions.filter(
        (q) => q.student_answer?.is_correct === true
    ).length;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quiz Results</h2>
                    <p className="text-sm text-gray-600">{quiz.title}</p>
                </div>
            }
        >
            <Head title={`Quiz Results - ${quiz.title}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Score Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white">
                        <div className="text-center">
                            <div className="text-6xl font-bold mb-2">{attempt.score}%</div>
                            <div className="text-2xl font-semibold mb-4">
                                {passed ? (
                                    <span>🎉 Congratulations! You Passed!</span>
                                ) : (
                                    <span>Keep Trying!</span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{correctCount}</div>
                                    <div className="text-sm">Correct</div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">
                                        {questions.length - correctCount}
                                    </div>
                                    <div className="text-sm">Incorrect</div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{questions.length}</div>
                                    <div className="text-sm">Total</div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center gap-4">
                                {can_retry && (
                                    <Link
                                        href={route('student.quiz-attempts.start', [lesson.id, quiz.id])}
                                        method="post"
                                        as="button"
                                        className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
                                    >
                                        🔄 Retry Quiz
                                    </Link>
                                )}
                                <Link
                                    href={route('student.quizzes.index', lesson.id)}
                                    className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition font-semibold"
                                >
                                    ← Back to Quizzes
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Review Answers */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Review Your Answers</h3>

                        <div className="space-y-6">
                            {questions.map((question, index) => {
                                const answer = question.student_answer;
                                const isCorrect = answer?.is_correct;

                                return (
                                    <div
                                        key={question.id}
                                        className={`border-2 rounded-lg p-6 ${
                                            isCorrect
                                                ? 'border-green-200 bg-green-50'
                                                : answer?.is_correct === false
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                        Question {index + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {question.points} points
                                                    </span>
                                                    {isCorrect !== null && (
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                isCorrect
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}
                                                        >
                                                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800">
                                                    {question.question_text}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Options Review (for multiple choice/true-false) */}
                                        {(question.question_type === 'multiple_choice' ||
                                            question.question_type === 'true_false') && (
                                            <div className="space-y-2">
                                                {question.options.map((option) => {
                                                    const isStudentAnswer =
                                                        answer?.selected_option_id === option.id;
                                                    const isCorrectAnswer = option.is_correct;

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`p-3 rounded-lg border-2 ${
                                                                isCorrectAnswer
                                                                    ? 'border-green-400 bg-green-100'
                                                                    : isStudentAnswer && !isCorrectAnswer
                                                                    ? 'border-red-400 bg-red-100'
                                                                    : 'border-gray-200 bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-gray-800">
                                                                    {option.option_text}
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    {isStudentAnswer && (
                                                                        <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
                                                                            Your Answer
                                                                        </span>
                                                                    )}
                                                                    {isCorrectAnswer && (
                                                                        <span className="text-sm bg-green-600 text-white px-2 py-1 rounded">
                                                                            ✓ Correct Answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Essay Answer Review */}
                                        {question.question_type === 'essay' && answer?.answer_text && (
                                            <div className="mt-4">
                                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                                    Your Answer:
                                                </div>
                                                <div className="p-4 bg-white border border-gray-300 rounded-lg">
                                                    <p className="text-gray-800 whitespace-pre-wrap">
                                                        {answer.answer_text}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-sm text-orange-600">
                                                    ℹ️ Essay questions require manual grading by your teacher.
                                                </p>
                                            </div>
                                        )}

                                        {/* Points Earned */}
                                        {answer?.points_earned !== undefined && (
                                            <div className="mt-4 text-sm font-semibold text-gray-700">
                                                Points Earned: {answer.points_earned} / {question.points}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Attempt Info */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h4 className="font-bold text-gray-800 mb-4">Attempt Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Attempt Number:</span>
                                <div className="font-bold text-gray-800">
                                    {attempt.attempt_number} of {quiz.max_attempts}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Started At:</span>
                                <div className="font-bold text-gray-800">
                                    {new Date(attempt.started_at).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Completed At:</span>
                                <div className="font-bold text-gray-800">
                                    {new Date(attempt.completed_at).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Passing Score:</span>
                                <div className="font-bold text-gray-800">{quiz.passing_score}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
