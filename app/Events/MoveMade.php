<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class MoveMade
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    protected $game;
    protected $move;
    protected $player_id;

    public function __construct($game, $move, $player_id)
    {
        $this->game = $game;
        $this->move = $move;
        $this->player_id = $player_id;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('game.' . $this->game->id);
    }

    public function broadcastWith()
    {
        return [
            'move' => [
                'game_id' => $this->game->id,
                'player_id' => $this->player_id,
                'from' => $this->move['from'],
                'to' => $this->move['to'],
                'piece' => $this->move['piece'],
                'fen' => $this->move['fen'],
            ]
        ];
    }

}
