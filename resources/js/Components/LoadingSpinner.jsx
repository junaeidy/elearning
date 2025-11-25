import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} border-4 border-purple-200 border-t-purple-600 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-1 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[...Array(columns)].map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...Array(rows)].map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {[...Array(columns)].map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SkeletonList({ items = 5, className = '' }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {[...Array(items)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow p-4">
                    <div className="animate-pulse flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonGrid({ items = 6, className = '' }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {[...Array(items)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="flex items-center justify-between pt-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function LoadingState({ type = 'spinner', ...props }) {
    const components = {
        spinner: LoadingSpinner,
        card: SkeletonCard,
        table: SkeletonTable,
        list: SkeletonList,
        grid: SkeletonGrid,
    };

    const Component = components[type] || LoadingSpinner;
    return <Component {...props} />;
}
