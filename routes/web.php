<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Models\GameRoom;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Halaman Lobi
Route::get('/poker-lobby', function () {
    return Inertia::render('ThomUs/PokerLobby');
})->middleware(['auth', 'verified'])->name('poker.lobby');

// Halaman Room (Hanya satu rute ini yang dipakai untuk masuk ruangan)


Route::get('/poker-room/{room_id}', function ($room_id) {
    $user = auth()->user();

    // Cari atau buat ruangan
    $room = \App\Models\GameRoom::where('room_id', $room_id)->first();

    if (!$room) {
        $room = \App\Models\GameRoom::create([
            'room_id' => $room_id,
            'host_id' => $user->id,
            'status' => 'waiting',
            'players_data' => []
        ]);
    }

    // Ambil kartu milik pemain ini jika game sudah berjalan
    $playersData = $room->players_data ?? [];
    $myCards = $playersData[$user->id] ?? [];

    return Inertia::render('ThomUs/PokerRoom', [
        'roomId' => $room_id,
        'hostId' => $room->host_id,
        
        // SUNTIKKAN DATA TERBARU DARI DATABASE KE REACT
        'initialData' => [
            'status' => $room->status,
            'current_turn_id' => $room->current_turn_id,
            'table_cards' => $room->table_cards ?? [],
            'myCards' => $myCards,
            'winner_id' => $room->winner_id,
        ]
    ]);
})->middleware(['auth', 'verified'])->name('poker.room');

// Halaman Coming Soon
Route::get('/soon', function () {
    return Inertia::render('ThomUs/ComingSoon');
})->middleware(['auth', 'verified'])->name('soon');

// Rute API Logika Permainan
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/game/{roomId}/start', [GameController::class, 'startGame']);
    Route::post('/game/{roomId}/clear-threes', [GameController::class, 'clearThrees']);
    Route::post('/game/{roomId}/play', [GameController::class, 'playCards']);
    Route::post('/game/{roomId}/skip', [GameController::class, 'skipTurn']);
});

// Rute Bawaan Laravel Breeze (Profile)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';