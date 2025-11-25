import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import FunButton from '@/Components/FunButton';
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

export default function Show({ lesson }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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
        post(route('teacher.lessons.materials.store', lesson.id), {
            forceFormData: true,
            onSuccess: () => {
                setShowUploadModal(false);
                reset();
            },
        });
    };

    const handleDeleteMaterial = (materialId) => {
        if (confirm('Are you sure you want to delete this material?')) {
            router.delete(route('teacher.lessons.materials.destroy', [lesson.id, materialId]));
        }
    };

    const handleToggleStatus = () => {
        router.post(route('teacher.lessons.toggle-status', lesson.id));
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Active' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Draft' },
            inactive: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Inactive' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Completed' },
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
                            {lesson.status === 'active' ? 'Deactivate' : 'Activate'}
                        </FunButton>
                        <Link href={route('teacher.lessons.edit', lesson.id)}>
                            <FunButton variant="primary" size="md" icon="✏️">
                                Edit Lesson
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
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 mb-6 whitespace-pre-line">
                                {lesson.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {lesson.enrolled_count}/{lesson.max_students}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Students</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {lesson.materials_count}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Materials</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {lesson.quizzes_count}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Quizzes</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {new Date(lesson.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">Start Date</div>
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
                            📁 Learning Materials ({lesson.materials.length})
                        </h3>
                        <FunButton
                            variant="primary"
                            size="md"
                            icon="➕"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Upload Material
                        </FunButton>
                    </div>

                    {lesson.materials.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📂</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                No materials yet
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Upload your first learning material to get started
                            </p>
                            <FunButton
                                variant="primary"
                                size="md"
                                onClick={() => setShowUploadModal(true)}
                            >
                                Upload Material
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
                                                Download
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

                {/* Enrolled Students Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        👥 Enrolled Students ({lesson.enrollments.length})
                    </h3>

                    {lesson.enrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                No students enrolled yet
                            </h4>
                            <p className="text-gray-600">
                                Share the lesson code <strong>{lesson.lesson_code}</strong> with students
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Enrolled At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lesson.enrollments.map((enrollment) => (
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {enrollment.student.email}
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
                                📤 Upload Material
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
                                    Material Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Chapter 1 - Introduction"
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
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of this material..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Material Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material Type *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="pdf">📄 PDF Document</option>
                                    <option value="video">🎥 Video</option>
                                    <option value="image">🖼️ Image</option>
                                    <option value="audio">🔊 Audio</option>
                                    <option value="slide">📊 Presentation</option>
                                    <option value="document">📝 Document</option>
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
                                                    Click to upload or drag and drop
                                                    <br />
                                                    <span className="text-xs text-gray-500">
                                                        Max file size: 100MB
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
                                    Cancel
                                </FunButton>
                                <FunButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    icon="📤"
                                    disabled={processing}
                                >
                                    {processing ? 'Uploading...' : 'Upload Material'}
                                </FunButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
