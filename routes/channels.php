<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Game;
use App\Models\User;

Broadcast::channel('user.{id}', function (User $user, $id) {
    return $user->id === (int) $id;
});


Broadcast::channel('game.{id}', function (User $user, $id) {
    $game = Game::findOrFail($id);

    return $game->player1_id === $user->id || $game->player2_id === $user->id;
});
