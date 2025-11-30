import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import EmojiPicker from '@/Components/EmojiPicker';
import VoiceRecorder from '@/Components/VoiceRecorder';
import AudioPlayer from '@/Components/AudioPlayer';
import axios from 'axios';

export default function ChatBoxAdvanced({ lessonId, currentUser, isTeacher = false }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    
    // Advanced features state
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [users, setUsers] = useState([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [expandedThreads, setExpandedThreads] = useState(new Set());
    const [showModeration, setShowModeration] = useState(false);
    const [flaggedMessages, setFlaggedMessages] = useState([]);
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const messageInputRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100');
            setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
        }
    };

    // Load initial messages
    useEffect(() => {
        loadMessages();
        loadUsers();
        if (isTeacher) {
            loadFlaggedMessages();
        }
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

        // Listen for reactions
        channel.listen('.message.reacted', (e) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === e.messageId) {
                    return {
                        ...msg,
                        reactions: e.reactionCounts
                    };
                }
                return msg;
            }));
        });

        // Listen for read receipts
        channel.listen('.message.read', (e) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === e.messageId) {
                    return {
                        ...msg,
                        readBy: [...(msg.readBy || []), { user_id: e.userId, user_name: e.userName }]
                    };
                }
                return msg;
            }));
        });

        // Listen for message deletion
        channel.listen('.message.deleted', (e) => {
            setMessages(prev => prev.map(m => {
                if (m.id === e.message_id) {
                    return {
                        ...m,
                        is_deleted: true,
                        deleted_by_teacher: e.deleted_by_teacher,
                        sender_id: e.sender_id,
                        deleted_by: e.deleted_by,
                        deleted_at: new Date().toISOString()
                    };
                }
                return m;
            }));
        });

        // Listen for hand raise
        channel.listen('.hand.raised', (e) => {
            if (e.student.id !== currentUser.id) {
                showNotification(`✋ ${e.student.name} mengangkat tangan!`, 'warning');
            }
        });

        return () => {
            window.Echo.leave(`lesson.${lessonId}`);
        };
    }, [lessonId, currentUser.id]);

    // Listen for mentions on user channel
    useEffect(() => {
        const userChannel = window.Echo.private(`user.${currentUser.id}`);
        
        userChannel.listen('.user.mentioned', (e) => {
            showNotification(`@${e.mentionerName} menyebut Anda dalam pesan`, 'info');
        });

        return () => {
            window.Echo.leave(`user.${currentUser.id}`);
        };
    }, [currentUser.id]);

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
                // Mark messages as read
                markMessagesAsRead(response.data.messages.map(m => m.id));
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

    // Load users for mentions
    const loadUsers = async () => {
        try {
            const response = await axios.get(`/api/lessons/${lessonId}/users`);
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    // Load flagged messages (teacher only)
    const loadFlaggedMessages = async () => {
        try {
            const response = await axios.get(`/api/lessons/${lessonId}/flagged-messages`);
            setFlaggedMessages(response.data.flagged_messages);
        } catch (error) {
            console.error('Failed to load flagged messages:', error);
        }
    };

    // Mark messages as read
    const markMessagesAsRead = async (messageIds) => {
        if (messageIds.length === 0) return;
        
        try {
            await axios.post(`/api/lessons/${lessonId}/messages/mark-read`, {
                message_ids: messageIds
            });
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || sending) return;

        const messageToSend = newMessage.trim();
        setNewMessage('');
        setSending(true);
        sendTypingIndicator(false);

        try {
            const payload = {
                message: messageToSend,
                type: 'text'
            };
            
            if (replyingTo) {
                payload.parent_message_id = replyingTo.id;
            }

            const response = await axios.post(`/api/lessons/${lessonId}/messages`, payload);
            setMessages(prev => [...prev, response.data.message]);
            setTimeout(scrollToBottom, 100);
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(messageToSend);
        } finally {
            setSending(false);
        }
    };

    // Send voice message
    const handleVoiceMessage = async (audioBlob, duration) => {
        setSending(true);
        setShowVoiceRecorder(false);

        try {
            const formData = new FormData();
            formData.append('voice', audioBlob, 'voice-message.webm');
            formData.append('voice_duration', duration);
            formData.append('type', 'voice');
            
            if (replyingTo) {
                formData.append('parent_message_id', replyingTo.id);
            }

            const response = await axios.post(`/api/lessons/${lessonId}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessages(prev => [...prev, response.data.message]);
            setTimeout(scrollToBottom, 100);
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to send voice message:', error);
            alert('Gagal mengirim pesan suara. Silakan coba lagi.');
        } finally {
            setSending(false);
        }
    };

    // Handle typing with debounce and mentions detection
    const handleTyping = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        setNewMessage(value);
        setCursorPosition(cursorPos);

        // Check for @ mentions
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtSymbol !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
            // Check if there's no space after @
            if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
                setMentionQuery(textAfterAt);
                setShowMentions(true);
            } else if (lastAtSymbol === cursorPos - 1) {
                // Just typed @
                setMentionQuery('');
                setShowMentions(true);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }

        // Typing indicator
        if (value.length > 0 && !isTypingRef.current) {
            isTypingRef.current = true;
            sendTypingIndicator(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                sendTypingIndicator(false);
            }
        }, 2000);
    };

    // Send typing indicator
    const sendTypingIndicator = async (isTyping) => {
        try {
            await axios.post(`/api/lessons/${lessonId}/typing`, {
                is_typing: isTyping
            });
        } catch (error) {
            console.error('Failed to send typing indicator:', error);
        }
    };

    // Handle mention selection
    const handleMentionSelect = (user) => {
        const textBeforeCursor = newMessage.substring(0, cursorPosition);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = newMessage.substring(cursorPosition);
        
        // Use @[Full Name] format if name contains space, otherwise use @Name
        const mentionText = user.name.includes(' ') 
            ? `@[${user.name}]` 
            : `@${user.name}`;
        
        const newText = newMessage.substring(0, lastAtSymbol) + `${mentionText} ` + textAfterCursor;
        setNewMessage(newText);
        setShowMentions(false);
        messageInputRef.current?.focus();
    };

    // Delete message
    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Hapus pesan ini?')) return;

        try {
            const response = await axios.delete(`/api/lessons/${lessonId}/messages/${messageId}`);
            // Update message to show as deleted instead of removing it
            setMessages(prev => prev.map(m => {
                if (m.id === messageId) {
                    return {
                        ...m,
                        is_deleted: true,
                        deleted_by: currentUser.id,
                        deleted_by_teacher: response.data.deleted_by_teacher,
                        deleted_at: new Date().toISOString()
                    };
                }
                return m;
            }));
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert(error.response?.data?.error || 'Gagal menghapus pesan');
        }
    };

    // Toggle reaction
    const handleReaction = async (messageId, emoji) => {
        try {
            const response = await axios.post(`/api/lessons/${lessonId}/messages/${messageId}/react`, {
                reaction: emoji
            });
            
            // Update local state immediately for current user
            setMessages(prev => prev.map(msg => {
                if (msg.id === messageId) {
                    return {
                        ...msg,
                        reactions: response.data.reaction_counts
                    };
                }
                return msg;
            }));
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    // Search messages
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await axios.get(`/api/lessons/${lessonId}/messages/search`, {
                params: { query: searchQuery }
            });
            setSearchResults(response.data.messages);
        } catch (error) {
            console.error('Failed to search:', error);
        }
    };

    // Handle search result click - scroll to message
    const handleSearchResultClick = (messageId) => {
        // Close search results
        setSearchResults([]);
        setSearchQuery('');
        setShowSearch(false);
        
        // Scroll to the message
        scrollToMessage(messageId);
    };

    // Load thread replies
    const handleToggleThread = async (messageId) => {
        if (expandedThreads.has(messageId)) {
            setExpandedThreads(prev => {
                const newSet = new Set(prev);
                newSet.delete(messageId);
                return newSet;
            });
        } else {
            try {
                const response = await axios.get(`/api/lessons/${lessonId}/messages/${messageId}/replies`);
                // Update message with replies
                setMessages(prev => prev.map(msg => {
                    if (msg.id === messageId) {
                        return { ...msg, replies: response.data.replies };
                    }
                    return msg;
                }));
                setExpandedThreads(prev => new Set([...prev, messageId]));
            } catch (error) {
                console.error('Failed to load replies:', error);
            }
        }
    };

    // Flag message
    const handleFlagMessage = async (messageId) => {
        const reason = prompt('Alasan pelaporan:');
        if (!reason) return;

        try {
            await axios.post(`/api/lessons/${lessonId}/messages/${messageId}/flag`, {
                reason
            });
            showNotification('Pesan telah dilaporkan', 'success');
        } catch (error) {
            console.error('Failed to flag message:', error);
        }
    };

    // Ban user (teacher only)
    const handleBanUser = async (userId) => {
        const reason = prompt('Alasan ban:');
        const duration = prompt('Durasi (menit, kosongkan untuk permanen):');
        
        try {
            await axios.post(`/api/lessons/${lessonId}/ban-user`, {
                user_id: userId,
                reason,
                duration: duration ? parseInt(duration) : undefined
            });
            showNotification('User telah dibanned', 'success');
        } catch (error) {
            console.error('Failed to ban user:', error);
        }
    };

    // Mute user (teacher only)
    const handleMuteUser = async (userId) => {
        const duration = prompt('Durasi mute (menit, kosongkan untuk permanen):');
        
        try {
            await axios.post(`/api/lessons/${lessonId}/mute-user`, {
                user_id: userId,
                duration: duration ? parseInt(duration) : undefined
            });
            showNotification('User telah dimute', 'success');
        } catch (error) {
            console.error('Failed to mute user:', error);
        }
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        const colors = {
            info: 'from-blue-100 to-blue-500 text-blue-900',
            success: 'from-green-100 to-green-500 text-green-900',
            warning: 'from-yellow-100 to-orange-500 text-orange-900',
            error: 'from-red-100 to-red-500 text-red-900',
        };

        const notification = document.createElement('div');
        notification.className = `alert fixed top-4 right-4 z-50 max-w-sm shadow-lg px-4 py-3 rounded-lg bg-gradient-to-r ${colors[type]}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    };

    // Raise hand
    const handleRaiseHand = async () => {
        try {
            await axios.post(`/api/lessons/${lessonId}/raise-hand`);
            showNotification('✋ Tangan Anda telah diangkat!', 'success');
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

    // Render message with mentions highlighted
    const renderMessageText = (text) => {
        // Match both @[Full Name] and @username formats
        const parts = text.split(/(@\[[^\]]+\]|@\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                return (
                    <span key={index} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const messageGroups = groupMessagesByDate(messages);
    // Filter users: exclude current user and filter by mention query
    const filteredUsers = users.filter(u => 
        u.id !== currentUser.id && // Don't allow mentioning yourself
        u.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[700px] bg-white rounded-lg shadow-lg">
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-all"
                            title="Cari pesan"
                        >
                            🔍
                        </button>
                        {isTeacher && (
                            <button
                                onClick={() => setShowModeration(!showModeration)}
                                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-all"
                                title="Moderasi"
                            >
                                🛡️ Moderasi
                            </button>
                        )}
                        <button
                            onClick={handleRaiseHand}
                            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105"
                            title="Angkat tangan"
                        >
                            ✋ <span className="hidden sm:inline">Angkat Tangan</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Cari pesan..."
                            className="flex-1 px-3 py-1 rounded text-gray-800 text-sm"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm"
                        >
                            Cari
                        </button>
                    </div>
                )}

                {/* Moderation Panel */}
                {showModeration && isTeacher && (
                    <div className="mt-3 bg-white/10 rounded p-2 text-xs max-h-40 overflow-y-auto">
                        <div className="font-semibold mb-2">Pesan yang Dilaporkan ({flaggedMessages.length})</div>
                        {flaggedMessages.map(flag => (
                            <div key={flag.id} className="bg-white/10 rounded p-2 mb-2">
                                <div>Pesan: {flag.message.message}</div>
                                <div>Alasan: {flag.reason}</div>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() => handleBanUser(flag.message.sender_id)}
                                        className="bg-red-500 px-2 py-1 rounded text-xs"
                                    >
                                        Ban User
                                    </button>
                                    <button
                                        onClick={() => handleMuteUser(flag.message.sender_id)}
                                        className="bg-orange-500 px-2 py-1 rounded text-xs"
                                    >
                                        Mute User
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(flag.message.id)}
                                        className="bg-gray-500 px-2 py-1 rounded text-xs"
                                    >
                                        Hapus Pesan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-yellow-50 px-4 py-2 border-b max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">🔍 Hasil Pencarian ({searchResults.length})</span>
                        <button 
                            onClick={() => { setSearchResults([]); setSearchQuery(''); }} 
                            className="text-gray-600 hover:text-red-600 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-1">
                        {searchResults.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => handleSearchResultClick(msg.id)}
                                className="text-xs bg-white hover:bg-blue-50 rounded p-3 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300 group"
                            >
                                <div className="flex items-start gap-2">
                                    <img 
                                        src={msg.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}`}
                                        alt={msg.sender.name}
                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-800">{msg.sender.name}</span>
                                            <span className="text-gray-400 text-xs">
                                                {new Date(msg.created_at).toLocaleString('id-ID', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 line-clamp-2 group-hover:text-blue-700">
                                            {msg.message_type === 'voice' ? '🎤 Pesan Suara' : msg.message}
                                        </p>
                                    </div>
                                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        {Object.entries(messageGroups).map(([date, msgs]) => (
                            <div key={date}>
                                <div className="flex items-center justify-center my-4">
                                    <div className="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        {date}
                                    </div>
                                </div>

                                {msgs.map((message, index) => {
                                    const isOwnMessage = message.sender_id === currentUser.id;
                                    const prevMessage = msgs[index - 1];
                                    const showHeader = !prevMessage || prevMessage.sender_id !== message.sender_id;

                                    return (
                                        <div key={message.id} className="mb-3">
                                            <div className={`flex items-end gap-2 my-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
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
                                                <div id={`message-${message.id}`} className={`flex flex-col max-w-[70%] transition-colors duration-500 ${isOwnMessage ? 'items-end' : 'items-start'} relative`}>
                                                    {showHeader && !isOwnMessage && (
                                                        <span className="text-xs text-gray-600 mb-1 px-2">
                                                            {message.sender.name}
                                                        </span>
                                                    )}

                                    {/* Reply indicator - hide if parent message is deleted */}
                                    {message.parent_message_id && message.parent_message && !message.parent_message.is_deleted && (
                                        <div 
                                            onClick={() => scrollToMessage(message.parent_message_id)}
                                            className="text-xs bg-gray-100 border-l-4 border-indigo-400 px-3 py-2 mb-1 rounded cursor-pointer hover:bg-gray-200 transition-colors max-w-full"
                                        >
                                            <div className="flex items-center gap-1 text-indigo-600 font-medium mb-1">
                                                <span>↩️</span>
                                                <span>{message.parent_message.sender.name}</span>
                                            </div>
                                            <div className="text-gray-700 truncate">
                                                {message.parent_message.message_type === 'voice' 
                                                    ? '🎤 Pesan Suara' 
                                                    : message.parent_message.message.length > 50 
                                                        ? message.parent_message.message.substring(0, 50) + '...' 
                                                        : message.parent_message.message}
                                            </div>
                                        </div>
                                    )}                                                    <div className={`group relative px-3 py-2 rounded-xl ${
                                                        isOwnMessage
                                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}>
                                                        {/* Deleted Message */}
                                                        {message.is_deleted ? (
                                                            <div className={`italic ${
                                                                isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                                                            }`}>
                                                                <p className="text-sm">
                                                                    {message.deleted_by_teacher && message.sender_id !== message.deleted_by
                                                                        ? '🗑️ Pesan ini dihapus oleh guru'
                                                                        : '🗑️ Pesan ini dihapus'
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Voice Message */}
                                                                {message.message_type === 'voice' && message.voice_url ? (
                                                                    <AudioPlayer 
                                                                        audioUrl={message.voice_url} 
                                                                        duration={message.voice_duration}
                                                                    />
                                                                ) : (
                                                                    <p className="text-sm break-words">{renderMessageText(message.message)}</p>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {/* Reactions */}
                                                        {!message.is_deleted && message.reactions && Object.keys(message.reactions).length > 0 && (
                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                {Object.entries(message.reactions).map(([emoji, count]) => (
                                                                    <span key={emoji} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                                        {emoji} {count}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                                                            <span>{formatTime(message.created_at)}</span>
                                                            {isOwnMessage && message.readBy && message.readBy.length > 0 && (
                                                                <span title={`Dibaca oleh: ${message.readBy.map(r => r.user_name).join(', ')}`}>
                                                                    ✓✓
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Message actions - hide for deleted messages */}
                                                        {!message.is_deleted && (
                                                            <div className={`absolute -top-8 ${isOwnMessage ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10 whitespace-nowrap`}>
                                                                <button onClick={() => handleReaction(message.id, '👍')} className="hover:bg-gray-100 p-1 rounded" title="Reaksi">👍</button>
                                                                <button onClick={() => handleReaction(message.id, '❤️')} className="hover:bg-gray-100 p-1 rounded" title="Reaksi">❤️</button>
                                                                <button onClick={() => handleReaction(message.id, '😂')} className="hover:bg-gray-100 p-1 rounded" title="Reaksi">😂</button>
                                                                <button onClick={() => setReplyingTo(message)} className="hover:bg-gray-100 p-1 rounded text-xs" title="Balas">↩️</button>
                                                                <button onClick={() => handleFlagMessage(message.id)} className="hover:bg-gray-100 p-1 rounded text-xs" title="Laporkan">🚩</button>
                                                                {(isOwnMessage || isTeacher) && (
                                                                    <button onClick={() => handleDeleteMessage(message.id)} className="hover:bg-gray-100 p-1 rounded" title="Hapus">🗑️</button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Thread indicator */}
                                                    {message.thread_count > 0 && (
                                                        <button
                                                            onClick={() => handleToggleThread(message.id)}
                                                            className="text-xs text-blue-600 hover:underline mt-1 px-2"
                                                        >
                                                            {expandedThreads.has(message.id) ? '▼' : '▶'} {message.thread_count} balasan
                                                        </button>
                                                    )}

                                                    {/* Thread replies */}
                                                    {expandedThreads.has(message.id) && message.replies && (
                                                        <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-300 pl-2">
                                                            {message.replies.map(reply => (
                                                                <div key={reply.id} className="bg-gray-100 rounded p-2 text-sm">
                                                                    <div className="font-semibold text-xs">{reply.sender.name}</div>
                                                                    <div>{reply.message}</div>
                                                                    <div className="text-xs text-gray-500">{formatTime(reply.created_at)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
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
                                <span>{Array.from(typingUsers).join(', ')} sedang mengetik...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                {/* Reply indicator */}
                {replyingTo && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 mb-2 text-sm flex justify-between items-start">
                        <div className="flex-1">
                            <div className="font-medium text-indigo-700 mb-1">
                                ↩️ Membalas {replyingTo.sender.name}
                            </div>
                            <div className="text-gray-700">
                                {replyingTo.message_type === 'voice' 
                                    ? '🎤 Pesan Suara' 
                                    : replyingTo.message.length > 80 
                                        ? replyingTo.message.substring(0, 80) + '...' 
                                        : replyingTo.message}
                            </div>
                        </div>
                        <button 
                            onClick={() => setReplyingTo(null)} 
                            className="text-gray-500 hover:text-red-500 font-bold ml-2"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Mentions dropdown */}
                {showMentions && filteredUsers.length > 0 && (
                    <div className="bg-white border rounded shadow-lg mb-2 max-h-40 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleMentionSelect(user)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <img 
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{user.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    {/* Emoji Picker */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Emoji"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-2 left-0">
                                <EmojiPicker 
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Voice Recorder Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowVoiceRecorder(true)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Rekam pesan suara"
                        >
                            🎤
                        </button>
                    </div>

                    <div className="flex-1">
                        <textarea
                            ref={messageInputRef}
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Ketik pesan... (gunakan @ untuk mention)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="1"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                            disabled={sending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                        {sending ? '⏳' : '📤'}
                    </button>
                </form>
            </div>

            {/* Voice Recorder Modal */}
            {showVoiceRecorder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <VoiceRecorder 
                        onRecordingComplete={handleVoiceMessage}
                        onCancel={() => setShowVoiceRecorder(false)}
                    />
                </div>
            )}
        </div>
    );
}
