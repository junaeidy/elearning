import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import FunButton from '@/Components/FunButton';
import EmptyState from '@/Components/EmptyState';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Index({ lessons, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [subject, setSubject] = useState(filters.subject || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('teacher.lessons.index'), {
            search,
            status,
            subject,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setSubject('');
        router.get(route('teacher.lessons.index'));
    };

    const handleDelete = (lessonId) => {
        if (confirm('Apakah Anda yakin ingin menghapus pelajaran ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('teacher.lessons.destroy', lessonId));
        }
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
            </span>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Pelajaran Saya 📚
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Kelola semua pelajaran Anda di satu tempat
                        </p>
                    </div>
                    <Link href={route('teacher.lessons.create')}>
                        <FunButton variant="primary" size="lg" icon="➕">
                            Buat Pelajaran
                        </FunButton>
                    </Link>
                </div>
            }
        >
            <Head title="Pelajaran Saya" />

            <div className="space-y-6">
                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🔍 Cari
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari berdasarkan judul, deskripsi, kode..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📊 Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="draft">Draft</option>
                                    <option value="inactive">Tidak Aktif</option>
                                    <option value="completed">Selesai</option>
                                </select>
                            </div>

                            {/* Subject Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📖 Mata Pelajaran
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="contoh: Matematika, IPA"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <FunButton type="submit" variant="primary" size="md">
                                Terapkan Filter
                            </FunButton>
                            <FunButton type="button" variant="secondary" size="md" onClick={handleReset}>
                                Reset
                            </FunButton>
                        </div>
                    </form>
                </motion.div>

                {/* Lessons List */}
                {lessons.data.length === 0 ? (
                    <EmptyState
                        icon="📚"
                        title="Belum ada pelajaran"
                        description="Buat pelajaran pertama Anda untuk mulai mengajar!"
                        actionLabel="Buat Pelajaran"
                        actionUrl={route('teacher.lessons.create')}
                    />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {lessons.data.map((lesson) => (
                            <motion.div
                                key={lesson.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="md:flex">
                                    {/* Cover Image */}
                                    <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                        {lesson.cover_image ? (
                                            <img
                                                src={`/storage/${lesson.cover_image}`}
                                                alt={lesson.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl">📚</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {lesson.title}
                                                    </h3>
                                                    {getStatusBadge(lesson.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {lesson.description}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        📖 {lesson.subject}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        🔑 {lesson.lesson_code}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        👥 {lesson.enrolled_count}/{lesson.max_students} siswa
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📁 {lesson.materials_count} materi
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📝 {lesson.quizzes_count} kuis
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 ml-4">
                                                <Link href={route('teacher.lessons.show', lesson.id)}>
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                                <Link href={route('teacher.lessons.edit', lesson.id)}>
                                                    <button
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(lesson.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Pagination */}
                        {lessons.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {lessons.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-purple-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
