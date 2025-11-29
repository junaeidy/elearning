<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatMessage $message)
    {
        $this->message = $message->load('sender:id,name,avatar');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('lesson.' . $this->message->lesson_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $messageData = [
            'id' => $this->message->id,
            'lesson_id' => $this->message->lesson_id,
            'sender_id' => $this->message->sender_id,
            'message' => $this->message->message,
            'message_type' => $this->message->message_type,
            'type' => $this->message->message_type,
            'created_at' => $this->message->created_at->toISOString(),
            'parent_message_id' => $this->message->parent_message_id,
            'thread_count' => $this->message->thread_count ?? 0,
            'voice_url' => $this->message->voice_url,
            'voice_duration' => $this->message->voice_duration,
            'mentioned_user_ids' => $this->message->mentioned_user_ids,
            'reactions' => [],
            'readBy' => [],
            'sender' => [
                'id' => $this->message->sender->id,
                'name' => $this->message->sender->name,
                'avatar' => $this->message->sender->avatar,
            ],
        ];

        // Add parent message if exists
        if ($this->message->parent_message_id && $this->message->parentMessage) {
            $messageData['parent_message'] = [
                'id' => $this->message->parentMessage->id,
                'message' => $this->message->parentMessage->message,
                'message_type' => $this->message->parentMessage->message_type,
                'sender' => [
                    'name' => $this->message->parentMessage->sender->name,
                ],
            ];
        }

        return [
            'message' => $messageData,
        ];
    }
}
