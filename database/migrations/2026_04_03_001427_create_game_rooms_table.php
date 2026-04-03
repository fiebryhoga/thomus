<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_id')->unique(); // ID 4 Digit Ruangan
            $table->unsignedBigInteger('host_id'); // Pembuat Ruangan
            
            // Penyimpanan Data Game (Menggunakan JSON agar fleksibel)
            $table->json('players_data')->nullable(); // Kartu di tangan tiap pemain
            $table->json('table_cards')->nullable();  // Fisik kartu yang ada di meja
            $table->json('table_combo')->nullable();  // Info kombo di meja (misal: "pair", "bom")
            $table->json('cleared_3_players')->nullable(); // Catat siapa saja yang sudah membuang angka 3
            
            // Sistem Giliran
            $table->unsignedBigInteger('current_turn_id')->nullable(); // Giliran siapa sekarang?
            $table->unsignedBigInteger('last_move_user_id')->nullable(); // Siapa yang terakhir lempar kartu?
            $table->integer('pass_count')->default(0); // Hitungan berapa orang yang SKIP
            
            // Status & Hasil Game
            $table->string('status')->default('waiting'); // waiting, playing, finished
            $table->unsignedBigInteger('winner_id')->nullable(); // Siapa yang menang?
            $table->unsignedBigInteger('loser_id')->nullable(); // Siapa yang kena BOM (kalah)?

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_rooms');
    }
};