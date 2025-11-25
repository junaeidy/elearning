import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatsCard from '@/Components/StatsCard';
import EmptyState from '@/Components/EmptyState';
import FunButton from '@/Components/FunButton';
import { motion } from 'framer-motion';

export default function Dashboard({ stats, recentLessons }) {
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

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-800 border-green-200',
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            archived: 'bg-red-100 text-red-800 border-red-200',
        };
        return badges[status] || badges.draft;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Teacher Dashboard 👨‍🏫
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Welcome back! Here's an overview of your teaching activities.
                        </p>
                    </div>
                    <FunButton
                        variant="primary"
                        size="lg"
                        icon="➕"
                        onClick={() => window.location.href = '#'}
                    >
                        Create New Lesson
                    </FunButton>
                </div>
            }
        >
            <Head title="Teacher Dashboard" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Stats Cards */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            icon="📚"
                            title="Total Lessons"
                            value={stats.total_lessons}
                            bgGradient="from-purple-500 to-pink-500"
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                        <StatsCard
                            icon="✅"
                            title="Active Lessons"
                            value={stats.active_lessons}
                            bgGradient="from-green-500 to-emerald-500"
                            iconBg="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <StatsCard
                            icon="👥"
                            title="Total Students"
                            value={stats.total_students}
                            bgGradient="from-blue-500 to-cyan-500"
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatsCard
                            icon="📝"
                            title="Total Quizzes"
                            value={stats.total_quizzes}
                            bgGradient="from-orange-500 to-yellow-500"
                            iconBg="bg-orange-100"
                            iconColor="text-orange-600"
                        />
                    </div>
                </motion.div>

                {/* Recent Lessons */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Lessons</h3>
                        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </a>
                    </div>

                    {recentLessons.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Lesson
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Students
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentLessons.map((lesson) => (
                                            <motion.tr
                                                key={lesson.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                whileHover={{ backgroundColor: '#f9fafb' }}
                                                className="transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {lesson.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {lesson.subject}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="px-2 py-1 text-xs font-mono bg-purple-100 text-purple-700 rounded">
                                                        {lesson.lesson_code}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(lesson.status)}`}>
                                                        {lesson.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-2">
                                                            {lesson.students.slice(0, 3).map((student, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={student.avatar}
                                                                    alt={student.name}
                                                                    className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-purple-100"
                                                                    title={student.name}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {lesson.enrollments_count}/{lesson.max_students}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {lesson.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="text-purple-600 hover:text-purple-900 transition-colors">
                                                            <span className="text-lg">👁️</span>
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                                            <span className="text-lg">✏️</span>
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 transition-colors">
                                                            <span className="text-lg">🗑️</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <EmptyState
                            icon="📚"
                            title="No lessons yet"
                            description="Start creating engaging lessons for your students. Click the button above to create your first lesson!"
                            actionLabel="Create Your First Lesson"
                            actionIcon="➕"
                            onAction={() => window.location.href = '#'}
                        />
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
                                    <h4 className="font-semibold text-gray-900">Create Quiz</h4>
                                    <p className="text-sm text-gray-600">Add a new quiz to your lesson</p>
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
                                    📁
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Upload Material</h4>
                                    <p className="text-sm text-gray-600">Share resources with students</p>
                                </div>
                            </div>
                        </motion.a>

                        <motion.a
                            href={route('teacher.students.index')}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-green-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                    👥
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Manage Students</h4>
                                    <p className="text-sm text-gray-600">View and manage enrollments</p>
                                </div>
                            </div>
                        </motion.a>
                    </div>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
