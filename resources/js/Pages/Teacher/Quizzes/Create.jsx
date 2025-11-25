import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ lesson }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        duration_minutes: 30,
        passing_score: 70,
        max_attempts: 3,
        start_time: '',
        end_time: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.quizzes.store', lesson.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-gray-800">
                    Buat Kuis Baru untuk {lesson.title}
                </h2>
            }
        >
            <Head title={`Buat Kuis - ${lesson.title}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('teacher.quizzes.index', lesson.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        ← Kembali ke Kuis
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Kuis *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="contoh: Kuis Bab 1"
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Deskripsikan apa yang dicakup dalam kuis ini..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Grid for numeric inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Durasi (menit) *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                        min="1"
                                        max="300"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.duration_minutes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
                                    )}
                                </div>

                                {/* Passing Score */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nilai Lulus (%) *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.passing_score}
                                        onChange={(e) => setData('passing_score', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.passing_score && (
                                        <p className="mt-1 text-sm text-red-600">{errors.passing_score}</p>
                                    )}
                                </div>

                                {/* Max Attempts */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maksimal Percobaan *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.max_attempts}
                                        onChange={(e) => setData('max_attempts', parseInt(e.target.value))}
                                        min="1"
                                        max="10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.max_attempts && (
                                        <p className="mt-1 text-sm text-red-600">{errors.max_attempts}</p>
                                    )}
                                </div>
                            </div>

                            {/* Time Window */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    ⏰ Jadwal Kuis (Opsional)
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Tentukan kapan siswa dapat mengakses kuis ini. Biarkan kosong agar selalu tersedia.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            📅 Waktu Mulai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.start_time && (
                                            <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Siswa dapat mulai mengerjakan kuis dari waktu ini
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ⏰ Waktu Selesai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.end_time && (
                                            <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Kuis akan ditutup setelah waktu ini
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-900 font-semibold mb-1">
                                            Apa yang terjadi selanjutnya?
                                        </p>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>✓ Anda akan diarahkan untuk menambahkan pertanyaan</li>
                                            <li>✓ Kuis dimulai dalam status <strong>tidak aktif</strong></li>
                                            <li>✓ Aktifkan setelah menambahkan pertanyaan</li>
                                            <li>✓ Jadwal berlaku saat kuis aktif</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Membuat...' : '✨ Buat Kuis'}
                                </button>
                                <Link
                                    href={route('teacher.quizzes.index', lesson.id)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
