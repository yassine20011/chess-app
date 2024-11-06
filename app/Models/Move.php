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
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

}
