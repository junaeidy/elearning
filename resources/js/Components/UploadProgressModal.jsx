import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadProgressModal({ 
    isOpen, 
    onClose, 
    file, 
    title, 
    type, 
    lessonId,
    onSuccess 
}) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        if (file && isOpen && uploadStatus === 'idle') {
            startUpload();
        }
    }, [file, isOpen]);

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds === Infinity) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startUpload = async () => {
        if (!file) return;

        setUploadStatus('uploading');
        setUploadProgress(0);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', type);

        const startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;

        try {
            const response = await axios.post(
                route('teacher.lessons.materials.store', lessonId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);

                        // Calculate upload speed
                        const currentTime = Date.now();
                        const timeDiff = (currentTime - lastTime) / 1000; // in seconds
                        const bytesDiff = progressEvent.loaded - lastLoaded;
                        
                        if (timeDiff > 0) {
                            const speed = bytesDiff / timeDiff; // bytes per second
                            setUploadSpeed(speed);

                            // Calculate time remaining
                            const bytesRemaining = progressEvent.total - progressEvent.loaded;
                            const remaining = bytesRemaining / speed;
                            setTimeRemaining(remaining);
                        }

                        lastLoaded = progressEvent.loaded;
                        lastTime = currentTime;
                    },
                }
            );

            if (response.data.success) {
                setUploadStatus('success');
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(response.data.material);
                    }
                    onClose();
                    // Reset state after closing
                    setTimeout(() => {
                        setUploadStatus('idle');
                        setUploadProgress(0);
                        setUploadSpeed(0);
                        setTimeRemaining(0);
                    }, 300);
                }, 1500);
            } else {
                setUploadStatus('error');
                setErrorMessage(response.data.message || 'Terjadi kesalahan saat mengunggah file.');
            }
        } catch (error) {
            setUploadStatus('error');
            
            console.error('Upload error:', error);
            console.error('Error response:', error.response);
            
            if (error.response?.status === 413) {
                // Parse the actual limits from error
                const errorData = error.response.data;
                let message = '⚠️ File terlalu besar untuk server.\n\n';
                
                if (typeof errorData === 'string' && errorData.includes('POST Content-Length')) {
                    const match = errorData.match(/POST Content-Length of (\d+) bytes exceeds the limit of (\d+) bytes/);
                    if (match) {
                        const fileSize = (parseInt(match[1]) / 1024 / 1024).toFixed(2);
                        const limit = (parseInt(match[2]) / 1024 / 1024).toFixed(2);
                        message += `📦 Ukuran file Anda: ${fileSize} MB\n`;
                        message += `🚫 Limit server saat ini: ${limit} MB\n\n`;
                    }
                }
                
                message += '✅ Solusi:\n';
                message += '1. Edit C:\\xampp\\php\\php.ini\n';
                message += '2. Ubah: post_max_size = 250M\n';
                message += '3. Restart Apache di XAMPP\n';
                message += '4. Coba upload lagi';
                
                setErrorMessage(message);
            } else if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors && Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setErrorMessage(error.response.data.message || 'Validasi gagal.');
                }
            } else if (error.code === 'ECONNABORTED') {
                setErrorMessage('Upload timeout. Koneksi terlalu lambat atau file terlalu besar.');
            } else if (error.message) {
                setErrorMessage(`Error: ${error.message}`);
            } else {
                setErrorMessage('Gagal mengunggah file. Silakan coba lagi.');
            }
        }
    };

    const handleRetry = () => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setErrorMessage('');
        setUploadSpeed(0);
        setTimeRemaining(0);
        startUpload();
    };

    const handleClose = () => {
        if (uploadStatus === 'uploading') {
            if (confirm('Upload sedang berlangsung. Apakah Anda yakin ingin membatalkan?')) {
                onClose();
                setTimeout(() => {
                    setUploadStatus('idle');
                    setUploadProgress(0);
                }, 300);
            }
        } else {
            onClose();
            setTimeout(() => {
                setUploadStatus('idle');
                setUploadProgress(0);
            }, 300);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold text-gray-900"
                                    >
                                        {uploadStatus === 'success' ? '✓ Upload Berhasil' : 
                                         uploadStatus === 'error' ? '✗ Upload Gagal' : 
                                         '📤 Mengunggah Materi'}
                                    </Dialog.Title>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={uploadStatus === 'uploading'}
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* File Info */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 text-2xl">
                                            {type === 'video' && '🎬'}
                                            {type === 'pdf' && '📄'}
                                            {type === 'image' && '🖼️'}
                                            {type === 'audio' && '🎵'}
                                            {type === 'slide' && '📊'}
                                            {type === 'document' && '📝'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {file ? formatBytes(file.size) : '--'} • {type.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Section */}
                                <AnimatePresence mode="wait">
                                    {uploadStatus === 'uploading' && (
                                        <motion.div
                                            key="uploading"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Progress
                                                    </span>
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {uploadProgress}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${uploadProgress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Upload Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                        Kecepatan
                                                    </div>
                                                    <div className="text-sm font-bold text-blue-600">
                                                        {formatBytes(uploadSpeed)}/s
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                        Waktu Tersisa
                                                    </div>
                                                    <div className="text-sm font-bold text-purple-600">
                                                        {formatTime(timeRemaining)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Loading Animation */}
                                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                                <div className="flex gap-1">
                                                    <motion.div
                                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    />
                                                    <motion.div
                                                        className="w-2 h-2 bg-purple-500 rounded-full"
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                    />
                                                    <motion.div
                                                        className="w-2 h-2 bg-pink-500 rounded-full"
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                    />
                                                </div>
                                                <span className="text-sm">Mengunggah file...</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {uploadStatus === 'success' && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="text-center py-6"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", delay: 0.2 }}
                                            >
                                                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                            </motion.div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                Upload Berhasil!
                                            </h4>
                                            <p className="text-gray-600">
                                                Materi telah berhasil diunggah ke pelajaran.
                                            </p>
                                        </motion.div>
                                    )}

                                    {uploadStatus === 'error' && (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <div className="text-center py-6">
                                                <ExclamationCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                    Upload Gagal
                                                </h4>
                                                <div className="text-red-600 mb-6 whitespace-pre-line text-left max-w-md mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
                                                    {errorMessage}
                                                </div>
                                                <button
                                                    onClick={handleRetry}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                                >
                                                    <ArrowPathIcon className="w-5 h-5" />
                                                    Coba Lagi
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
