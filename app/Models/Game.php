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
        'winner_id'
    ];

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
