<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HandRaised implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $student;
    public $lessonId;
    public $isRaised;

    /**
     * Create a new event instance.
     */
    public function __construct(User $student, int $lessonId, bool $isRaised = true)
    {
        $this->student = $student;
        $this->lessonId = $lessonId;
        $this->isRaised = $isRaised;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('lesson.' . $this->lessonId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'hand.raised';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'student' => [
                'id' => $this->student->id,
                'name' => $this->student->name,
                'avatar' => $this->student->avatar,
            ],
            'is_raised' => $this->isRaised,
            'timestamp' => now()->toISOString(),
        ];
    }
}
