<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
// Pastikan kamu sudah membuat Event untuk WebSockets: php artisan make:event GameStateUpdated
use App\Events\GameStateUpdated; 

class PokerGameController extends Controller
{
    // Urutan kekuatan kartu. 3 adalah yang paling rendah (meskipun langsung dibuang ke meja), 2 (Poker) adalah yang tertinggi.
    private $cardValues = [
        '3' => 0, '4' => 1, '5' => 2, '6' => 3, '7' => 4, '8' => 5, 
        '9' => 6, '10' => 7, 'J' => 8, 'Q' => 9, 'K' => 10, 'A' => 11, '2' => 12
    ];

    // ==========================================
    // 1. MULAI GAME (Dibroadcast oleh Host)
    // ==========================================
    public function startGame(Request $request, $roomId)
    {
        $players = $request->players; // Diambil dari data array pemain di frontend
        $deck = $this->generateDeck();
        
        $hands = [];
        $tableCards = []; // Menampung semua angka 3 yang terbuang otomatis
        $startingPlayerId = null;

        foreach ($players as $index => $player) {
            $playerId = $player['id'];
            $playerHand = array_slice($deck, $index * 13, 13);
            
            $filteredHand = [];
            foreach ($playerHand as $card) {
                if ($card['value'] === '3') {
                    $tableCards[] = $card;
                    // Yang punya 3 Sekop otomatis dapat giliran pertama
                    if ($card['symbol'] === '♠') {
                        $startingPlayerId = $playerId;
                    }
                } else {
                    $filteredHand[] = $card;
                }
            }
            // Sort kartu pemain agar rapi
            $hands[$playerId] = $this->sortCards($filteredHand);
        }

        // State lengkap game disimpan di Redis/Cache (bertahan 2 jam)
        $gameState = [
            'roomId' => $roomId,
            'players' => array_column($players, 'id'),
            'hands' => $hands,
            'tableCards' => $tableCards,
            'currentTrick' => [], 
            'currentTrickType' => null, 
            'currentTrickPower' => 0,
            'turnIndex' => array_search($startingPlayerId, array_column($players, 'id')), 
            'skipCount' => 0,
            'lastPlayPlayerId' => null,
            'winner' => null,
            'loser' => null
        ];

        Cache::put("poker_room_{$roomId}", $gameState, now()->addHours(2));

        // Panggil event untuk mengirim info ke frontend
        broadcast(new GameStateUpdated($roomId, $gameState));

        return response()->json(['message' => 'Game started', 'state' => $gameState]);
    }

    // ==========================================
    // 2. PEMAIN MENGELUARKAN KARTU
    // ==========================================
    public function playTurn(Request $request, $roomId)
    {
        $gameState = Cache::get("poker_room_{$roomId}");
        $playerId = auth()->id(); // Atau ambil dari $request jika tes manual
        $playedCards = $this->sortCards($request->playedCards); 

        // Validasi giliran
        if ($gameState['players'][$gameState['turnIndex']] !== $playerId) {
            return response()->json(['error' => 'Bukan giliranmu!'], 403);
        }

        $playType = $this->evaluateCards($playedCards);

        if (!$playType) {
            return response()->json(['error' => 'Kombinasi kartu tidak valid!'], 400);
        }

        // SISTEM BOM: Hanya bisa dikeluarkan jika di meja ada angka '2' (Poker)
        if (in_array($playType['type'], ['bom_angka', 'bom_seri'])) {
            $isTablePoker = ($gameState['currentTrickType'] === 'single' && $gameState['currentTrick'][0]['value'] === '2');
            
            if ($isTablePoker) {
                $gameState['winner'] = $playerId; // Pengeluar Bom Menang
                $gameState['loser'] = $gameState['lastPlayPlayerId']; // Pengeluar '2' Kalah
                
                Cache::put("poker_room_{$roomId}", $gameState, now()->addHours(2));
                broadcast(new GameStateUpdated($roomId, $gameState));
                
                return response()->json(['message' => 'BOM meledak! Permainan selesai.', 'state' => $gameState]);
            } else {
                return response()->json(['error' => 'BOM hanya bisa digunakan untuk memukul angka 2 (Poker)!'], 400);
            }
        }

        // Jika meja kosong / orang bebas jalan
        if (empty($gameState['currentTrick'])) {
            $this->acceptPlay($gameState, $playerId, $playedCards, $playType, $roomId);
            return response()->json(['message' => 'Kartu diterima', 'state' => $gameState]);
        }

        // Jika meja ada isinya, kartu harus sama tipe & lebih besar nilainya
        if ($playType['type'] !== $gameState['currentTrickType']) {
             return response()->json(['error' => "Kartu harus bertipe: " . $gameState['currentTrickType']], 400);
        }

        if ($playType['power'] <= $gameState['currentTrickPower']) {
             return response()->json(['error' => "Kartumu kurang besar!"], 400);
        }

        $this->acceptPlay($gameState, $playerId, $playedCards, $playType, $roomId);
        return response()->json(['message' => 'Kartu diterima', 'state' => $gameState]);
    }

