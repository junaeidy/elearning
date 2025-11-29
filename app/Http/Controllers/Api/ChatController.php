<?php

namespace App\Http\Controllers\Api;

use App\Events\HandRaised;
use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Lesson;
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
            ->with('sender:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'messages' => $messages->items(),
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

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'type' => 'sometimes|in:text,emoji,system',
        ]);

        $message = ChatMessage::create([
            'lesson_id' => $lesson->id,
            'sender_id' => Auth::id(),
            'message' => $validated['message'],
            'message_type' => $validated['type'] ?? 'text',
        ]);

        // Load the sender relationship
        $message->load('sender:id,name,avatar');

        // Broadcast the message to all users in the lesson
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => [
                'id' => $message->id,
                'lesson_id' => $message->lesson_id,
                'sender_id' => $message->sender_id,
                'message' => $message->message,
                'type' => $message->message_type,
                'created_at' => $message->created_at->toISOString(),
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ],
            ],
        ], 201);
    }

    /**
     * Delete a chat message
     */
    public function destroy(Lesson $lesson, ChatMessage $message)
    {
        // Check if user owns the message or is the teacher
        if ($message->sender_id !== Auth::id() && $lesson->teacher_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messageId = $message->id;
        $message->delete();

        // Broadcast message deletion to other users
        broadcast(new MessageDeleted($messageId, $lesson->id))->toOthers();

        return response()->json(['success' => true]);
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
}
