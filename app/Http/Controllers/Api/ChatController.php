<?php

namespace App\Http\Controllers\Api;

use App\Events\HandRaised;
use App\Events\MessageDeleted;
use App\Events\MessageReacted;
use App\Events\MessageRead as MessageReadEvent;
use App\Events\MessageSent;
use App\Events\UserMentioned;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\BannedUser;
use App\Models\ChatMessage;
use App\Models\FlaggedMessage;
use App\Models\Lesson;
use App\Models\MessageReaction;
use App\Models\MessageRead;
use App\Models\MutedUser;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ChatController extends Controller
{
    use AuthorizesRequests;
    /**
     * Get chat messages for a lesson
     */
    public function index(Request $request, Lesson $lesson)
    {
        // Check if user has access to this lesson
        $this->authorize('view', $lesson);

        $perPage = $request->get('per_page', 50);
        
        $messages = ChatMessage::where('lesson_id', $lesson->id)
            ->with(['sender:id,name,avatar', 'parentMessage.sender:id,name,avatar', 'deletedBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Format messages with reactions and read receipts
        $formattedMessages = $messages->items();
        foreach ($formattedMessages as $message) {
            $message->reactions = $message->getReactionCounts();
            $message->readBy = $message->reads()
                ->with('user:id,name')
                ->get()
                ->map(function($read) {
                    return [
                        'user_id' => $read->user_id,
                        'user_name' => $read->user->name,
                        'read_at' => $read->read_at,
                    ];
                });
            
            // Add deletion info
            if ($message->is_deleted && $message->deletedBy) {
                $message->deleted_by_name = $message->deletedBy->name;
                $message->deleted_by_teacher = $lesson->teacher_id === $message->deleted_by;
            }
        }

        return response()->json([
            'messages' => $formattedMessages,
            'has_more' => $messages->hasMorePages(),
            'next_page' => $messages->currentPage() + 1,
        ]);
    }

    /**
     * Store a new chat message
     */
    public function store(Request $request, Lesson $lesson)
    {
        // Check if user has access to this lesson
        $this->authorize('view', $lesson);

        // Check if user is banned
        $banned = BannedUser::where('lesson_id', $lesson->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if ($banned && $banned->isActive()) {
            return response()->json(['error' => 'You are banned from this chat'], 403);
        }

        // Check if user is muted
        $muted = MutedUser::where('lesson_id', $lesson->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if ($muted && $muted->isActive()) {
            return response()->json(['error' => 'You are muted in this chat'], 403);
        }

        $validated = $request->validate([
            'message' => 'required_without:voice|string|max:1000',
            'type' => 'sometimes|in:text,emoji,system,voice',
            'parent_message_id' => 'sometimes|exists:chat_messages,id',
            'voice' => 'required_without:message|file|mimes:webm,ogg,mp3,wav|max:10240', // 10MB max
            'voice_duration' => 'sometimes|integer|min:1|max:300', // 5 minutes max
        ]);

        // Parse mentions from message (e.g., @username or @John)
        $mentionedUserIds = [];
        $voiceUrl = null;
        $voiceDuration = null;

        // Handle voice message upload
        if ($request->hasFile('voice')) {
            $voiceFile = $request->file('voice');
            $filename = time() . '_' . Auth::id() . '.' . $voiceFile->getClientOriginalExtension();
            $path = $voiceFile->storeAs('voice_messages', $filename, 'public');
            $voiceUrl = '/storage/' . $path;
            $voiceDuration = $validated['voice_duration'] ?? null;
        } else {
            // Parse mentions only for text messages
            $mentionedUserIds = $this->parseMentions($validated['message'], $lesson);
        }

        $message = ChatMessage::create([
            'lesson_id' => $lesson->id,
            'sender_id' => Auth::id(),
            'message' => $validated['message'] ?? '[Voice Message]',
            'message_type' => $validated['type'] ?? ($voiceUrl ? 'voice' : 'text'),
            'parent_message_id' => $validated['parent_message_id'] ?? null,
            'mentioned_user_ids' => $mentionedUserIds,
            'voice_url' => $voiceUrl,
            'voice_duration' => $voiceDuration,
        ]);

        // Update parent thread count
        if ($message->parent_message_id) {
            ChatMessage::where('id', $message->parent_message_id)
                ->increment('thread_count');
        }

        // Load the sender and parent message relationships
        $message->load(['sender:id,name,avatar', 'parentMessage.sender:id,name,avatar']);

        // Broadcast the message to all users in the lesson
        broadcast(new MessageSent($message))->toOthers();

        // Notify mentioned users
        foreach ($mentionedUserIds as $userId) {
            broadcast(new UserMentioned($message, $userId, Auth::user()->name));
        }

        // Format response similar to broadcast
        $responseData = [
            'id' => $message->id,
            'lesson_id' => $message->lesson_id,
            'sender_id' => $message->sender_id,
            'message' => $message->message,
            'message_type' => $message->message_type,
            'type' => $message->message_type,
            'parent_message_id' => $message->parent_message_id,
            'thread_count' => $message->thread_count ?? 0,
            'mentioned_user_ids' => $message->mentioned_user_ids,
            'voice_url' => $message->voice_url,
            'voice_duration' => $message->voice_duration,
            'reactions' => [],
            'readBy' => [],
            'created_at' => $message->created_at->toISOString(),
            'sender' => [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'avatar' => $message->sender->avatar,
            ],
        ];

        // Add parent message if exists
        if ($message->parent_message_id && $message->parentMessage) {
            $responseData['parent_message'] = [
                'id' => $message->parentMessage->id,
                'message' => $message->parentMessage->message,
                'message_type' => $message->parentMessage->message_type,
                'sender' => [
                    'name' => $message->parentMessage->sender->name,
                ],
            ];
        }

        return response()->json([
            'message' => $responseData,
        ], 201);
    }

    /**
     * Delete a chat message
     */
    public function destroy(Lesson $lesson, ChatMessage $message)
    {
        $user = Auth::user();
        $isTeacher = $lesson->teacher_id === $user->id;
        $isOwner = $message->sender_id === $user->id;

        // Permission check:
        // - Students can only delete their own messages
        // - Teachers can delete any message in their lesson
        if (!$isOwner && !$isTeacher) {
            return response()->json(['error' => 'Anda tidak memiliki izin untuk menghapus pesan ini'], 403);
        }

        // Soft delete: mark as deleted instead of actually deleting
        $message->update([
            'is_deleted' => true,
            'deleted_by' => $user->id,
            'deleted_at' => now(),
        ]);

        // Broadcast message deletion to other users with teacher info
        broadcast(new MessageDeleted($message->id, $lesson->id, $isTeacher))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dihapus',
            'deleted_by_teacher' => $isTeacher,
        ]);
    }

    /**
     * Handle typing indicator
     * This method should be debounced on the client side
     */
    public function typing(Request $request, Lesson $lesson)
    {
        // Check if user has access to this lesson
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        // Broadcast typing status
        broadcast(new UserTyping(
            Auth::id(),
            Auth::user()->name,
            $lesson->id,
            $validated['is_typing']
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Raise hand in class
     */
    public function raiseHand(Request $request, Lesson $lesson)
    {
        // Check if user has access to this lesson
        $this->authorize('view', $lesson);

        broadcast(new HandRaised(
            Auth::user(),
            $lesson->id
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Get online users (would require presence channel)
     */
    public function onlineUsers(Lesson $lesson)
    {
        // Check if user has access to this lesson
        $this->authorize('view', $lesson);

        // This would typically use Pusher's presence channel features
        // For now, return a placeholder
        return response()->json([
            'online_users' => [],
        ]);
    }

    /**
     * Toggle reaction on a message
     */
    public function toggleReaction(Request $request, Lesson $lesson, ChatMessage $message)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'reaction' => 'required|string|max:10',
        ]);

        $reaction = MessageReaction::where('message_id', $message->id)
            ->where('user_id', Auth::id())
            ->where('reaction', $validated['reaction'])
            ->first();

        if ($reaction) {
            // Remove reaction
            $reaction->delete();
            $action = 'removed';
        } else {
            // Add reaction
            MessageReaction::create([
                'message_id' => $message->id,
                'user_id' => Auth::id(),
                'reaction' => $validated['reaction'],
            ]);
            $action = 'added';
        }

        // Get updated reaction counts
        $reactionCounts = $message->getReactionCounts();

        // Broadcast the reaction change
        broadcast(new MessageReacted(
            $message->id,
            Auth::id(),
            Auth::user()->name,
            $validated['reaction'],
            $action,
            $reactionCounts
        ))->toOthers();

        return response()->json([
            'action' => $action,
            'reaction_counts' => $reactionCounts,
        ]);
    }

    /**
     * Mark message(s) as read
     */
    public function markAsRead(Request $request, Lesson $lesson)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'exists:chat_messages,id',
        ]);

        $readAt = now();

        foreach ($validated['message_ids'] as $messageId) {
            MessageRead::firstOrCreate(
                [
                    'message_id' => $messageId,
                    'user_id' => Auth::id(),
                ],
                [
                    'read_at' => $readAt,
                ]
            );

            // Broadcast read receipt
            broadcast(new MessageReadEvent(
                $messageId,
                Auth::id(),
                Auth::user()->name,
                $readAt
            ))->toOthers();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Search messages
     */
    public function search(Request $request, Lesson $lesson)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'query' => 'required|string|min:1',
            'user_id' => 'sometimes|exists:users,id',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
        ]);

        $query = ChatMessage::where('lesson_id', $lesson->id)
            ->with('sender:id,name,avatar');

        // Search in message text
        $query->where('message', 'like', '%' . $validated['query'] . '%');

        // Filter by user
        if (isset($validated['user_id'])) {
            $query->where('sender_id', $validated['user_id']);
        }

        // Filter by date range
        if (isset($validated['date_from'])) {
            $query->where('created_at', '>=', $validated['date_from']);
        }

        if (isset($validated['date_to'])) {
            $query->where('created_at', '<=', $validated['date_to']);
        }

        $messages = $query->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Get replies to a message (threading)
     */
    public function getReplies(Lesson $lesson, ChatMessage $message)
    {
        $this->authorize('view', $lesson);

        $replies = ChatMessage::where('parent_message_id', $message->id)
            ->with('sender:id,name,avatar')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'replies' => $replies,
        ]);
    }

    /**
     * Get users in lesson (for mentions autocomplete)
     */
    public function getUsers(Lesson $lesson)
    {
        $this->authorize('view', $lesson);

        // Get teacher and enrolled students
        $users = User::where(function ($query) use ($lesson) {
                $query->where('id', $lesson->teacher_id)
                    ->orWhereHas('lessonEnrollments', function ($q) use ($lesson) {
                        $q->where('lesson_id', $lesson->id);
                    });
            })
            ->select('id', 'name', 'avatar')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Ban user from chat
     */
    public function banUser(Request $request, Lesson $lesson)
    {
        // Only teacher can ban
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'sometimes|string|max:500',
            'duration' => 'sometimes|integer|min:1', // minutes
        ]);

        $bannedUntil = isset($validated['duration']) 
            ? now()->addMinutes($validated['duration']) 
            : null;

        BannedUser::updateOrCreate(
            [
                'lesson_id' => $lesson->id,
                'user_id' => $validated['user_id'],
            ],
            [
                'banned_by' => Auth::id(),
                'reason' => $validated['reason'] ?? null,
                'banned_until' => $bannedUntil,
            ]
        );

        return response()->json(['success' => true]);
    }

    /**
     * Unban user
     */
    public function unbanUser(Request $request, Lesson $lesson)
    {
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        BannedUser::where('lesson_id', $lesson->id)
            ->where('user_id', $validated['user_id'])
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Mute user
     */
    public function muteUser(Request $request, Lesson $lesson)
    {
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'duration' => 'sometimes|integer|min:1', // minutes
        ]);

        $mutedUntil = isset($validated['duration']) 
            ? now()->addMinutes($validated['duration']) 
            : null;

        MutedUser::updateOrCreate(
            [
                'lesson_id' => $lesson->id,
                'user_id' => $validated['user_id'],
            ],
            [
                'muted_by' => Auth::id(),
                'muted_until' => $mutedUntil,
            ]
        );

        return response()->json(['success' => true]);
    }

    /**
     * Unmute user
     */
    public function unmuteUser(Request $request, Lesson $lesson)
    {
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        MutedUser::where('lesson_id', $lesson->id)
            ->where('user_id', $validated['user_id'])
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Flag a message
     */
    public function flagMessage(Request $request, Lesson $lesson, ChatMessage $message)
    {
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        FlaggedMessage::create([
            'message_id' => $message->id,
            'flagged_by' => Auth::id(),
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get flagged messages (teacher only)
     */
    public function getFlaggedMessages(Lesson $lesson)
    {
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flagged = FlaggedMessage::whereHas('message', function ($query) use ($lesson) {
            $query->where('lesson_id', $lesson->id);
        })
        ->with(['message.sender', 'flagger'])
        ->where('status', 'pending')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'flagged_messages' => $flagged,
        ]);
    }

    /**
     * Review flagged message
     */
    public function reviewFlag(Request $request, Lesson $lesson, FlaggedMessage $flag)
    {
        if ($lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:reviewed,dismissed',
        ]);

        $flag->update([
            'status' => $validated['status'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Helper: Parse mentions from message
     */
    private function parseMentions($messageText, $lesson)
    {
        // Match @username or @Name pattern
        preg_match_all('/@(\w+)/', $messageText, $matches);
        
        if (empty($matches[1])) {
            return [];
        }

        $mentionedNames = $matches[1];
        
        // Find users by name in this lesson
        $userIds = User::where(function ($query) use ($lesson) {
            $query->where('id', $lesson->teacher_id)
                ->orWhereHas('lessonEnrollments', function ($q) use ($lesson) {
                    $q->where('lesson_id', $lesson->id);
                });
        })
        ->where(function ($query) use ($mentionedNames) {
            foreach ($mentionedNames as $name) {
                $query->orWhere('name', 'like', '%' . $name . '%');
            }
        })
        ->pluck('id')
        ->toArray();

        return $userIds;
    }
}
