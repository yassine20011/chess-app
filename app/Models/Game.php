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

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
