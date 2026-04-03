<?php

namespace App\Events;

use App\Models\GameRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// ShouldBroadcastNow memastikan data dikirim secara instan tanpa delay antrean (queue)
class GameStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $room;

    public function __construct(GameRoom $room)
    {
        $this->room = $room;
    }

    public function broadcastOn(): array
    {
        // Harus sama dengan nama channel yang dilisten oleh React
        return [
            new PresenceChannel('poker-room.' . $this->room->room_id),
        ];
    }
}