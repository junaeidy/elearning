import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ lesson, quiz, stats }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
                        <p className="text-sm text-gray-600">Statistik & Detail Kuis</p>
                    </div>
                    <Link
                        href={route('teacher.quizzes.edit', [lesson.id, quiz.id])}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        ✏️ Edit Kuis
                    </Link>
                </div>
            }
        >
            <Head title={`Detail Kuis - ${quiz.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('teacher.quizzes.index', lesson.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        ← Kembali ke Daftar Kuis
                    </Link>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90 mb-1">Total Percobaan</div>
                            <div className="text-4xl font-bold">{stats.total_attempts}</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90 mb-1">Nilai Rata-rata</div>
                            <div className="text-4xl font-bold">
                                {stats.average_score ? Math.round(stats.average_score) : 0}%
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90 mb-1">Nilai Tertinggi</div>
                            <div className="text-4xl font-bold">{stats.highest_score || 0}%</div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90 mb-1">Tingkat Kelulusan</div>
                            <div className="text-4xl font-bold">{stats.pass_rate}%</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quiz Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Detail Kuis</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Status</div>
                                        <div
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                                quiz.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {quiz.is_active ? '✓ Aktif' : '○ Tidak Aktif'}
                                        </div>
                                    </div>

                                    {quiz.description && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Deskripsi</div>
                                            <div className="text-gray-800">{quiz.description}</div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-sm text-gray-600">Durasi</div>
                                        <div className="text-gray-800 font-semibold">
                                            {quiz.duration_minutes} menit
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-600">Nilai Kelulusan</div>
                                        <div className="text-gray-800 font-semibold">
                                            {quiz.passing_score}%
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-600">Maks Percobaan</div>
                                        <div className="text-gray-800 font-semibold">
                                            {quiz.max_attempts}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-600">Total Pertanyaan</div>
                                        <div className="text-gray-800 font-semibold">
                                            {quiz.questions.length}
                                        </div>
                                    </div>

                                    {quiz.start_time && (
                                        <div>
                                            <div className="text-sm text-gray-600">Waktu Mulai</div>
                                            <div className="text-gray-800 font-semibold">
                                                {new Date(quiz.start_time).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    )}

                                    {quiz.end_time && (
                                        <div>
                                            <div className="text-sm text-gray-600">Waktu Selesai</div>
                                            <div className="text-gray-800 font-semibold">
                                                {new Date(quiz.end_time).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Attempts */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Percobaan Terbaru
                                </h3>

                                {quiz.attempts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📊</div>
                                        <p className="text-gray-600">Belum ada percobaan</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                        Siswa
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                        Nilai
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                        Status
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                        Percobaan
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                        Tanggal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quiz.attempts.map((attempt) => (
                                                    <tr
                                                        key={attempt.id}
                                                        className="border-b border-gray-100 hover:bg-gray-50"
                                                    >
                                                        <td className="py-3 px-4">
                                                            <div className="font-medium text-gray-800">
                                                                {attempt.student.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {attempt.student.email}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span
                                                                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                                                    attempt.score >= quiz.passing_score
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                }`}
                                                            >
                                                                {attempt.score}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {attempt.completed_at ? (
                                                                <span className="text-green-600 text-sm">
                                                                    ✓ Selesai
                                                                </span>
                                                            ) : (
                                                                <span className="text-orange-600 text-sm">
                                                                    ⏳ Sedang Berlangsung
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            #{attempt.attempt_number}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {new Date(attempt.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Questions Preview */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Pertanyaan ({quiz.questions.length})
                        </h3>

                        <div className="space-y-4">
                            {quiz.questions.map((question, index) => (
                                <div key={question.id} className="border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">
                                                {index + 1}.
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                {question.question_type.replace('_', ' ')}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {question.points} poin
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-800 font-medium mb-2">
                                        {question.question_text}
                                    </p>

                                    {question.options && question.options.length > 0 && (
                                        <div className="space-y-1 ml-6">
                                            {question.options.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className={`text-sm px-3 py-1 rounded ${
                                                        option.is_correct
                                                            ? 'bg-green-100 text-green-700 font-medium'
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
