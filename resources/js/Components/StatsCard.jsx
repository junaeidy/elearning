import { motion } from 'framer-motion';

export default function StatsCard({ 
    icon,
    title,
    value,
    trend = null,
    trendDirection = 'up',
    bgGradient = 'from-purple-500 to-pink-500',
    iconBg = 'bg-purple-100',
    iconColor = 'text-purple-600',
    className = ''
}) {
    const cardVariants = {
        initial: { scale: 1, y: 0 },
        hover: { 
            scale: 1.05,
            y: -5,
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
    };

    const getTrendColor = () => {
        if (trendDirection === 'up') return 'text-green-600';
        if (trendDirection === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    const getTrendIcon = () => {
        if (trendDirection === 'up') return '↑';
        if (trendDirection === 'down') return '↓';
        return '→';
    };

    return (
        <motion.div
            className={`relative overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
        >
            {/* Gradient background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-5`}></div>
            
            <div className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                            {trend && (
                                <span className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
                                    <span className="mr-1">{getTrendIcon()}</span>
                                    {trend}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Icon container */}
                    <motion.div 
                        className={`flex items-center justify-center w-14 h-14 rounded-xl ${iconBg} ${iconColor} shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-2xl">{icon}</span>
                    </motion.div>
                </div>
            </div>

            {/* Bottom accent border */}
            <div className={`h-1 bg-gradient-to-r ${bgGradient}`}></div>
        </motion.div>
    );
}
