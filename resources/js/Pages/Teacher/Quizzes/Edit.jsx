import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableQuestion({ question, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3"
        >
            <div className="flex items-start gap-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
                >
                    ⋮⋮
                </button>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mr-2">
                                {question.question_type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                                {question.points} poin
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(question)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => onDelete(question.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                🗑 Delete
                            </button>
                        </div>
                    </div>

                    <p className="text-gray-800 font-medium mb-2">{question.question_text}</p>

                    {question.options && question.options.length > 0 && (
                        <div className="space-y-1">
                            {question.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`text-sm px-3 py-1 rounded ${
                                        option.is_correct
                                            ? 'bg-green-50 text-green-700 font-medium'
                                            : 'bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    {option.is_correct && '✓ '}
                                    {option.option_text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuestionForm({ lesson, quiz, question = null, onClose }) {
    // Initialize options based on question type
    const initializeOptions = () => {
        if (question?.options && question.options.length > 0) {
            return question.options;
        }
        
        if (question?.question_type === 'true_false') {
            return [
                { option_text: 'True', is_correct: false },
                { option_text: 'False', is_correct: false },
            ];
        }
        
        return [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ];
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        question_text: question?.question_text || '',
        question_type: question?.question_type || 'multiple_choice',
        points: question?.points || 10,
        options: initializeOptions(),
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (question) {
            put(route('teacher.quizzes.questions.update', [lesson.id, quiz.id, question.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                    // Refresh page to get updated data
                    router.reload({ only: ['quiz'] });
                },
            });
        } else {
            post(route('teacher.quizzes.questions.store', [lesson.id, quiz.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                    // Refresh page to get updated data
                    router.reload({ only: ['quiz'] });
                },
            });
        }
    };

    const addOption = () => {
        setData('options', [...data.options, { option_text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        setData('options', data.options.filter((_, i) => i !== index));
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...data.options];
        newOptions[index][field] = value;
        setData('options', newOptions);
    };

    const toggleCorrect = (index) => {
        const newOptions = data.options.map((opt, i) => ({
            ...opt,
            is_correct: data.question_type === 'true_false' ? i === index : opt.is_correct,
        }));
        
        if (data.question_type === 'true_false') {
            newOptions[index].is_correct = true;
        } else {
            newOptions[index].is_correct = !newOptions[index].is_correct;
        }
        
        setData('options', newOptions);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {question ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipe Pertanyaan *
                        </label>
                        <select
                            value={data.question_type}
                            onChange={(e) => {
                                setData('question_type', e.target.value);
                                if (e.target.value === 'true_false') {
                                    setData('options', [
                                        { option_text: 'True', is_correct: false },
                                        { option_text: 'False', is_correct: false },
                                    ]);
                                }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="multiple_choice">Pilihan Ganda</option>
                            <option value="true_false">Benar/Salah</option>
                            <option value="essay">Esai</option>
                        </select>
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teks Pertanyaan *
                        </label>
                        <textarea
                            value={data.question_text}
                            onChange={(e) => setData('question_text', e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan pertanyaan Anda..."
                            required
                        />
                        {errors.question_text && (
                            <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
                        )}
                    </div>

                    {/* Points */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poin *
                        </label>
                        <input
                            type="number"
                            value={data.points}
                            onChange={(e) => setData('points', parseInt(e.target.value))}
                            min="1"
                            max="100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Options (for multiple choice and true/false) */}
                    {(data.question_type === 'multiple_choice' || data.question_type === 'true_false') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilihan Jawaban * 
                                <span className="text-xs text-gray-500 ml-2">
                                    (Klik tombol untuk menandai jawaban yang benar)
                                </span>
                            </label>
                            <div className="space-y-3">
                                {data.options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option.option_text}
                                            onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Pilihan ${index + 1}`}
                                            required
                                            disabled={data.question_type === 'true_false'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrect(index)}
                                            className={`px-4 py-2 rounded-lg transition ${
                                                option.is_correct
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            {option.is_correct ? '✓ Benar' : 'Tandai Benar'}
                                        </button>
                                        {data.question_type === 'multiple_choice' && data.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {data.question_type === 'multiple_choice' && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                                >
                                    + Tambah Pilihan
                                </button>
                            )}

                            {errors.options && (
                                <p className="mt-2 text-sm text-red-600">{errors.options}</p>
                            )}
                            
                            {!data.options.some(opt => opt.is_correct) && (
                                <p className="mt-2 text-sm text-amber-600">
                                    ⚠️ Jangan lupa tandai minimal satu jawaban yang benar
                                </p>
                            )}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : question ? 'Perbarui Pertanyaan' : 'Tambah Pertanyaan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Edit({ lesson, quiz }) {
    const { flash } = usePage().props;
    const [questions, setQuestions] = useState(quiz.questions || []);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Update questions when quiz prop changes
    useEffect(() => {
        setQuestions(quiz.questions || []);
    }, [quiz.questions]);

    const { data, setData, put, processing, errors } = useForm({
        title: quiz.title,
        description: quiz.description || '',
        duration_minutes: quiz.duration_minutes,
        passing_score: quiz.passing_score,
        max_attempts: quiz.max_attempts,
        start_time: quiz.start_time || '',
        end_time: quiz.end_time || '',
        is_active: quiz.is_active,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('teacher.quizzes.update', [lesson.id, quiz.id]), {
            preserveScroll: true,
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order in backend
                const reorderedQuestions = newItems.map((item, index) => ({
                    id: item.id,
                    order: index + 1,
                }));

                router.post(
                    route('teacher.quizzes.questions.reorder', [lesson.id, quiz.id]),
                    { questions: reorderedQuestions },
                    { preserveScroll: true }
                );

                return newItems;
            });
        }
    };

    const handleDeleteQuestion = (questionId) => {
        if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
            router.delete(
                route('teacher.quizzes.questions.destroy', [lesson.id, quiz.id, questionId]),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['quiz'] });
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-gray-800">
                    Edit Kuis: {quiz.title}
                </h2>
            }
        >
            <Head title={`Edit Kuis - ${quiz.title}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('teacher.quizzes.index', lesson.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        ← Kembali ke Kuis
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quiz Settings */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Kuis</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Judul
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Durasi (menit)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nilai Lulus (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.passing_score}
                                            onChange={(e) => setData('passing_score', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Maksimal Percobaan
                                        </label>
                                        <input
                                            type="number"
                                            value={data.max_attempts}
                                            onChange={(e) => setData('max_attempts', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Aktif
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Pertanyaan ({questions.length})
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setEditingQuestion(null);
                                            setShowQuestionForm(true);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                    >
                                        ➕ Tambah Pertanyaan
                                    </button>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📝</div>
                                        <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                            Belum ada pertanyaan
                                        </h4>
                                        <p className="text-gray-600 mb-6">
                                            Tambahkan pertanyaan pertama Anda untuk memulai!
                                        </p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={questions.map((q) => q.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {questions.map((question) => (
                                                <SortableQuestion
                                                    key={question.id}
                                                    question={question}
                                                    onEdit={(q) => {
                                                        setEditingQuestion(q);
                                                        setShowQuestionForm(true);
                                                    }}
                                                    onDelete={handleDeleteQuestion}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
                <QuestionForm
                    lesson={lesson}
                    quiz={quiz}
                    question={editingQuestion}
                    onClose={() => {
                        setShowQuestionForm(false);
                        setEditingQuestion(null);
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}
