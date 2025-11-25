import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import axios from 'axios';

export default function Take({ lesson, quiz, attempt, questions, existingAnswers, remainingSeconds }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState(existingAnswers || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    // Save answer to backend
    const saveAnswer = useCallback(
        async (questionId, answerData) => {
            try {
                await axios.post(
                    route('student.quiz-attempts.submit-answer', [lesson.id, attempt.id]),
                    {
                        question_id: questionId,
                        ...answerData,
                    }
                );
            } catch (error) {
                console.error('Error saving answer:', error);
            }
        },
        [lesson.id, attempt.id]
    );

    // Handle answer change
    const handleAnswerChange = (questionId, answerData) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answerData,
        }));

        // Auto-save to backend
        saveAnswer(questionId, answerData);
    };

    // Handle submit
    const handleSubmit = () => {
        if (confirm('Are you sure you want to submit your quiz?')) {
            setIsSubmitting(true);
            router.post(route('student.quiz-attempts.submit', [lesson.id, attempt.id]));
        }
    };

    // Auto-submit when time expires
    const handleTimeExpire = () => {
        alert('Time is up! Your quiz will be submitted automatically.');
        router.post(route('student.quiz-attempts.submit', [lesson.id, attempt.id]));
    };

    // Navigation
    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Check if question is answered
    const isQuestionAnswered = (questionId) => {
        const answer = answers[questionId];
        if (!answer) return false;
        return answer.selected_option_id || (answer.answer_text && answer.answer_text.trim() !== '');
    };

    // Calculate answered questions count
    const answeredCount = questions.filter((q) => isQuestionAnswered(q.id)).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
                        <p className="text-sm text-gray-600">
                            Attempt {attempt.attempt_number} of {quiz.max_attempts}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Taking Quiz - ${quiz.title}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar - Timer & Navigation */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Timer */}
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                <div className="flex justify-center mb-4">
                                    <CountdownCircleTimer
                                        isPlaying
                                        duration={quiz.duration_minutes * 60}
                                        initialRemainingTime={remainingSeconds}
                                        colors={['#10B981', '#F59E0B', '#EF4444']}
                                        colorsTime={[
                                            remainingSeconds,
                                            remainingSeconds / 2,
                                            0,
                                        ]}
                                        size={120}
                                        strokeWidth={8}
                                        onComplete={handleTimeExpire}
                                    >
                                        {({ remainingTime }) => {
                                            const minutes = Math.floor(remainingTime / 60);
                                            const seconds = remainingTime % 60;
                                            return (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-800">
                                                        {minutes}:{seconds.toString().padStart(2, '0')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">remaining</div>
                                                </div>
                                            );
                                        }}
                                    </CountdownCircleTimer>
                                </div>

                                <div className="text-center mb-4">
                                    <div className="text-sm text-gray-600">Progress</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {answeredCount}/{questions.length}
                                    </div>
                                    <div className="text-xs text-gray-500">questions answered</div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : '✓ Submit Quiz'}
                                </button>
                            </div>

                            {/* Question Navigator */}
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Questions
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {questions.map((question, index) => (
                                        <button
                                            key={question.id}
                                            onClick={() => goToQuestion(index)}
                                            className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                                                currentQuestionIndex === index
                                                    ? 'bg-blue-600 text-white'
                                                    : isQuestionAnswered(question.id)
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Question */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {currentQuestion.points} points
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                                        {currentQuestion.question_text}
                                    </h3>

                                    {/* Answer Options */}
                                    <div className="space-y-3">
                                        {currentQuestion.question_type === 'multiple_choice' ||
                                        currentQuestion.question_type === 'true_false' ? (
                                            currentQuestion.options.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                                        answers[currentQuestion.id]?.selected_option_id ===
                                                        option.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQuestion.id}`}
                                                        value={option.id}
                                                        checked={
                                                            answers[currentQuestion.id]
                                                                ?.selected_option_id === option.id
                                                        }
                                                        onChange={() =>
                                                            handleAnswerChange(currentQuestion.id, {
                                                                selected_option_id: option.id,
                                                            })
                                                        }
                                                        className="mr-4"
                                                    />
                                                    <span className="text-gray-800 font-medium">
                                                        {option.option_text}
                                                    </span>
                                                </label>
                                            ))
                                        ) : currentQuestion.question_type === 'essay' ? (
                                            <textarea
                                                value={answers[currentQuestion.id]?.answer_text || ''}
                                                onChange={(e) =>
                                                    handleAnswerChange(currentQuestion.id, {
                                                        answer_text: e.target.value,
                                                    })
                                                }
                                                rows="8"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                placeholder="Type your answer here..."
                                            />
                                        ) : null}
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 border-t">
                                    <button
                                        onClick={previousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        ← Previous
                                    </button>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button
                                            onClick={nextQuestion}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Next →
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting...' : '✓ Submit Quiz'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
