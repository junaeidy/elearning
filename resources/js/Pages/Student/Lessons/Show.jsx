import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FunButton from '@/Components/FunButton';
import ProgressBar from '@/Components/ProgressBar';
import MaterialViewer from '@/Components/MaterialViewer';
import Modal from '@/Components/Modal';
import ChatBoxAdvanced from '@/Components/ChatBoxAdvanced';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Show({ lesson, enrollment, auth }) {
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [materials, setMaterials] = useState(lesson.materials || []);
    const [progressPercentage, setProgressPercentage] = useState(enrollment.progress_percentage);
    const [completedAt, setCompletedAt] = useState(enrollment.completed_at);

    // Listen for realtime progress updates
    useEffect(() => {
        const channel = window.Echo.private(`lesson.${lesson.id}`);

        channel.listen('.progress.updated', (e) => {
            // Update progress if it's for current user
            if (e.student_id === auth.user.id) {
                setProgressPercentage(e.progress_percentage);
                setCompletedAt(e.progress_percentage >= 100 ? new Date().toISOString() : null);
                
                // Update material completion status
                setMaterials(prev => prev.map(m => 
                    m.id === e.material_id 
                        ? { ...m, is_completed: e.is_completed }
                        : m
                ));
            }
        });

        return () => {
            window.Echo.leave(`lesson.${lesson.id}`);
        };
    }, [lesson.id, auth.user.id]);

    const handleToggleMaterialCompletion = async (materialId) => {
        const material = materials.find(m => m.id === materialId);
        const action = material?.is_completed ? 'membatalkan' : 'menandai';
        
        if (!confirm(`Apakah Anda yakin ingin ${action} materi "${material?.title}" sebagai selesai?`)) {
            return;
        }

        try {
            const response = await axios.post(
                `/api/lessons/${lesson.id}/materials/${materialId}/toggle-completion`
            );

            // Update local state immediately
            setMaterials(prev => prev.map(m => 
                m.id === materialId 
                    ? { ...m, is_completed: response.data.is_completed }
                    : m
            ));
            setProgressPercentage(response.data.progress_percentage);
            setCompletedAt(response.data.progress_percentage >= 100 ? new Date().toISOString() : null);

            // Show success message
            const message = response.data.is_completed 
                ? `✅ Materi "${material?.title}" ditandai selesai! Progress: ${response.data.progress_percentage}%`
                : `ℹ️ Status materi "${material?.title}" dibatalkan`;
            
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold animate-slide-in-right';
            toast.style.backgroundColor = response.data.is_completed ? '#10b981' : '#6b7280';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s';
                setTimeout(() => toast.remove(), 300);
            }, 3000);

            // Show celebration if completed all
            if (response.data.progress_percentage >= 100) {
                setTimeout(() => {
                    alert('🎉 Selamat! Anda telah menyelesaikan semua materi di kelas ini!');
                }, 500);
            }
        } catch (error) {
            console.error('Failed to toggle material completion:', error);
            alert('❌ Gagal mengupdate status materi: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleStartQuiz = (quizId) => {
        router.post(route('student.quiz-attempts.start', { lesson: lesson.id, quiz: quizId }));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const handleLeaveLesson = () => {
        router.delete(route('student.lessons.leave', lesson.id), {
            onSuccess: () => setShowLeaveModal(false),
        });
    };

    const getMaterialIcon = (type) => {
        const icons = {
            video: '🎥',
            pdf: '📄',
            image: '🖼️',
            audio: '🎵',
            slide: '📊',
            document: '📝',
        };
        return icons[type] || '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Link href={route('student.lessons.index')}>
                                <button className="text-gray-500 hover:text-gray-700 text-2xl">
                                    ←
                                </button>
                            </Link>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {lesson.title}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            {lesson.subject} • Bergabung sejak {formatDate(enrollment.enrolled_at)}
                        </p>
                    </div>
                    <FunButton
                        variant="warning"
                        size="md"
                        icon="🚪"
                        onClick={() => setShowLeaveModal(true)}
                    >
                        Keluar Kelas
                    </FunButton>
                </div>
            }
        >
            <Head title={lesson.title} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="relative h-64 bg-gradient-to-r from-purple-500 to-pink-500">
                            {lesson.cover_image ? (
                                <img
                                    src={`/storage/${lesson.cover_image}`}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-9xl">📚</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                        <img
                                            src={lesson.teacher?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lesson.teacher?.name || 'Teacher')}&background=FFFFFF&color=8B5CF6&size=64`}
                                            alt={lesson.teacher?.name || 'Teacher'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to UI Avatar
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lesson.teacher?.name || 'Teacher')}&background=FFFFFF&color=8B5CF6&size=64`;
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Guru</p>
                                        <p className="text-xl font-semibold">{lesson.teacher?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold">
                                    {lesson.subject}
                                </span>
                                <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
                                    📝 Kode: <span className="font-mono font-bold">{lesson.lesson_code}</span>
                                </span>
                                <span className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700">
                                    👥 {lesson.students_count} Siswa
                                </span>
                            </div>

                            <div className="prose max-w-none mb-6">
                                <p className="text-gray-700">{lesson.description}</p>
                            </div>

                            {/* Progress Section */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Progress Belajar Anda
                                    </h3>
                                    {completedAt && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-semibold">
                                            <span>🎉</span> Selesai
                                        </span>
                                    )}
                                </div>
                                <ProgressBar
                                    percentage={progressPercentage}
                                    showLabel={false}
                                    height="h-4"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                        💡 Tandai materi sebagai selesai untuk update progress
                                    </p>
                                    <p className="text-sm font-semibold text-purple-600">
                                        {materials.filter(m => m.is_completed).length} / {materials.length} Materi
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Materials Section */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>📚</span> Materi Pembelajaran
                                    </h3>
                                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                                        {materials?.length || 0} Materi
                                    </span>
                                </div>

                                {lesson.materials && lesson.materials.length > 0 ? (
                                    <div className="space-y-4">
                                        {materials.map((material, index) => (
                                            <motion.div
                                                key={material.id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`border-2 rounded-xl p-4 transition-all ${
                                                    material.is_completed 
                                                        ? 'border-green-300 bg-green-50' 
                                                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                                                        material.is_completed
                                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                    }`}>
                                                        {material.is_completed ? '✅' : getMaterialIcon(material.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`font-semibold mb-1 ${
                                                            material.is_completed ? 'text-green-800' : 'text-gray-900'
                                                        }`}>
                                                            {index + 1}. {material.title}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="capitalize">{material.type}</span>
                                                            <span>•</span>
                                                            <span>{formatFileSize(material.file_size)}</span>
                                                            {material.is_completed && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-green-600 font-semibold">✓ Selesai</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FunButton 
                                                            variant="outline" 
                                                            size="sm" 
                                                            icon="👁️"
                                                            onClick={() => setSelectedMaterial(material)}
                                                        >
                                                            Lihat
                                                        </FunButton>
                                                        <FunButton 
                                                            variant={material.is_completed ? 'success' : 'primary'}
                                                            size="sm" 
                                                            icon={material.is_completed ? '✅' : '☑️'}
                                                            onClick={() => handleToggleMaterialCompletion(material.id)}
                                                        >
                                                            {material.is_completed ? 'Selesai' : 'Tandai Selesai'}
                                                        </FunButton>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📭</div>
                                        <p className="text-gray-600">
                                            Belum ada materi yang tersedia
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quizzes Section */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>✍️</span> Quiz & Evaluasi
                                    </h3>
                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                        {lesson.quizzes?.length || 0} Quiz
                                    </span>
                                </div>

                                {lesson.quizzes && lesson.quizzes.length > 0 ? (
                                    <div className="space-y-4">
                                        {lesson.quizzes.map((quiz) => (
                                            <div
                                                key={quiz.id}
                                                className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-lg font-bold text-gray-900">
                                                                {quiz.title}
                                                            </h4>
                                                            {!quiz.is_active && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                                                    🔒 Belum Aktif
                                                                </span>
                                                            )}
                                                            {quiz.is_active && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                                    ✓ Aktif
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-4">
                                                            {quiz.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-3">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
                                                                <span>❓</span> {quiz.total_questions} Soal
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
                                                                <span>⏱️</span> {quiz.duration_minutes} Menit
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
                                                                <span>🎯</span> Passing: {quiz.passing_score}%
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
                                                                <span>🔄</span> {quiz.attempts_count}/{quiz.max_attempts} Percobaan
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {quiz.best_score !== null && (
                                                    <div className={`mb-4 p-4 rounded-lg ${
                                                        quiz.is_passed
                                                            ? 'bg-green-50 border border-green-200'
                                                            : 'bg-orange-50 border border-orange-200'
                                                    }`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Nilai Terbaik:
                                                            </span>
                                                            <span className={`text-2xl font-bold ${
                                                                quiz.is_passed ? 'text-green-600' : 'text-orange-600'
                                                            }`}>
                                                                {quiz.best_score}%
                                                                {quiz.is_passed && ' ✅'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    {!quiz.is_active ? (
                                                        <div className="w-full">
                                                            <FunButton
                                                                variant="ghost"
                                                                size="md"
                                                                disabled
                                                                className="w-full"
                                                            >
                                                                🔒 Quiz Belum Aktif
                                                            </FunButton>
                                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                                Quiz ini belum dimulai oleh guru
                                                            </p>
                                                        </div>
                                                    ) : quiz.can_attempt ? (
                                                        <FunButton
                                                            variant={quiz.best_score === null ? 'primary' : 'secondary'}
                                                            size="md"
                                                            icon="🚀"
                                                            onClick={() => handleStartQuiz(quiz.id)}
                                                        >
                                                            {quiz.best_score === null ? 'Mulai Quiz' : 'Coba Lagi'}
                                                        </FunButton>
                                                    ) : (
                                                        <FunButton
                                                            variant="ghost"
                                                            size="md"
                                                            disabled
                                                        >
                                                            Batas Percobaan Tercapai
                                                        </FunButton>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📝</div>
                                        <p className="text-gray-600">
                                            Belum ada quiz yang tersedia
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Informasi Kelas
                                </h3>
                                <div className="space-y-4">
                                    {lesson.start_date && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Mulai</p>
                                            <p className="font-semibold text-gray-900">
                                                {formatDate(lesson.start_date)}
                                            </p>
                                        </div>
                                    )}
                                    {lesson.end_date && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Berakhir</p>
                                            <p className="font-semibold text-gray-900">
                                                {formatDate(lesson.end_date)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Materi</p>
                                        <p className="font-semibold text-gray-900">
                                            {lesson.total_materials} Materi
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Quiz</p>
                                        <p className="font-semibold text-gray-900">
                                            {lesson.total_quizzes} Quiz
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Chat Room */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <ChatBoxAdvanced 
                                    lessonId={lesson.id}
                                    currentUser={auth.user}
                                    isTeacher={false}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Material Viewer Modal */}
            {selectedMaterial && (
                <MaterialViewer
                    material={selectedMaterial}
                    onClose={() => setSelectedMaterial(null)}
                />
            )}

            {/* Leave Lesson Modal */}
            <Modal show={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Keluar dari Kelas?
                        </h3>
                        <p className="text-gray-600">
                            Anda yakin ingin keluar dari kelas ini? Progress Anda akan hilang.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <FunButton
                            variant="ghost"
                            size="lg"
                            className="flex-1"
                            onClick={() => setShowLeaveModal(false)}
                        >
                            Batal
                        </FunButton>
                        <FunButton
                            variant="warning"
                            size="lg"
                            className="flex-1"
                            onClick={handleLeaveLesson}
                        >
                            Ya, Keluar
                        </FunButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
