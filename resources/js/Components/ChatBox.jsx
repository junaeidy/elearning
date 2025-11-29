import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import EmojiPicker from '@/Components/EmojiPicker';
import axios from 'axios';

export default function ChatBox({ lessonId, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load initial messages
    useEffect(() => {
        loadMessages();
    }, [lessonId]);

    // Subscribe to Echo channel for realtime updates
    useEffect(() => {
        const channel = window.Echo.private(`lesson.${lessonId}`);

        // Listen for new messages
        channel.listen('.message.sent', (e) => {
            setMessages(prev => [...prev, e.message]);
            setTimeout(scrollToBottom, 100);
        });

        // Listen for typing indicators
        channel.listen('.user.typing', (e) => {
            if (e.user_id !== currentUser.id) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    if (e.is_typing) {
                        newSet.add(e.user_name);
                    } else {
                        newSet.delete(e.user_name);
                    }
                    return newSet;
                });

                // Auto-remove typing indicator after 3 seconds
                if (e.is_typing) {
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(e.user_name);
                            return newSet;
                        });
                    }, 3000);
                }
            }
        });

        // Listen for hand raise
        channel.listen('.hand.raised', (e) => {
            if (e.student.id !== currentUser.id) {
                // Show a nice animated notification
                const notification = document.createElement('div');
                notification.className = 'alert alert-warning fixed top-4 right-4 z-50 max-w-sm shadow-lg border-l-4 border-orange-400 animate-bounce';
                notification.style.cssText = `
                    animation: slideInRight 0.3s ease-out, bounce 0.6s ease-in-out 0.3s;
                    background: linear-gradient(135deg, #fef3c7, #f59e0b);
                    color: #92400e;
                    font-weight: 600;
                `;
                notification.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="text-2xl animate-pulse">✋</div>
                        <div>
                            <div class="font-bold">${e.student.name} mengangkat tangan!</div>
                            <div class="text-sm opacity-75">Meminta perhatian</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Add slide-in animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                if (!document.querySelector('#handRaiseAnimations')) {
                    style.id = 'handRaiseAnimations';
                    document.head.appendChild(style);
                }
                
                // Remove notification after 6 seconds with fade out
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                        notification.style.opacity = '0';
                        notification.style.transform = 'translateX(100%)';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 500);
                    }
                }, 6000);
            }
        });

        // Listen for message deletion
        channel.listen('.message.deleted', (e) => {
            setMessages(prev => prev.filter(m => m.id !== e.message_id));
        });

        return () => {
            channel.stopListening('.message.sent');
            channel.stopListening('.user.typing');
            channel.stopListening('.hand.raised');
            channel.stopListening('.message.deleted');
            window.Echo.leave(`lesson.${lessonId}`);
        };
    }, [lessonId, currentUser.id]);

    // Load messages
    const loadMessages = async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/lessons/${lessonId}/messages`, {
                params: { per_page: 50, page: pageNum }
            });
            
            if (pageNum === 1) {
                setMessages(response.data.messages.reverse());
                setTimeout(scrollToBottom, 100);
            } else {
                setMessages(prev => [...response.data.messages.reverse(), ...prev]);
            }
            
            setHasMore(response.data.has_more);
            setPage(response.data.next_page);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || sending) return;

        const messageToSend = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Stop typing indicator
        sendTypingIndicator(false);

        try {
            const response = await axios.post(`/api/lessons/${lessonId}/messages`, {
                message: messageToSend,
                type: 'text'
            });

            // Add message to local state (it will also come through Echo)
            setMessages(prev => [...prev, response.data.message]);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setNewMessage(messageToSend);
        } finally {
            setSending(false);
        }
    };

    // Handle typing with debounce
    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        // Debounce typing indicator - send only when user starts/stops typing
        // NOT on every keystroke
        if (e.target.value.length > 0 && !isTypingRef.current) {
            isTypingRef.current = true;
            sendTypingIndicator(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to mark as not typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                sendTypingIndicator(false);
            }
        }, 2000);
    };

    // Send typing indicator to server
    const sendTypingIndicator = async (isTyping) => {
        try {
            await axios.post(`/api/lessons/${lessonId}/typing`, {
                is_typing: isTyping
            });
        } catch (error) {
            console.error('Failed to send typing indicator:', error);
        }
    };

    // Delete message
    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Hapus pesan ini?')) return;

        try {
            await axios.delete(`/api/lessons/${lessonId}/messages/${messageId}`);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    // Raise hand
    const handleRaiseHand = async () => {
        try {
            await axios.post(`/api/lessons/${lessonId}/raise-hand`);
            
            // Show beautiful feedback notification
            const feedback = document.createElement('div');
            feedback.className = 'alert alert-success fixed top-4 left-4 z-50 max-w-sm shadow-lg animate-bounce';
            feedback.style.cssText = `
                background: linear-gradient(135deg, #dcfce7, #22c55e);
                color: #166534;
                font-weight: 600;
                animation: slideInLeft 0.3s ease-out, bounce 0.6s ease-in-out 0.3s;
            `;
            feedback.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-2xl animate-pulse">✋</div>
                    <div>
                        <div class="font-bold">Tangan Anda telah diangkat!</div>
                        <div class="text-sm opacity-75">Guru akan melihat permintaan Anda</div>
                    </div>
                </div>
            `;
            document.body.appendChild(feedback);
            
            // Add slide-in animation for feedback
            const feedbackStyle = document.createElement('style');
            feedbackStyle.textContent = `
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            if (!document.querySelector('#feedbackAnimations')) {
                feedbackStyle.id = 'feedbackAnimations';
                document.head.appendChild(feedbackStyle);
            }
            
            // Remove feedback after 4 seconds
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    feedback.style.opacity = '0';
                    feedback.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        if (feedback.parentNode) {
                            feedback.parentNode.removeChild(feedback);
                        }
                    }, 500);
                }
            }, 4000);
        } catch (error) {
            console.error('Failed to raise hand:', error);
        }
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Format time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Format date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hari ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        } else {
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(message => {
            const date = formatDate(message.created_at);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        💬 Chat Room
                        {typingUsers.size > 0 && (
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                {typingUsers.size} sedang mengetik...
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={handleRaiseHand}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1"
                        title="Angkat tangan untuk meminta perhatian"
                    >
                        <span className="animate-pulse">✋</span>
                        <span className="hidden sm:inline">Angkat Tangan</span>
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <button
                                onClick={() => loadMessages(page)}
                                className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                disabled={loading}
                            >
                                {loading ? 'Memuat...' : 'Muat pesan sebelumnya'}
                            </button>
                        )}

                        {Object.entries(messageGroups).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-4">
                                    <div className="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        {date}
                                    </div>
                                </div>

                                {/* Messages for this date */}
                                {msgs.map((message, index) => {
                                    const isOwnMessage = message.sender_id === currentUser.id;
                                    const prevMessage = msgs[index - 1];
                                    const showHeader = !prevMessage || prevMessage.sender_id !== message.sender_id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex items-end gap-2 my-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 w-8 h-8">
                                                {showHeader && !isOwnMessage && (
                                                    <img 
                                                        src={message.sender.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}&background=random`} 
                                                        alt={message.sender.name} 
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                )}
                                            </div>

                                            {/* Message bubble */}
                                            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                                {showHeader && !isOwnMessage && (
                                                    <span className="text-xs text-gray-600 mb-1 px-2">
                                                        {message.sender.name}
                                                    </span>
                                                )}
                                                <div
                                                    className={`group relative px-3 py-2 rounded-xl ${
                                                        isOwnMessage
                                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}
                                                >
                                                    <p className="text-sm break-words">{message.message}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                                                        <span>{formatTime(message.created_at)}</span>
                                                        {isOwnMessage && (
                                                            <button
                                                                onClick={() => handleDeleteMessage(message.id)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingUsers.size > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 italic px-2 mb-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span>
                                    {Array.from(typingUsers).join(', ')} sedang mengetik...
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    {/* Emoji Picker Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-2 left-0">
                                <EmojiPicker onSelect={handleEmojiSelect} />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Ketik pesan..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows="1"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                            disabled={sending}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                        {sending ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </span>
                        ) : (
                            '📤'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