    // ==========================================
    // 3. PEMAIN MELAKUKAN SKIP
    // ==========================================
    public function skipTurn(Request $request, $roomId)
    {
        $gameState = Cache::get("poker_room_{$roomId}");
        $playerId = auth()->id();

        if ($gameState['players'][$gameState['turnIndex']] !== $playerId) {
            return response()->json(['error' => 'Bukan giliranmu!'], 403);
        }

        $gameState['skipCount'] += 1;
        $this->nextTurn($gameState);

        // Jika semua orang nge-skip, orang terakhir bebas jalan kartu baru
        if ($gameState['skipCount'] >= count($gameState['players']) - 1) {
            $gameState['currentTrick'] = [];
            $gameState['currentTrickType'] = null;
            $gameState['skipCount'] = 0;
            $gameState['turnIndex'] = array_search($gameState['lastPlayPlayerId'], $gameState['players']);
        }

        Cache::put("poker_room_{$roomId}", $gameState, now()->addHours(2));
        broadcast(new GameStateUpdated($roomId, $gameState));

        return response()->json(['message' => 'Skip berhasil', 'state' => $gameState]);
    }

    // ==========================================
    // HELPER FUNCTIONS & ALGORITMA INTI
    // ==========================================

    private function acceptPlay(&$gameState, $playerId, $playedCards, $playType, $roomId)
    {
        $gameState['currentTrick'] = $playedCards;
        $gameState['currentTrickType'] = $playType['type'];
        $gameState['currentTrickPower'] = $playType['power'];
        $gameState['lastPlayPlayerId'] = $playerId;
        $gameState['skipCount'] = 0;

        // Hapus kartu dari tangan pemain berdasarkan ID kartu
        $playedCardIds = array_column($playedCards, 'id');
        $gameState['hands'][$playerId] = array_values(array_filter($gameState['hands'][$playerId], function($c) use ($playedCardIds) {
            return !in_array($c['id'], $playedCardIds);
        }));

        // Menang normal jika kartu habis
        if (count($gameState['hands'][$playerId]) === 0) {
            $gameState['winner'] = $playerId;
        } else {
            $this->nextTurn($gameState);
        }

        Cache::put("poker_room_{$roomId}", $gameState, now()->addHours(2));
        broadcast(new GameStateUpdated($roomId, $gameState));
    }

    private function nextTurn(&$gameState)
    {
        $gameState['turnIndex'] = ($gameState['turnIndex'] + 1) % count($gameState['players']);
    }

