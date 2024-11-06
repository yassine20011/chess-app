<?php

namespace App\Models;

use App\Models\Game;
use Illuminate\Database\Eloquent\Model;

class matchMakingQueue extends Model
{
    protected $fillable = ['user_id', 'status'];
}
