<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\Move;
use Inertia\Inertia;
use App\Events\MoveMade;
use Illuminate\Routing\Controller;

class GameController extends Controller
{
    public function show($id, Request $request)
    {
        $user = $request->user();
        $game = Game::findOrFail($id);


        $moves = Move::where('game_id', $game->id)->get();

        return Inertia::render('Game/MatchStarted', [
            'game' => $game,
            'user' => $user,
            'moves' => $moves,
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
