<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Services\PokerEngine;
use App\Events\GameStateUpdated;
use Illuminate\Http\Request;

class GameController extends Controller
{
    // --- 1. MULAI GAME & BAGI KARTU ---
    public function startGame(Request $request, $roomId)
    {
        $room = GameRoom::where('room_id', $roomId)->firstOrFail();
        $playerIds = $request->playerIds; // Array dari 4 pemain

        if (count($playerIds) !== 4) {
            return response()->json(['message' => 'Pemain harus berjumlah 4 orang!'], 400);
        }

        // Generate & Acak 52 Kartu
        $deck = $this->generateDeck();
        shuffle($deck);

        $hands = [];
        $firstTurnId = null;

        // Bagi masing-masing 13 kartu
        foreach ($playerIds as $index => $userId) {
            $userHand = array_slice($deck, $index * 13, 13);
            $hands[$userId] = $userHand;

            // Cari siapa yang memegang 3 Sekop (♠)
            foreach ($userHand as $card) {
                if ($card['value'] === '3' && $card['symbol'] === '♠') {
                    $firstTurnId = $userId;
                }
            }
        }

        // Simpan ke Database
        $room->update([
            'status' => 'playing',
            'players_data' => $hands,
            'current_turn_id' => $firstTurnId, // 3 Sekop jalan pertama
            'table_cards' => [],
            'table_combo' => null,
            'cleared_3_players' => [],
            'pass_count' => 0,
            'last_move_user_id' => null
        ]);

        broadcast(new GameStateUpdated($room));
        return response()->json(['status' => 'success']);
    }

    // --- 2. BUANG ANGKA 3 ---
    public function clearThrees(Request $request, $roomId)
    {
        $room = GameRoom::where('room_id', $roomId)->firstOrFail();
        $userId = auth()->id();
        $playersData = $room->players_data;

        $myHand = $playersData[$userId];
        // Saring kartu: Pisahkan angka 3 dan kartu lainnya
        $threes = array_filter($myHand, function($c) { return $c['value'] === '3'; });
        $remainingHand = array_filter($myHand, function($c) { return $c['value'] !== '3'; });

        $playersData[$userId] = array_values($remainingHand);
        $cleared = $room->cleared_3_players ?? [];
        if (!in_array($userId, $cleared)) {
            $cleared[] = $userId;
        }

        // Masukkan angka 3 ke tengah meja secara visual
        $tableCards = $room->table_cards ?? [];
        $newTableCards = array_merge($tableCards, array_values($threes));

        $room->update([
            'players_data' => $playersData,
            'cleared_3_players' => $cleared,
            'table_cards' => $newTableCards
        ]);

        broadcast(new GameStateUpdated($room));
        return response()->json(['status' => 'success']);
    }

    // --- 3. JALAN KARTU (VALIDASI) ---
    public function playCards(Request $request, $roomId)
    {
        $room = GameRoom::where('room_id', $roomId)->firstOrFail();
        $userId = auth()->id();
        $playedCards = $request->cards; // Kartu yang dipilih di React

        if ($room->current_turn_id !== $userId) {
            return response()->json(['message' => 'Bukan giliran Anda!'], 403);
        }

        // Analisis Kombo yang dimainkan (menggunakan PokerEngine)
        $playCombo = PokerEngine::analyzeCombo($playedCards);
        
        if (!$playCombo) {
            return response()->json(['message' => 'Kombinasi kartu tidak sah!'], 400);
        }

        $tableCombo = $room->table_combo;

        // Cek apakah kombo ini bisa mengalahkan kombo di meja
        if (!PokerEngine::canBeat($playCombo, $tableCombo)) {
            return response()->json(['message' => 'Kartu Anda kurang besar!'], 400);
        }

        // Cek INSTANT KILL (BOM vs 2/Poker)
        if ($tableCombo && $tableCombo['type'] === 'single' && $tableCombo['value'] === '2') {
            if (in_array($playCombo['type'], ['bom_angka', 'bom_seri'])) {
                // GAME OVER - Kena BOM!
                $room->update([
                    'status' => 'finished',
                    'winner_id' => $userId,
                    'loser_id' => $room->last_move_user_id
                ]);
                broadcast(new GameStateUpdated($room));
                return response()->json(['status' => 'game_over']);
            }
        }

        // Hapus kartu yang dimainkan dari tangan pemain
        $playersData = $room->players_data;
        $hand = $playersData[$userId];
        
        $newHand = array_filter($hand, function($c) use ($playedCards) {
            foreach ($playedCards as $pc) {
                if ($c['value'] === $pc['value'] && $c['symbol'] === $pc['symbol']) return false;
            }
            return true;
        });

        $playersData[$userId] = array_values($newHand);

        // Jika tangan kosong (kartu habis), pemain MENANG normal
        if (count($playersData[$userId]) === 0) {
            $room->update([
                'status' => 'finished',
                'winner_id' => $userId,
            ]);
            broadcast(new GameStateUpdated($room));
            return response()->json(['status' => 'win']);
        }

        // Lanjut Giliran
        $room->update([
            'players_data' => $playersData,
            'table_combo' => $playCombo,
            'table_cards' => $playedCards,
            'last_move_user_id' => $userId,
            'pass_count' => 0,
            'current_turn_id' => $this->getNextTurnId($room)
        ]);

        broadcast(new GameStateUpdated($room));
        return response()->json(['status' => 'success']);
    }

    // --- 4. SKIP GILIRAN ---
    public function skipTurn(Request $request, $roomId)
    {
        $room = GameRoom::where('room_id', $roomId)->firstOrFail();
        
        if ($room->current_turn_id !== auth()->id()) {
            return response()->json(['message' => 'Bukan giliran Anda!'], 403);
        }

        $passCount = $room->pass_count + 1;

        // Jika 3 orang skip beruntun, meja di-reset, giliran kembali ke pembuang terakhir
        if ($passCount === 3) {
            $room->update([
                'pass_count' => 0,
                'table_combo' => null,
                'table_cards' => [],
                'current_turn_id' => $room->last_move_user_id
            ]);
        } else {
            $room->update([
                'pass_count' => $passCount,
                'current_turn_id' => $this->getNextTurnId($room)
            ]);
        }

        broadcast(new GameStateUpdated($room));
        return response()->json(['status' => 'success']);
    }


    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    private function getNextTurnId($room)
    {
        $players = array_keys($room->players_data); // Array dari 4 ID User
        $currentIndex = array_search($room->current_turn_id, $players);
        $nextIndex = ($currentIndex + 1) % 4; // Berputar 0,1,2,3,0...
        
        return $players[$nextIndex];
    }

    private function generateDeck()
    {
        $suits = [
            ['symbol' => '♠', 'color' => 'text-black'],
            ['symbol' => '♥', 'color' => 'text-red-600'],
            ['symbol' => '♣', 'color' => 'text-black'],
            ['symbol' => '♦', 'color' => 'text-red-600']
        ];
        $values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        $deck = [];
        foreach ($suits as $suit) {
            foreach ($values as $val) {
                $deck[] = [
                    'value' => $val, 
                    'symbol' => $suit['symbol'], 
                    'color' => $suit['color']
                ];
            }
        }
        return $deck;
    }
}