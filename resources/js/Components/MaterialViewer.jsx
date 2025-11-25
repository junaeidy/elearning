import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FunButton from './FunButton';
import Modal from './Modal';

export default function MaterialViewer({ material, onClose }) {
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleClose = () => {
        setIsModalOpen(false);
        if (onClose) onClose();
    };

    const getFileIcon = (type) => {
        const icons = {
            video: '🎥',
            pdf: '📄',
            image: '🖼️',
            audio: '🎵',
            slide: '📊',
            document: '📝',
        };
        return icons[type] || '📎';
    };

    const renderContent = () => {
        const filePath = `/storage/${material.file_path}`;

        switch (material.type) {
            case 'video':
                return (
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                            controls
                            className="w-full h-full"
                            src={filePath}
                        >
                            Browser Anda tidak mendukung video.
                        </video>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={filePath}
                            className="w-full h-full"
                            title={material.title}
                        />
                    </div>
                );

            case 'image':
                return (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                        <img
                            src={filePath}
                            alt={material.title}
                            className="max-w-full max-h-[600px] object-contain rounded-lg"
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-12">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🎵</div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {material.title}
                            </h3>
                        </div>
                        <audio
                            controls
                            className="w-full"
                            src={filePath}
                        >
                            Browser Anda tidak mendukung audio.
                        </audio>
                    </div>
                );

            case 'slide':
            case 'document':
                return (
                    <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + filePath)}&embedded=true`}
                            className="w-full h-full"
                            title={material.title}
                        />
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4">📎</div>
                        <p className="text-gray-600 mb-6">
                            Tipe file ini tidak dapat ditampilkan di browser.
                        </p>
                        <a
                            href={route('teacher.lessons.materials.download', {
                                lesson: material.lesson_id,
                                material: material.id
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FunButton variant="primary" icon="⬇️">
                                Download File
                            </FunButton>
                        </a>
                    </div>
                );
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Modal show={isModalOpen} onClose={handleClose} maxWidth="4xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">
                            {getFileIcon(material.type)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {material.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-1">
                                    <span>📦</span>
                                    {formatFileSize(material.file_size)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span>📋</span>
                                    {material.mime_type}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    {renderContent()}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        <a
                            href={route('teacher.lessons.materials.download', {
                                lesson: material.lesson_id,
                                material: material.id
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FunButton variant="outline" size="sm" icon="⬇️">
                                Download
                            </FunButton>
                        </a>
                    </div>
                    <FunButton onClick={handleClose} variant="ghost" size="sm">
                        Tutup
                    </FunButton>
                </div>
            </div>
        </Modal>
    );
}
