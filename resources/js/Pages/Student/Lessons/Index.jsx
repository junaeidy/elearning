import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LessonCard from '@/Components/LessonCard';
import EmptyState from '@/Components/EmptyState';
import FunButton from '@/Components/FunButton';
import { motion } from 'framer-motion';

export default function Index({ lessons }) {
    const [filter, setFilter] = useState('all'); // all, in-progress, completed
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter lessons
    const filteredLessons = lessons.filter(lesson => {
        // Filter by status
        if (filter === 'completed' && !lesson.completed_at) return false;
        if (filter === 'in-progress' && (lesson.completed_at || lesson.progress_percentage === 0)) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                lesson.title.toLowerCase().includes(query) ||
                lesson.subject.toLowerCase().includes(query) ||
                lesson.teacher?.name.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Calculate stats
    const stats = {
        total: lessons.length,
        inProgress: lessons.filter(l => l.progress_percentage > 0 && !l.completed_at).length,
        completed: lessons.filter(l => l.completed_at).length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Kelas Saya 📚
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Kelola dan pantau semua kelas yang Anda ikuti
                        </p>
                    </div>
                    <Link href={route('student.lessons.join')}>
                        <FunButton
                            variant="primary"
                            size="lg"
                            icon="➕"
                        >
                            Gabung Kelas Baru
                        </FunButton>
                    </Link>
                </div>
            }
        >
            <Head title="Kelas Saya" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Stats Overview */}
                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Total Kelas</p>
                                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                                </div>
                                <div className="text-5xl opacity-50">📚</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Sedang Berjalan</p>
                                    <p className="text-4xl font-bold mt-2">{stats.inProgress}</p>
                                </div>
                                <div className="text-5xl opacity-50">📖</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Selesai</p>
                                    <p className="text-4xl font-bold mt-2">{stats.completed}</p>
                                </div>
                                <div className="text-5xl opacity-50">✅</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div variants={itemVariants}>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari kelas, mata pelajaran, atau guru..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                        🔍
                                    </div>
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                        filter === 'all'
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setFilter('in-progress')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                        filter === 'in-progress'
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Sedang Berjalan
                                </button>
                                <button
                                    onClick={() => setFilter('completed')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                        filter === 'completed'
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Lessons Grid */}
                <motion.div variants={itemVariants}>
                    {filteredLessons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLessons.map((lesson) => (
                                <LessonCard
                                    key={lesson.id}
                                    lesson={lesson}
                                    showProgress={true}
                                />
                            ))}
                        </div>
                    ) : lessons.length > 0 ? (
                        <EmptyState
                            icon="🔍"
                            title="Tidak ada kelas yang cocok"
                            description="Coba ubah filter atau kata kunci pencarian Anda"
                        />
                    ) : (
                        <EmptyState
                            icon="🎒"
                            title="Belum ada kelas"
                            description="Gabung kelas pertama Anda untuk mulai belajar!"
                            actionLabel="Gabung Kelas"
                            actionIcon="➕"
                            onAction={() => window.location.href = route('student.lessons.join')}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
