import React from 'react';
import { motion } from 'framer-motion';

const emojis = [
    { category: 'Smileys', items: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'] },
    { category: 'Gestures', items: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝'] },
    { category: 'Emotions', items: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    { category: 'Objects', items: ['📚', '📖', '✏️', '📝', '📊', '📈', '📉', '🎯', '🎓', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '✨', '🔥', '💯'] },
    { category: 'Faces', items: ['🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜'] },
];

export default function EmojiPicker({ onSelect, onClose }) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Picker */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 overflow-hidden"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
                    <span className="font-semibold text-sm">Pilih Emoji</span>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Emoji grid */}
                <div className="overflow-y-auto max-h-80 p-3 space-y-4">
                    {emojis.map((category) => (
                        <div key={category.category}>
                            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                {category.category}
                            </h3>
                            <div className="grid grid-cols-9 gap-1">
                                {category.items.map((emoji, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => onSelect(emoji)}
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors"
                                        title={emoji}
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </>
    );
}