    // ALGORITMA DETEKSI KARTU (Single, Pair, Fullhouse, Bom)
    private function evaluateCards($cards)
    {
        $count = count($cards);
        
        // SINGLE
        if ($count === 1) {
            return ['type' => 'single', 'power' => $this->cardValues[$cards[0]['value']]];
        }
        
        // PAIR
        if ($count === 2 && $cards[0]['value'] === $cards[1]['value']) {
            return ['type' => 'pair', 'power' => $this->cardValues[$cards[0]['value']]];
        }
        
        // TRIPLE (3 Biji Sama)
        if ($count === 3 && $cards[0]['value'] === $cards[1]['value'] && $cards[1]['value'] === $cards[2]['value']) {
            return ['type' => 'triple', 'power' => $this->cardValues[$cards[0]['value']]];
        }

        // BOM ANGKA (4 Biji Sama)
        if ($count === 4 && count(array_unique(array_column($cards, 'value'))) === 1) {
            return ['type' => 'bom_angka', 'power' => $this->cardValues[$cards[0]['value']]];
        }

        // PAKETAN 5 KARTU
        if ($count === 5) {
            $valuesCount = array_count_values(array_column($cards, 'value'));
            $isSameSuit = count(array_unique(array_column($cards, 'symbol'))) === 1;
            
            // Cek apakah 5 kartunya berurutan (Straight)
            $isStraight = true;
            for ($i = 1; $i < 5; $i++) {
                if ($this->cardValues[$cards[$i]['value']] - $this->cardValues[$cards[$i-1]['value']] !== 1) {
                    $isStraight = false; break;
                }
            }

            // BOM SERI: 5 kartu berurutan dengan simbol yang sama
            if ($isStraight && $isSameSuit) {
                return ['type' => 'bom_seri', 'power' => $this->cardValues[$cards[4]['value']]];
            }

            // FULLHOUSE BIASA: 3 Sama + 2 Sama
            if (count($valuesCount) === 2 && (in_array(3, $valuesCount) && in_array(2, $valuesCount))) {
                // Cari angka mana yang jumlahnya 3 biji (karena ini yang dinilai kekuatannya)
                $tripleValue = array_search(3, $valuesCount);
                return ['type' => 'fullhouse', 'power' => $this->cardValues[$tripleValue]];
            }

            // FULLHOUSE SERI: 3 Berurutan Sama Simbol + 2 Sama
            // Logika: Cari Pair (2 biji), lalu sisanya (3 biji) dicek apakah berurutan & simbolnya sama
            if (in_array(2, $valuesCount)) {
                $pairValue = array_search(2, $valuesCount);
                $threeCards = array_values(array_filter($cards, fn($c) => $c['value'] !== $pairValue));
                
                if (count($threeCards) === 3) {
                    $is3Straight = ($this->cardValues[$threeCards[1]['value']] - $this->cardValues[$threeCards[0]['value']] === 1) &&
                                   ($this->cardValues[$threeCards[2]['value']] - $this->cardValues[$threeCards[1]['value']] === 1);
                    $is3SameSuit = count(array_unique(array_column($threeCards, 'symbol'))) === 1;

                    if ($is3Straight && $is3SameSuit) {
                        // Kekuatan diambil dari kartu tertinggi di urutan 3 biji tersebut
                        return ['type' => 'fullhouse_seri', 'power' => $this->cardValues[$threeCards[2]['value']]];
                    }
                }
            }
        }

        return false;
    }

    // Menggabungkan ID unik (agar kartu gampang dihapus dari tangan saat dimainkan)
    private function generateDeck() {
        $suits = [
            ['symbol' => '♠', 'color' => 'text-black'],
            ['symbol' => '♥', 'color' => 'text-red-600'],
            ['symbol' => '♣', 'color' => 'text-black'],
            ['symbol' => '♦', 'color' => 'text-red-600']
        ];
        $values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        $deck = [];
        $id = 1;
        
        foreach ($suits as $suit) {
            foreach ($values as $val) {
                $deck[] = [
                    'id' => $id++, // ID unik 1 - 52
                    'value' => $val,
                    'symbol' => $suit['symbol'],
                    'color' => $suit['color']
                ];
            }
        }

        shuffle($deck);
        return $deck;
    }

    // Helper untuk selalu mengurutkan kartu yang diterima/dimainkan dari terkecil ke terbesar
    private function sortCards($cards) {
        usort($cards, function($a, $b) {
            return $this->cardValues[$a['value']] <=> $this->cardValues[$b['value']];
        });
        return $cards;
    }
}