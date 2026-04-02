<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PokerGameController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Halaman Lobi & Room
Route::get('/poker-lobby', function () {
    return Inertia::render('ThomUs/PokerLobby');
})->middleware(['auth', 'verified'])->name('poker.lobby');

Route::get('/poker-room', function () {
    return Inertia::render('ThomUs/PokerRoom');
})->middleware(['auth', 'verified'])->name('poker.room');

Route::get('/poker-room/{room_id}', function ($room_id) {
    return Inertia::render('ThomUs/PokerRoom', [
        'roomId' => $room_id
    ]);
})->middleware(['auth', 'verified'])->name('poker.room.id');

Route::get('/soon', function () {
    return Inertia::render('ThomUs/ComingSoon');
})->middleware(['auth', 'verified'])->name('soon');

// --- ROUTE UNTUK AKSI GAME (POST) ---
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/poker-room/{room_id}/start', [PokerGameController::class, 'startGame']);
    Route::post('/poker-room/{room_id}/play', [PokerGameController::class, 'playTurn']);
    Route::post('/poker-room/{room_id}/skip', [PokerGameController::class, 'skipTurn']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';