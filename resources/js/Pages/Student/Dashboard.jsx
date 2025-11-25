import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatsCard from '@/Components/StatsCard';
import EmptyState from '@/Components/EmptyState';
import FunButton from '@/Components/FunButton';
import { motion } from 'framer-motion';

export default function Dashboard({ enrolledLessons, recentAchievements, stats }) {
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Dashboard Siswa 🎓
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Lanjutkan perjalanan belajar Anda dan pantau kemajuan Anda!
                        </p>
                    </div>
                    <FunButton
                        variant="accent"
                        size="lg"
                        icon="➕"
                        onClick={() => window.location.href = '#'}
                    >
                        Gabung Kelas
                    </FunButton>
                </div>
            }
        >
            <Head title="Dashboard Siswa" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Stats Cards */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kemajuan Anda</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            icon="📚"
                            title="Kelas Terdaftar"
                            value={stats.total_enrolled}
                            bgGradient="from-purple-500 to-pink-500"
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                        <StatsCard
                            icon="✅"
                            title="Selesai"
                            value={stats.completed_lessons}
                            bgGradient="from-green-500 to-emerald-500"
                            iconBg="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <StatsCard
                            icon="📖"
                            title="Sedang Berjalan"
                            value={stats.in_progress}
                            bgGradient="from-blue-500 to-cyan-500"
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatsCard
                            icon="🏆"
                            title="Pencapaian"
                            value={stats.total_achievements}
                            bgGradient="from-orange-500 to-yellow-500"
                            iconBg="bg-orange-100"
                            iconColor="text-orange-600"
                        />
                    </div>
                </motion.div>

                {/* Enrolled Lessons */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Kelas Saya</h3>
                        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Lihat Semua →
                        </a>
                    </div>

                    {enrolledLessons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledLessons.map((lesson) => (
                                <motion.div
                                    key={lesson.id}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all"
                                >
                                    {/* Cover Image */}
                                    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
                                        {lesson.cover_image ? (
                                            <img 
                                                src={lesson.cover_image} 
                                                alt={lesson.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                📚
                                            </div>
                                        )}
                                        {lesson.completed && (
                                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <span>✓</span> Selesai
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                                                {lesson.subject}
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                                            {lesson.title}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {lesson.description}
                                        </p>

                                        {/* Teacher Info */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <img
                                                src={lesson.teacher.avatar}
                                                alt={lesson.teacher.name}
                                                className="w-8 h-8 rounded-full ring-2 ring-purple-100"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">
                                                {lesson.teacher.name}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progres</span>
                                                <span className="font-semibold text-purple-600">
                                                    {lesson.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${lesson.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <FunButton
                                            variant="primary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => window.location.href = '#'}
                                        >
                                            {lesson.completed ? 'Tinjau Ulang' : 'Lanjutkan Belajar'}
                                        </FunButton>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="🎒"
                            title="Belum terdaftar di kelas manapun"
                            description="Gabung kelas pertama Anda menggunakan kode kelas dari guru!"
                            actionLabel="Gabung Kelas"
                            actionIcon="➕"
                            onAction={() => window.location.href = '#'}
                        />
                    )}
                </motion.div>

                {/* Recent Achievements */}
                {recentAchievements.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pencapaian Terbaru 🏆</h3>
                            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                Lihat Semua →
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {recentAchievements.map((achievement) => (
                                <motion.div
                                    key={achievement.id}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 text-center border-2 border-transparent hover:border-yellow-200 transition-all"
                                >
                                    <div className="text-5xl mb-3">{achievement.icon}</div>
                                    <h4 className="font-bold text-gray-900 mb-1 text-sm">
                                        {achievement.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {achievement.description}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {achievement.earned_at}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.a
                            href="#"
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-purple-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                    📝
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Kerjakan Kuis</h4>
                                    <p className="text-sm text-gray-600">Uji pengetahuan Anda</p>
                                </div>
                            </div>
                        </motion.a>

                        <motion.a
                            href="#"
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                    📖
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Materi Belajar</h4>
                                    <p className="text-sm text-gray-600">Akses sumber belajar</p>
                                </div>
                            </div>
                        </motion.a>

                        <motion.a
                            href="#"
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-green-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                    🎓
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Sertifikat</h4>
                                    <p className="text-sm text-gray-600">Lihat pencapaian Anda</p>
                                </div>
                            </div>
                        </motion.a>
                    </div>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
