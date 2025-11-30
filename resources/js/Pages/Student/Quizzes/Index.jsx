import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ lesson, quizzes }) {
    const handleStartQuiz = (quizId) => {
        router.post(route('student.quiz-attempts.start', [lesson.id, quizId]));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Quizzes - {lesson.title}
                    </h2>
                    <p className="text-sm text-gray-600">Test your knowledge!</p>
                </div>
            }
        >
            <Head title={`Quizzes - ${lesson.title}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {quizzes.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                No quizzes available yet
                            </h3>
                            <p className="text-gray-600">
                                Your teacher hasn't created any quizzes for this lesson yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                {quiz.title}
                                            </h3>
                                            {quiz.description && (
                                                <p className="text-gray-600 mb-4">{quiz.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="text-xs text-blue-600 mb-1">Questions</div>
                                                    <div className="text-2xl font-bold text-blue-700">
                                                        {quiz.questions_count}
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="text-xs text-purple-600 mb-1">Duration</div>
                                                    <div className="text-2xl font-bold text-purple-700">
                                                        {quiz.duration_minutes}m
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="text-xs text-green-600 mb-1">Pass Score</div>
                                                    <div className="text-2xl font-bold text-green-700">
                                                        {quiz.passing_score}%
                                                    </div>
                                                </div>
                                                <div className="bg-orange-50 rounded-lg p-3">
                                                    <div className="text-xs text-orange-600 mb-1">Attempts</div>
                                                    <div className="text-2xl font-bold text-orange-700">
                                                        {quiz.user_attempts}/{quiz.max_attempts}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Best Score */}
                                            {quiz.best_score !== null && (
                                                <div className="mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">
                                                            Your Best Score:
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                                quiz.best_score >= quiz.passing_score
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}
                                                        >
                                                            {quiz.best_score}%
                                                        </span>
                                                        {quiz.best_score >= quiz.passing_score && (
                                                            <span className="text-green-600">✓ Passed</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Last Attempt */}
                                            {quiz.last_attempt && (
                                                <div className="text-sm text-gray-500 mb-4">
                                                    Last attempted:{' '}
                                                    {new Date(quiz.last_attempt.created_at).toLocaleString()}
                                                </div>
                                            )}

                                            {/* Availability Status */}
                                            {!quiz.is_active && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-gray-800">
                                                        🔒 Quiz belum dimulai oleh guru
                                                    </p>
                                                </div>
                                            )}
                                            {quiz.is_active && !quiz.is_available && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-yellow-800">
                                                        ⚠️ This quiz is not currently available
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6">
                                            {quiz.can_attempt && quiz.is_available ? (
                                                <button
                                                    onClick={() => handleStartQuiz(quiz.id)}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 font-semibold shadow-lg"
                                                >
                                                    🎯 Start Quiz
                                                </button>
                                            ) : !quiz.can_attempt ? (
                                                <div className="text-center">
                                                    <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold">
                                                        No Attempts Left
                                                    </div>
                                                    {quiz.last_attempt && (
                                                        <Link
                                                            href={route('student.quiz-attempts.result', [
                                                                lesson.id,
                                                                quiz.last_attempt.id,
                                                            ])}
                                                            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            View Last Result
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold">
                                                    Not Available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
