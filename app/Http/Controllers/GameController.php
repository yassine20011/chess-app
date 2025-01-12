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
    // This function displays the game details and renders the game view with necessary data.
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
                "checkmate" => asset('sounds/Checkmate.mp3'),
            ],
        ]);
    }

    // This function stores a new move made by a player in the game.
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

    // This function updates the status of the game, including the current turn and player times, and the winner of the game.
    public function status(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $status = $request->validate([
            'status' => 'required|string',
            'time' => 'required|array',
            'winner' => 'nullable|integer',
        ]);
        $game->setStatus($status['status']);
        $game->setWinner($status['winner']);


        if ($status['status'] == "checkmate" || $status['status'] == "resign") {
            $player1 = User::findOrFail($game->player1_id);
            $player2 = User::findOrFail($game->player2_id);
            $game->EloRating($player1, $player2, $status['winner']);
            return response()->json(['player1' => $player1, 'player2' => $player2]);
        }

        if ($game->turn == $game->player1_id) {
            $game->setPlayer1Time($status['time']["white"]);
            $game->setPlayer2Time($status['time']["black"]);
        } else {
            $game->setPlayer1Time($status['time']["black"]);
            $game->setPlayer2Time($status['time']["white"]);
        }



        return response()->json(['game' => $game]);
    }
}
