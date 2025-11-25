import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast from 'react-hot-toast';

export default function Index({ lesson, quizzes }) {
    const { flash } = usePage().props;

    const handleDelete = (quizId) => {
        if (confirm('Apakah Anda yakin ingin menghapus kuis ini?')) {
            router.delete(route('teacher.quizzes.destroy', [lesson.id, quizId]), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kuis berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus kuis!');
                },
            });
        }
    };

    const toggleActive = (quizId) => {
        router.post(route('teacher.quizzes.toggle-active', [lesson.id, quizId]), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Kuis untuk {lesson.title}
                        </h2>
                        <p className="text-sm text-gray-600">Kelola kuis untuk pelajaran ini</p>
                    </div>
                    <Link
                        href={route('teacher.quizzes.create', lesson.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        ✨ Buat Kuis
                    </Link>
                </div>
            }
        >
            <Head title={`Kuis - ${lesson.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back to Lesson */}
                    <Link
                        href={route('teacher.lessons.show', lesson.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        ← Kembali ke Pelajaran
                    </Link>

                    {quizzes.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Belum ada kuis
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Buat kuis pertama Anda untuk menilai pembelajaran siswa!
                            </p>
                            <Link
                                href={route('teacher.quizzes.create', lesson.id)}
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Buat Kuis Pertama
                            </Link>
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
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {quiz.title}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        quiz.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {quiz.is_active ? '✓ Aktif' : '○ Tidak Aktif'}
                                                </span>
                                            </div>
                                            {quiz.description && (
                                                <p className="text-gray-600 mb-4">
                                                    {quiz.description}
                                                </p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Pertanyaan:</span>
                                                    <span className="ml-2 font-semibold text-gray-800">
                                                        {quiz.questions_count}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Durasi:</span>
                                                    <span className="ml-2 font-semibold text-gray-800">
                                                        {quiz.duration_minutes} menit
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Nilai Lulus:</span>
                                                    <span className="ml-2 font-semibold text-gray-800">
                                                        {quiz.passing_score}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Percobaan:</span>
                                                    <span className="ml-2 font-semibold text-gray-800">
                                                        {quiz.attempts_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-6">
                                            <button
                                                onClick={() => toggleActive(quiz.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                    quiz.is_active
                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                                title={quiz.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                {quiz.is_active ? '⏸ Nonaktifkan' : '▶ Aktifkan'}
                                            </button>
                                            <Link
                                                href={route('teacher.quizzes.show', [lesson.id, quiz.id])}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                                            >
                                                👁 Lihat
                                            </Link>
                                            <Link
                                                href={route('teacher.quizzes.edit', [lesson.id, quiz.id])}
                                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                                            >
                                                ✏️ Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                                            >
                                                🗑 Hapus
                                            </button>
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
