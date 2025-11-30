<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProgressUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lessonId;
    public $studentId;
    public $progressPercentage;
    public $materialId;
    public $isCompleted;

    /**
     * Create a new event instance.
     */
    public function __construct(int $lessonId, int $studentId, int $progressPercentage, int $materialId, bool $isCompleted)
    {
        $this->lessonId = $lessonId;
        $this->studentId = $studentId;
        $this->progressPercentage = $progressPercentage;
        $this->materialId = $materialId;
        $this->isCompleted = $isCompleted;
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
        return 'progress.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'lesson_id' => $this->lessonId,
            'student_id' => $this->studentId,
            'progress_percentage' => $this->progressPercentage,
            'material_id' => $this->materialId,
            'is_completed' => $this->isCompleted,
        ];
    }
}
