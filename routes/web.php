<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\MatchMakingQueueController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/', [MatchMakingQueueController::class, 'index'])->name('matchmaking.index');
    Route::post('/', [MatchMakingQueueController::class, 'store'])->name('matchmaking.store');
    Route::delete('/',  [MatchMakingQueueController::class, 'destroy'])->name('matchmaking.destroy');
    Route::get('/game/{id}', [GameController::class, 'show'])->name('game.show');
    Route::post('/game/{id}', [GameController::class, 'store'])->name('game.store');
    Route::patch('/game/{id}/status', [GameController::class, 'status'])->name('game.status');
    Route::patch('/game/{id}/winner', [GameController::class, 'winner'])->name('game.winner');

});

require __DIR__ . '/auth.php';
