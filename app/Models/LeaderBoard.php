<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderBoard extends Model
{

    protected $fillable = [
        'user_id',
        'rating',
        'wins',
        'loses',
        'draws',
        'total_games',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
