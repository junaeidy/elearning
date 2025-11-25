import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function LessonCard({ lesson, showProgress = true }) {
    const getStatusBadge = () => {
        if (lesson.completed_at) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <span>✅</span> Selesai
                </span>
            );
        }
        
        if (lesson.progress_percentage > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <span>📖</span> Sedang Berjalan
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                <span>🆕</span> Baru
            </span>
        );
    };

    const cardVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.02,
            y: -4,
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            className="group"
        >
            <Link href={route('student.lessons.show', lesson.id)}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-purple-300 transition-colors duration-200">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                        {lesson.cover_image ? (
                            <img
                                src={`/storage/${lesson.cover_image}`}
                                alt={lesson.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">📚</span>
                            </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {getStatusBadge()}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Subject Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700">
                                {lesson.subject}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {lesson.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {lesson.description}
                        </p>

                        {/* Teacher Info */}
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                                {lesson.teacher ? (
                                    <img
                                        src={lesson.teacher.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lesson.teacher.name || 'Teacher')}&background=4299E1&color=fff&size=40`}
                                        alt={lesson.teacher.name || 'Teacher'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to UI Avatar
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lesson.teacher.name || 'Teacher')}&background=4299E1&color=fff&size=40`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-xl">👤</span>
                                )}
                            </div>
                            {lesson.teacher && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {lesson.teacher.name}
                                    </p>
                                    <p className="text-xs text-gray-500">Guru</p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-lg">📄</span>
                                <span className="text-sm">
                                    {lesson.materials_count || 0} Materi
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-lg">✍️</span>
                                <span className="text-sm">
                                    {lesson.quizzes_count || 0} Quiz
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {showProgress && (
                            <div className="mt-4">
                                <ProgressBar 
                                    percentage={lesson.progress_percentage || 0}
                                    showLabel={false}
                                    color="purple"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
