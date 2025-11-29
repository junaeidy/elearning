<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReacted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageId;
    public $userId;
    public $userName;
    public $reaction;
    public $action; // 'added' or 'removed'
    public $reactionCounts;

    /**
     * Create a new event instance.
     */
    public function __construct($messageId, $userId, $userName, $reaction, $action, $reactionCounts)
    {
        $this->messageId = $messageId;
        $this->userId = $userId;
        $this->userName = $userName;
        $this->reaction = $reaction;
        $this->action = $action;
        $this->reactionCounts = $reactionCounts;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('lesson.' . request()->route('lesson')->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.reacted';
    }
}
