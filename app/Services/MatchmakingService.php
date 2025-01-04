<?php

namespace App\Services;

use App\Models\Game;
use App\Models\matchMakingQueue;
use App\Events\GameCreated;
use Illuminate\Support\Facades\Log;

class MatchmakingService
{
    public function matchPlayers()
    {
        $firstPlayer = matchMakingQueue::where('status', 'waiting')->lockForUpdate()->first();

        if (!$firstPlayer) {
            return null;
        }

        $secondPlayer = matchMakingQueue::where('status', 'waiting')
            ->where('id', '!=', $firstPlayer->id)->where('game_time', $firstPlayer->game_time)->lockForUpdate()->first();

        log::info('First player: ' . $firstPlayer);
        log::info('Second player: ' . $secondPlayer);

        if ($secondPlayer) {
            log::info('Matched players: ' . $firstPlayer->user_id . ' and ' . $secondPlayer->user_id);
            $game = Game::create([
                'player1_id' => $firstPlayer->user_id,
                'player2_id' => $secondPlayer->user_id,
                'status' => 'ongoing',
                'turn' => $firstPlayer->user_id,
                'game_time' => $firstPlayer->game_time,
            ]);

            $firstPlayer->update(['status' => 'matched']);
            $secondPlayer->update(['status' => 'matched']);


            return $game;
        }
        return null;
    }
}
