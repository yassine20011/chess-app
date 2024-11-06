<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorematchMakingQueueRequest;
use App\Http\Requests\UpdatematchMakingQueueRequest;
use App\Models\matchMakingQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\GameCreated;
use App\Jobs\MatchPlayersJob;

class MatchMakingQueueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $queue = MatchmakingQueue::where('status', 'waiting')->get();

        // reset the queue
        // MatchmakingQueue::where('status', 'waiting')->delete();

        return Inertia::render('MatchmakingQueue/Index', [
            'queue' => $queue
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Check if user is already in the queue
        $existingEntry = MatchmakingQueue::where('user_id', $user->id)->where('status', 'waiting')->first();
        if ($existingEntry) {

            MatchPlayersJob::dispatch();

            return Inertia::render('MatchmakingQueue/Waiting', [
                'userId' => $user->id
            ]);
        }

        // Add user to the matchmaking queue
        MatchmakingQueue::create([
            'user_id' => $user->id,
            'status' => 'waiting'
        ]);

        MatchPlayersJob::dispatch();


        return Inertia::render('MatchmakingQueue/Waiting', [
            'userId' => $user->id
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function show(matchMakingQueue $matchMakingQueue)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(matchMakingQueue $matchMakingQueue)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatematchMakingQueueRequest $request, matchMakingQueue $matchMakingQueue)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(matchMakingQueue $matchMakingQueue)
    {
        //
    }



}
