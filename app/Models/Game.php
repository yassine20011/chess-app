<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Move;

class Game extends Model
{
    protected $fillable = [
        'player1_id',
        'player2_id',
        'status',
        'turn',
        'winner_id',
        'player1_time',
        'player2_time',
        "game_time",
    ];

    public function setStatus($status)
    {
        $this->status = $status;
        $this->save();
    }

    public function setPlayer1Time($time)
    {
        $this->player1_time = $time;
        $this->save();
    }

    public function setPlayer2Time($time)
    {
        $this->player2_time = $time;
        $this->save();
    }

    public function setWinner($winner)
    {
        $this->winner_id = $winner;
        $this->save();
    }


    public function EloRating($player1, $player2, $result)
    {
        $K = 32;
        $R1 = $player1->rating;
        $R2 = $player2->rating;
        $E1 = 1 / (1 + pow(10, ($R2 - $R1) / 400));
        $E2 = 1 / (1 + pow(10, ($R1 - $R2) / 400));
        $S1 = $result;
        $S2 = 1 - $result;
        $player1->rating = $R1 + $K * ($S1 - $E1);
        $player2->rating = $R2 + $K * ($S2 - $E2);
        $player1->rating = (int) $player1->rating;
        $player2->rating = (int) $player2->rating;
        $player1->save();
        $player2->save();
    }



    public function moves()
    {
        return $this->hasMany(Move::class);
    }

    public function player1()
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(User::class, 'player2_id');
    }
}
