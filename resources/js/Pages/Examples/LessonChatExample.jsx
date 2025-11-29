import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ChatBox from '@/Components/ChatBox';

/**
 * Example page showing how to integrate ChatBox component
 * 
 * This would typically be part of Student/Lessons/Show.jsx or Teacher/Lessons/Show.jsx
 */
export default function LessonChatExample({ auth, lesson }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {lesson.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Kode: {lesson.lesson_code} • {lesson.subject}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Chat - ${lesson.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Lesson Info Card */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">📚 Informasi Pelajaran</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Pengajar:</strong> {lesson.teacher.name}</p>
                                        <p><strong>Status:</strong> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                lesson.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {lesson.status === 'active' ? '🟢 Aktif' : '⚪ Tidak Aktif'}
                                            </span>
                                        </p>
                                        <p><strong>Jumlah Siswa:</strong> {lesson.enrolled_count} / {lesson.max_students}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">📖 Materi Pelajaran</h3>
                                    {lesson.materials && lesson.materials.length > 0 ? (
                                        <div className="space-y-2">
                                            {lesson.materials.map((material, index) => (
                                                <div key={material.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <span className="text-2xl mr-3">
                                                        {material.type === 'video' && '🎥'}
                                                        {material.type === 'pdf' && '📄'}
                                                        {material.type === 'image' && '🖼️'}
                                                        {material.type === 'audio' && '🎵'}
                                                        {material.type === 'slide' && '📊'}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{material.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(material.file_size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                                                        Download
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-4xl mb-2">📭</p>
                                            <p className="text-sm">Belum ada materi tersedia</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chat Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <ChatBox 
                                    lessonId={lesson.id}
                                    currentUser={auth.user}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
