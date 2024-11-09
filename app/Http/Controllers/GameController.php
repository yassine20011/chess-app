<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\Move;
use Inertia\Inertia;
use Illuminate\Routing\Controller;
use App\Models\User;

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
                "check" => asset('sounds/Check.mp3'),
                "checkmate" => asset('sounds/Checkmate.mp3'),
                "genericNotify" => asset('sounds/GenericNotify.mp3'),
                "lowTime" => asset('sounds/LowTime.mp3'),
                "move" => asset('sounds/Move.mp3'),
                "promotion" => asset('sounds/Promotion.webm'),
                "illegal" => asset('sounds/illegal.webm'),
                "castle" => asset('sounds/castle.webm'),
            ]
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
        ]);

        Move::create([
            'game_id' => $game->id,
            'player_id' => $user->id,
            'position_from' => $move['from'],
            'position_to' => $move['to'],
            'piece' => $move['piece'],
            'fen' => $move['fen'],
        ]);


        return response()->json(['message' => 'Move made']);
    }
}
