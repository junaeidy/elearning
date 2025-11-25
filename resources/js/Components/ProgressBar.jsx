import { motion } from 'framer-motion';

export default function ProgressBar({ 
    percentage = 0, 
    showLabel = true,
    height = 'h-2',
    className = '',
    color = 'purple'
}) {
    const colors = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-yellow-500',
    };

    const gradient = colors[color] || colors.purple;
    const validPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-1">
                {showLabel && (
                    <span className="text-sm font-medium text-gray-700">
                        Progress
                    </span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                    {validPercentage}%
                </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
                <motion.div
                    className={`bg-gradient-to-r ${gradient} ${height} rounded-full shadow-lg`}
                    initial={{ width: 0 }}
                    animate={{ width: `${validPercentage}%` }}
                    transition={{ 
                        duration: 1,
                        ease: "easeOut"
                    }}
                />
            </div>
        </div>
    );
}
