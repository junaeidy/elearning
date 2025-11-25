import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

export default function Notification() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [type, setType] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (flash.success || flash.error || flash.info) {
            const flashType = flash.success ? 'success' : flash.error ? 'error' : 'info';
            const flashMessage = flash.success || flash.error || flash.info;
            
            setType(flashType);
            setMessage(flashMessage);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000); // Hide after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const notificationStyles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
            text: 'text-green-800',
            title: 'Success!',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-400',
            icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
            text: 'text-red-800',
            title: 'Error!',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            icon: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
            text: 'text-blue-800',
            title: 'Information',
        },
    };

    const currentStyle = type ? notificationStyles[type] : null;

    return (
        <div className="fixed top-24 right-5 z-[100] max-w-2xl w-auto">
            <AnimatePresence>
                {visible && currentStyle && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`min-w-[400px] rounded-xl border-2 ${currentStyle.border} ${currentStyle.bg} p-5 shadow-2xl`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-0.5">
                                {currentStyle.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-base font-bold ${currentStyle.text} mb-1`}>{currentStyle.title}</p>
                                <p className={`text-sm ${currentStyle.text} leading-relaxed break-words`}>{message}</p>
                            </div>
                            <div className="ml-4 flex flex-shrink-0">
                                <button
                                    onClick={() => setVisible(false)}
                                    className={`inline-flex rounded-md ${currentStyle.bg} text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
