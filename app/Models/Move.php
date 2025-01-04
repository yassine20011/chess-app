<?php

namespace App\Models;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Move extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'player_id',
        'position_from',
        'position_to',
        'piece',
        'fen',
        'player_time'
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function saveMove($game, $user, $move)
    {
        $this->game_id = $game->id;
        $this->player_id = $user->id;
        $this->position_from = $move['from'];
        $this->position_to = $move['to'];
        $this->piece = $move['piece'];
        $this->fen = $move['fen'];
        $this->player_time = $move['player_time'];

        if (!$this->save()) {
            throw new \Exception("Failed to save move to the database.");
        }
    }
}
