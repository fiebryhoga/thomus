<?php

namespace App\Services;

class PokerEngine
{
    // 1. Mendapatkan Power Angka (3 paling kecil, 2 paling besar)
    public static function getCardPower($value)
    {
        $order = ['3'=>1, '4'=>2, '5'=>3, '6'=>4, '7'=>5, '8'=>6, '9'=>7, '10'=>8, 'J'=>9, 'Q'=>10, 'K'=>11, 'A'=>12, '2'=>13];
        return $order[$value] ?? 0;
    }

    // 2. Menganalisis Kombinasi Kartu (Single, Pair, Full House, dll)
    public static function analyzeCombo($cards)
    {
        $count = count($cards);

        // Urutkan kartu berdasarkan power terkecil ke terbesar
        usort($cards, function($a, $b) {
            return self::getCardPower($a['value']) <=> self::getCardPower($b['value']);
        });

        if ($count === 1) {
            return ['type' => 'single', 'power' => self::getCardPower($cards[0]['value']), 'value' => $cards[0]['value']];
        }

        if ($count === 2) {
            if ($cards[0]['value'] === $cards[1]['value']) {
                return ['type' => 'pair', 'power' => self::getCardPower($cards[0]['value'])];
            }
        }

        if ($count === 3) {
            if ($cards[0]['value'] === $cards[1]['value'] && $cards[1]['value'] === $cards[2]['value']) {
                return ['type' => 'triple', 'power' => self::getCardPower($cards[0]['value'])];
            }
        }

        if ($count === 4) {
            // Cek BOM ANGKA
            if (count(array_unique(array_column($cards, 'value'))) === 1) {
                return ['type' => 'bom_angka', 'power' => self::getCardPower($cards[0]['value'])];
            }
        }

        if ($count === 5) {
            // Cek BOM SERI (5 Kartu Berurutan, 1 Simbol)
            if (self::isStraightFlush($cards)) {
                return ['type' => 'bom_seri', 'power' => self::getCardPower($cards[4]['value'])]; // Power dari kartu tertinggi
            }

            // Hitung frekuensi angka untuk cek Full House
            $values = array_column($cards, 'value');
            $counts = array_count_values($values);
            
            if (count($counts) === 2 && in_array(3, $counts) && in_array(2, $counts)) {
                // Ini Full House Biasa ATAU Full House Seri
                $tripleValue = array_search(3, $counts);
                $pairValue = array_search(2, $counts);

                // Cek apakah 3 kartu tersebut SERI SIMBOL?
                $tripleCards = array_filter($cards, function($c) use ($tripleValue) {
                    return $c['value'] === $tripleValue;
                });
                if (count($tripleCards) == 3 && self::isStraightFlush(array_values($tripleCards))) {
                    return ['type' => 'fullhouse_seri', 'power' => self::getCardPower($tripleValue)];
                }


                return ['type' => 'fullhouse', 'power' => self::getCardPower($tripleValue)];
            }
        }

        return false; // Kartu tidak valid
    }

    // Helper Cek Straight Flush
    private static function isStraightFlush($cards)
    {
        $symbol = $cards[0]['symbol'];
        for ($i = 0; $i < count($cards) - 1; $i++) {
            if ($cards[$i]['symbol'] !== $symbol) return false;
            $currentPower = self::getCardPower($cards[$i]['value']);
            $nextPower = self::getCardPower($cards[$i+1]['value']);
            if ($nextPower - $currentPower !== 1) return false; // Tidak berurutan
        }
        return true;
    }

    // 3. Membandingkan Kartu (Apakah kartu yang dimainkan MENGALAHKAN meja?)
    public static function canBeat($playCombo, $tableCombo)
    {
        if (!$tableCombo) return true; // Meja kosong (Free Turn)

        // Aturan BOM vs POKER (Angka 2)
        if ($tableCombo['type'] === 'single' && $tableCombo['value'] === '2') {
            return in_array($playCombo['type'], ['bom_angka', 'bom_seri']);
        }

        // Aturan Normal (Tipe harus sama dan Power harus lebih besar)
        if ($playCombo['type'] === $tableCombo['type']) {
            return $playCombo['power'] > $tableCombo['power'];
        }

        return false;
    }
}