<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Move;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class GameController extends Controller
{
    public function show($id, Request $request)
    {
        $user = $request->user();
        $game = Game::findOrFail($id);
        $moves = Move::where('game_id', $game->id)->get();

        $player1 = User::findOrFail($game->player1_id);
        $player2 = User::findOrFail($game->player2_id);

        return Inertia::render('Game/MatchStarted', [
            'game' => $game,
            'user' => $user,
            'moves' => $moves,
            'player1' => $player1,
            'player2' => $player2,
            'media' => [
                "capture" => asset('sounds/Capture.mp3'),
                "check" => asset('sounds/move-check.webm'),
                "genericNotify" => asset('sounds/GenericNotify.mp3'),
                "lowTime" => asset('sounds/LowTime.mp3'),
                "move" => asset('sounds/Move.mp3'),
                "promotion" => asset('sounds/Promotion.webm'),
                "illegal" => asset('sounds/illegal.webm'),
                "castle" => asset('sounds/castle.webm'),
            ],
        ]);
    }

    public function store(Request $request, $id)
    {

        $game = Game::findOrFail($id);
        $user = $request->user();
        $move = $request->validate([
            'from' => 'required|string',
            'to' => 'required|string',
            'piece' => 'required|string',
            'fen' => 'required|string',
            'player_time' => 'required|integer',
        ]);

        $moveInstance = new Move();
        $moveInstance->saveMove($game, $user, $move);

        return response()->json(['message' => 'Move made']);
    }

    public function status(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $status = $request->validate([
            'status' => 'required|string',
            'time' => 'required|array',
        ]);
        $game->setStatus($status['status']);
        if ($game->turn == $game->player1_id) {
            $game->setPlayer1Time($status['time']["white"]);
            $game->setPlayer2Time($status['time']["black"]);
        } else {
            $game->setPlayer1Time($status['time']["black"]);
            $game->setPlayer2Time($status['time']["white"]);
        }
        return response()->json(['message' => 'Status updated']);
    }

}
