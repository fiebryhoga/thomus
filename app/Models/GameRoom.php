<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRoom extends Model
{
    use HasFactory;

    // Kolom apa saja yang boleh diisi
    protected $fillable = [
        'room_id', 
        'host_id', 
        'players_data', 
        'table_cards', 
        'table_combo',
        'cleared_3_players',
        'current_turn_id', 
        'last_move_user_id', 
        'pass_count',
        'status',
        'winner_id',
        'loser_id'
    ];

    // Beritahu Laravel agar otomatis mengubah JSON dari database menjadi Array PHP
    protected $casts = [
        'players_data' => 'array',
        'table_cards' => 'array',
        'table_combo' => 'array',
        'cleared_3_players' => 'array',
    ];

    // Relasi: Ruangan ini punya 1 Host (User)
    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }
}