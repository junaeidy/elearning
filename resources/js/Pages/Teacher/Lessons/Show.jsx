import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import FunButton from '@/Components/FunButton';
import ChatBoxAdvanced from '@/Components/ChatBoxAdvanced';
import UploadProgressModal from '@/Components/UploadProgressModal';
import { motion } from 'framer-motion';
import {
    PencilIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    DocumentIcon,
    VideoCameraIcon,
    PhotoIcon,
    SpeakerWaveIcon,
    PresentationChartBarIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Show({ lesson, auth }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadType, setUploadType] = useState('pdf');
    const [enrollments, setEnrollments] = useState(lesson.enrollments || []);
    const [raisedHands, setRaisedHands] = useState([]);

    // Listen for realtime progress updates and hand raises
    useEffect(() => {
        const channel = window.Echo.private(`lesson.${lesson.id}`);

        channel.listen('.progress.updated', (e) => {
            // Update enrollment progress in realtime
            setEnrollments(prev => prev.map(enrollment => {
                if (enrollment.student.id === e.student_id) {
                    return {
                        ...enrollment,
                        progress_percentage: e.progress_percentage
                    };
                }
                return enrollment;
            }));
        });

        // Listen for hand raise
        channel.listen('.hand.raised', (e) => {
            if (e.is_raised) {
                // Add to raised hands list
                setRaisedHands(prev => {
                    const exists = prev.find(h => h.student.id === e.student.id);
                    if (!exists) {
                        // Show toast notification
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg bg-yellow-500 text-white font-semibold animate-slide-in-right';
                        toast.innerHTML = `<div class="flex items-center gap-2"><span class="text-2xl">✋</span><span>${e.student.name} mengangkat tangan!</span></div>`;
                        document.body.appendChild(toast);
                        
                        setTimeout(() => {
                            toast.style.opacity = '0';
                            toast.style.transition = 'opacity 0.3s';
                            setTimeout(() => toast.remove(), 300);
                        }, 4000);

                        return [...prev, { student: e.student, timestamp: e.timestamp }];
                    }
                    return prev;
                });

                // Auto remove after 30 seconds
                setTimeout(() => {
                    setRaisedHands(prev => prev.filter(h => h.student.id !== e.student.id));
                }, 30000);
            } else {
                // Remove from raised hands list
                setRaisedHands(prev => prev.filter(h => h.student.id !== e.student.id));
            }
        });

        return () => {
            window.Echo.leave(`lesson.${lesson.id}`);
        };
    }, [lesson.id]);

    const handleDismissHandRaise = (studentId) => {
        setRaisedHands(prev => prev.filter(h => h.student.id !== studentId));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: 'pdf',
        file: null,
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!data.file) {
            alert('Silakan pilih file untuk diunggah');
            return;
        }
        
        if (!data.title.trim()) {
            alert('Judul materi tidak boleh kosong');
            return;
        }
        
        // Set upload data and show progress modal
        setUploadFile(data.file);
        setUploadTitle(data.title);
        setUploadType(data.type);
        setShowUploadModal(false);
        setShowProgressModal(true);
    };
    
    const handleUploadSuccess = (material) => {
        // Reload page to show new material
        router.reload({ only: ['lesson'] });
        reset();
    };
    
    const handleCloseProgressModal = () => {
        setShowProgressModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadType('pdf');
    };

    const handleDeleteMaterial = (materialId) => {
        if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
            router.delete(route('teacher.lessons.materials.destroy', [lesson.id, materialId]));
        }
    };

    const handleToggleStatus = () => {
        router.post(route('teacher.lessons.toggle-status', lesson.id));
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Aktif' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Draft' },
            inactive: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Tidak Aktif' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Selesai' },
        };
        const badge = badges[status] || badges.draft;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
            </span>
        );
    };

    const getMaterialIcon = (type) => {
        const icons = {
            video: <VideoCameraIcon className="w-8 h-8 text-red-500" />,
            pdf: <DocumentIcon className="w-8 h-8 text-red-600" />,
            image: <PhotoIcon className="w-8 h-8 text-blue-500" />,
            audio: <SpeakerWaveIcon className="w-8 h-8 text-purple-500" />,
            slide: <PresentationChartBarIcon className="w-8 h-8 text-orange-500" />,
            document: <DocumentIcon className="w-8 h-8 text-gray-600" />,
        };
        return icons[type] || icons.document;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {lesson.title}
                            </h2>
                            {getStatusBadge(lesson.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                            📖 {lesson.subject} • 🔑 {lesson.lesson_code}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <FunButton
                            variant={lesson.status === 'active' ? 'warning' : 'success'}
                            size="md"
                            onClick={handleToggleStatus}
                        >
                            {lesson.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </FunButton>
                        <Link href={route('teacher.lessons.edit', lesson.id)}>
                            <FunButton variant="primary" size="md" icon="✏️">
                                Edit Pelajaran
                            </FunButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={lesson.title} />

            <div className="space-y-6">
                {/* Lesson Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="md:flex">
                        {/* Cover Image */}
                        <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            {lesson.cover_image_url ? (
                                <img
                                    src={lesson.cover_image_url}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-8xl">📚</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi</h3>
                            <p className="text-gray-600 mb-6 whitespace-pre-line">
                                {lesson.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {lesson.enrolled_count}/{lesson.max_students}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Siswa</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {lesson.materials_count}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Materi</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {lesson.quizzes_count}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Kuis</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {new Date(lesson.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Tanggal Mulai</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Materials Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            📁 Materi Pembelajaran ({lesson.materials.length})
                        </h3>
                        <FunButton
                            variant="primary"
                            size="md"
                            icon="➕"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Unggah Materi
                        </FunButton>
                    </div>

                    {lesson.materials.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📂</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Belum ada materi
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Unggah materi pembelajaran pertama Anda untuk memulai
                            </p>
                            <FunButton
                                variant="primary"
                                size="md"
                                onClick={() => setShowUploadModal(true)}
                            >
                                Unggah Materi
                            </FunButton>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lesson.materials.map((material, index) => (
                                <motion.div
                                    key={material.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {getMaterialIcon(material.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {material.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {material.file_size_formatted} • {material.type.toUpperCase()}
                                            </p>
                                            {material.description && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {material.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <a
                                            href={route('teacher.lessons.materials.download', [lesson.id, material.id])}
                                            className="flex-1"
                                        >
                                            <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Unduh
                                            </button>
                                        </a>
                                        <button
                                            onClick={() => handleDeleteMaterial(material.id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quizzes Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            📝 Kuis ({lesson.quizzes_count})
                        </h3>
                        <Link href={route('teacher.quizzes.index', lesson.id)}>
                            <FunButton variant="primary" size="md" icon="📝">
                                Kelola Kuis
                            </FunButton>
                        </Link>
                    </div>

                    {lesson.quizzes && lesson.quizzes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Belum ada kuis
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Buat kuis untuk menilai pemahaman siswa Anda
                            </p>
                            <Link href={route('teacher.quizzes.create', lesson.id)}>
                                <FunButton variant="primary" size="md">
                                    Buat Kuis Pertama
                                </FunButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lesson.quizzes && lesson.quizzes.map((quiz, index) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-xl p-6 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-2 text-lg">
                                                {quiz.title}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    quiz.is_active 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {quiz.is_active ? '✓ Aktif' : '○ Tidak Aktif'}
                                                </span>
                                                <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600">
                                                    ⏱ {quiz.duration_minutes} menit
                                                </span>
                                                <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600">
                                                    🎯 {quiz.passing_score}%
                                                </span>
                                            </div>
                                            {quiz.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {quiz.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div className="bg-white rounded-lg p-2 text-center">
                                            <div className="font-bold text-blue-600">
                                                {quiz.questions_count || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Pertanyaan</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                            <div className="font-bold text-purple-600">
                                                {quiz.attempts_count || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Percobaan</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={route('teacher.quizzes.show', [lesson.id, quiz.id])}
                                            className="flex-1"
                                        >
                                            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                Lihat Detail
                                            </button>
                                        </Link>
                                        <Link href={route('teacher.quizzes.edit', [lesson.id, quiz.id])}>
                                            <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Enrolled Students Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        👥 Siswa Terdaftar ({lesson.enrollments.length})
                    </h3>

                    {/* Raised Hands Alert */}
                    {raisedHands.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                                    <span className="text-2xl animate-bounce">✋</span>
                                    Siswa Mengangkat Tangan ({raisedHands.length})
                                </h4>
                            </div>
                            <div className="space-y-2">
                                {raisedHands.map((item, index) => (
                                    <div 
                                        key={item.student.id}
                                        className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                                                {item.student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.student.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDismissHandRaise(item.student.id)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            ✓ Dismiss
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {lesson.enrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Belum ada siswa terdaftar
                            </h4>
                            <p className="text-gray-600">
                                Bagikan kode pelajaran <strong>{lesson.lesson_code}</strong> ke siswa
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Siswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progres
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Terdaftar Pada
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                                        {enrollment.student.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {enrollment.student.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {enrollment.progress_percentage || 0}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(enrollment.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Chat Room Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                    <ChatBoxAdvanced 
                        lessonId={lesson.id}
                        currentUser={auth.user}
                        isTeacher={true}
                    />
                </motion.div>
            </div>

            {/* Upload Material Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">
                                📤 Unggah Materi
                            </h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
                            {/* Material Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Materi *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="contoh: Bab 1 - Pengenalan"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat tentang materi ini..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Material Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipe Materi *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="pdf">📄 Dokumen PDF</option>
                                    <option value="video">🎥 Video</option>
                                    <option value="image">🖼️ Gambar</option>
                                    <option value="audio">🔊 Audio</option>
                                    <option value="slide">📊 Presentasi</option>
                                    <option value="document">📝 Dokumen</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File *
                                </label>
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                                        dragActive
                                            ? 'border-purple-500 bg-purple-50'
                                            : errors.file
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="text-center">
                                        <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            {data.file ? (
                                                <span className="font-medium text-purple-600">
                                                    {data.file.name}
                                                </span>
                                            ) : (
                                                <>
                                                    Klik untuk mengunggah atau seret dan lepas
                                                    <br />
                                                    <span className="text-xs text-gray-500">
                                                        Ukuran file maksimal: 200MB
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {errors.file && (
                                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <FunButton
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Batal
                                </FunButton>
                                <FunButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    icon="📤"
                                    disabled={processing}
                                >
                                    {processing ? 'Mengunggah...' : 'Unggah Materi'}
                                </FunButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            
            {/* Upload Progress Modal */}
            <UploadProgressModal
                isOpen={showProgressModal}
                onClose={handleCloseProgressModal}
                file={uploadFile}
                title={uploadTitle}
                type={uploadType}
                lessonId={lesson.id}
                onSuccess={handleUploadSuccess}
            />
        </AuthenticatedLayout>
    );
}
