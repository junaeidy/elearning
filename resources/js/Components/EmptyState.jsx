import { motion } from 'framer-motion';
import FunButton from './FunButton';

export default function EmptyState({
    icon = '📭',
    title = 'No data found',
    description = 'Get started by creating your first item',
    actionLabel = null,
    onAction = null,
    actionIcon = null,
    className = ''
}) {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const iconVariants = {
        initial: { scale: 1, rotate: 0 },
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, -10, 10, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
            }
        }
    };

    return (
        <motion.div
            className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Emoji icon with animation */}
            <motion.div
                className="mb-6"
                variants={iconVariants}
                initial="initial"
                animate="animate"
            >
                <div className="text-8xl filter drop-shadow-lg">
                    {icon}
                </div>
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center max-w-md mb-8">
                {description}
            </p>

            {/* Action button */}
            {actionLabel && onAction && (
                <FunButton
                    onClick={onAction}
                    variant="primary"
                    size="lg"
                    icon={actionIcon}
                >
                    {actionLabel}
                </FunButton>
            )}

            {/* Decorative elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
        </motion.div>
    );
}
