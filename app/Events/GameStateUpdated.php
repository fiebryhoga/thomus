<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $state;

    public function __construct($roomId, $state)
    {
        $this->roomId = $roomId;
        $this->state = $state;
    }

    public function broadcastOn()
    {
        // Sesuaikan dengan nama channel di frontend-mu
        return new PresenceChannel('poker-room.' . $this->roomId);
    }
}