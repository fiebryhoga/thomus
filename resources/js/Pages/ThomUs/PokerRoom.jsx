import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. PASTIKAN ADA 'auth' DI DALAM KURUNG INI BERSAMA roomId DAN hostId
// Tambahkan initialData ke dalam parameter
export default function PokerRoom({ auth, roomId, hostId, initialData }) {
    const currentUser = auth.user;

    // --- STATE PERMAINAN (Gunakan initialData sebagai nilai awal) ---
    const [players, setPlayers] = useState([]);
    
    // Status sekarang mengambil dari database, bukan hardcode 'waiting'
    const [gameStatus, setGameStatus] = useState(initialData.status); 
    const [myCards, setMyCards] = useState(initialData.myCards);
    const [tableCards, setTableCards] = useState(initialData.table_cards);
    const [currentTurn, setCurrentTurn] = useState(initialData.current_turn_id);
    const [winner, setWinner] = useState(initialData.winner_id);
    
    const [selectedCards, setSelectedCards] = useState([]);

    // Cek apakah user yang sedang login adalah Host
    const isHost = currentUser.id === hostId;

    // Cek apakah pemain memiliki angka 3 di tangannya
    const hasThrees = myCards.some(card => card.value === '3');

    // ... (sisa kode useEffect di bawahnya tidak perlu diubah) ...

    // --- SETUP WEBSOCKET (LARAVEL ECHO) ---
    // --- SETUP WEBSOCKET (LARAVEL ECHO) ---
    useEffect(() => {
        if (!roomId) return;
        
        const channelName = `poker-room.${roomId}`;
        const channel = window.Echo.join(channelName);

        // 1. Presence Channel (Daftar Pemain Online)
        channel.here((users) => setPlayers(users))
               .joining((user) => setPlayers((prev) => [...prev, user]))
               .leaving((user) => setPlayers((prev) => prev.filter((p) => p.id !== user.id)));

        // 2. Mendengarkan Event Update dari Backend
        channel.listen('GameStateUpdated', (e) => {
            const roomData = e.room;

            setGameStatus((prevStatus) => {
                // Jika game baru saja dimulai, jalankan animasi dulu
                if (roomData.status === 'playing' && prevStatus === 'waiting') {
                    setTimeout(() => {
                        updateLocalState(roomData);
                    }, 2500); // Tunggu animasi 2.5 detik
                    return 'dealing';
                } else {
                    updateLocalState(roomData);
                    return roomData.status;
                }
            });
        });

        // 3. CLEANUP: Cara yang benar keluar dari channel Laravel Echo
        return () => {
            window.Echo.leave(channelName);
        };
    }, [roomId]); // HAPUS gameStatus dari sini agar WebSocket tidak putus-nyambung

    // Fungsi untuk mengupdate UI dari data server
    const updateLocalState = (roomData) => {
        setGameStatus(roomData.status);
        setCurrentTurn(roomData.current_turn_id);
        setTableCards(roomData.table_cards || []);
        
        // Update kartu kita sendiri
        if (roomData.players_data && roomData.players_data[currentUser.id]) {
            setMyCards(roomData.players_data[currentUser.id]);
        }

        if (roomData.status === 'finished') {
            setWinner(roomData.winner_id);
        }
    };

    // --- API CALLS (MENGIRIM PERINTAH KE SERVER) ---

    // 1. Host memulai game
    const handleStartGame = () => {
        // Kirim array ID pemain yang ada di ruangan ke server
        const playerIds = players.map(p => p.id); 
        
        axios.post(`/game/${roomId}/start`, { playerIds: playerIds })
             .catch(err => alert("Gagal memulai: " + (err.response?.data?.message || err.message)));
    };

    // 2. Pemain membuang semua angka 3
    const handleClearThrees = () => {
        axios.post(`/game/${roomId}/clear-threes`)
             .then(() => setSelectedCards([]))
             .catch(err => alert("Gagal membuang angka 3: " + err.response?.data?.message));
    };

    // 3. Pemain jalan (mengeluarkan kombo kartu)
    const handlePlayMove = () => {
        if (selectedCards.length === 0) return;
        
        axios.post(`/game/${roomId}/play`, { cards: selectedCards })
             .then(() => setSelectedCards([]))
             .catch(err => {
                 // Jika kartu tidak valid atau kurang besar, server akan menolak
                 alert("❌ " + (err.response?.data?.message || "Kartu tidak valid!"));
                 setSelectedCards([]); // Reset pilihan jika gagal
             });
    };

    // 4. Pemain memilih Skip
    const handleSkip = () => {
        axios.post(`/game/${roomId}/skip`)
             .then(() => setSelectedCards([]))
             .catch(err => alert("Gagal Skip: " + err.response?.data?.message));
    };

    // --- HELPER UI ---
    
    // Pilih / Batal Pilih Kartu
    const toggleSelectCard = (card) => {
        if (selectedCards.some(c => c.value === card.value && c.symbol === card.symbol)) {
            setSelectedCards(selectedCards.filter(c => !(c.value === card.value && c.symbol === card.symbol)));
        } else {
            setSelectedCards([...selectedCards, card]);
        }
    };

    // Mengurutkan kartu di tangan dari 3 sampai 2
    const sortCards = (cards) => {
        const order = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
        return [...cards].sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
    };

    const opponents = players.filter(p => p.id !== currentUser.id);
    const seatPositions = [
        "absolute -top-16 left-1/2 -translate-x-1/2",
        "absolute top-1/2 -left-12 -translate-y-1/2",
        "absolute top-1/2 -right-12 -translate-y-1/2",
    ];
    const avatarList = ['👽', '🤠', '🤖', '🧛', '🧙‍♂️', '🥷'];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Rye&display=swap');
                .font-saloon { font-family: 'Rye', serif; }
                .font-cartoon { font-family: 'Lilita One', cursive; letter-spacing: 1px;}
                .bg-wood { background: radial-gradient(circle, #5c3a21 0%, #2a160b 100%); }
                
                .bg-card-back {
                    background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2)), repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2));
                    background-position: 0 0, 4px 4px;
                    background-size: 8px 8px;
                }

                .card-selected { transform: translateY(-30px) scale(1.1); border-color: #ffd700; box-shadow: 0 0 20px #ffd700; z-index: 100 !important; }
                
                .deal-card { position: absolute; top: 50%; left: 50%; width: 40px; height: 60px; background-color: #d32f2f; border: 2px solid white; border-radius: 4px; transform: translate(-50%, -50%); opacity: 0; }
                @keyframes shoot-bottom { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, 200px) scale(0.5); } }
                @keyframes shoot-top { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -200px) scale(0.5); } }
                @keyframes shoot-left { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-300px, -50%) scale(0.5); } }
                @keyframes shoot-right { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(300px, -50%) scale(0.5); } }
                .animate-deal-bottom { animation: shoot-bottom 0.4s ease-out infinite; }
                .animate-deal-top { animation: shoot-top 0.4s ease-out 0.1s infinite; }
                .animate-deal-left { animation: shoot-left 0.4s ease-out 0.2s infinite; }
                .animate-deal-right { animation: shoot-right 0.4s ease-out 0.3s infinite; }
            `}</style>

            <Head title={`Thom Us Capsa - Room ${roomId}`} />

            <div className="min-h-screen bg-wood flex flex-col relative overflow-hidden select-none">
                
                {/* --- HEADER --- */}
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start px-4 pt-4 z-50">
                    <div className="font-cartoon text-white text-xl drop-shadow-md flex gap-4">
                        <span>THOM US <span className="text-[#ffd700]">CAPSA BANTING</span></span>
                        {gameStatus === 'playing' && (
                            <span className="bg-black/50 px-3 py-1 rounded border border-gray-600">
                                GILIRAN: <span className="text-yellow-400">{players.find(p => p.id === currentTurn)?.name || '...'}</span>
                            </span>
                        )}
                    </div>
                    <Link href={route('dashboard')} className="bg-red-600 border-2 border-red-800 rounded-lg px-4 py-1 shadow-lg text-white font-cartoon hover:bg-red-500 transition-colors">
                        LEAVE TABLE
                    </Link>
                </div>

                {/* --- AREA MEJA UTAMA --- */}
                <div className="flex-1 flex justify-center items-center relative mt-10">
                    <div className="w-[90vw] max-w-[1000px] h-[55vh] max-h-[500px] bg-gradient-to-b from-[#ff8c00] to-[#e65c00] rounded-[250px] border-[24px] border-[#8b4513] shadow-[inset_0_0_60px_rgba(0,0,0,0.6),0_20px_50px_rgba(0,0,0,0.8)] relative flex flex-col items-center justify-center">
                        <div className="absolute inset-4 rounded-[230px] border-2 border-orange-300/30 pointer-events-none"></div>

                        {/* Room ID */}
                        <div className="absolute top-4 bg-red-700 border-2 border-red-400 rounded-lg px-6 py-1 shadow-lg z-20">
                            <span className="font-cartoon text-white text-xl tracking-widest drop-shadow-md">
                                ROOM ID: <span className="text-yellow-400">{roomId}</span>
                            </span>
                        </div>

                        {/* Animasi Dealing */}
                        {gameStatus === 'dealing' && (
                            <>
                                <div className="deal-card bg-card-back animate-deal-bottom"></div>
                                <div className="deal-card bg-card-back animate-deal-top"></div>
                                <div className="deal-card bg-card-back animate-deal-left"></div>
                                <div className="deal-card bg-card-back animate-deal-right"></div>
                            </>
                        )}

                        {/* Tumpukan Deck Awal (Jika Belum Main) */}
                        {gameStatus === 'waiting' && (
                            <div className="relative w-[60px] h-[90px] z-10 shadow-2xl">
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back transform -rotate-6"></div>
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back transform -rotate-3"></div>
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back"></div>
                            </div>
                        )}

                        {/* KARTU DI TENGAH MEJA (Kombinasi Terakhir) */}
                        {gameStatus === 'playing' && tableCards.length > 0 && (
                            <div className="flex -space-x-8 md:-space-x-12 z-20 mt-4">
                                {tableCards.map((c, i) => (
                                    <div key={i} className="w-[60px] h-[90px] md:w-[70px] md:h-[100px] bg-white rounded-lg border-2 border-gray-300 shadow-xl flex flex-col p-1 transform rotate-2" style={{ zIndex: i }}>
                                        <span className={`${c.color} font-bold text-lg md:text-xl leading-none`}>{c.value}</span>
                                        <span className={`${c.color} text-2xl md:text-3xl absolute bottom-2 right-2`}>{c.symbol}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Notifikasi Game Over (BOM Kena 2) */}
                        {gameStatus === 'finished' && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-[230px] z-50">
                                <span className="text-8xl mb-4 animate-bounce">💥</span>
                                <h2 className="font-saloon text-5xl text-[#ffd700] drop-shadow-lg text-center">BOM BERHASIL!</h2>
                                <p className="font-cartoon text-white text-2xl mt-4">
                                    PEMENANG: {players.find(p => p.id === winner)?.name || 'UNKNOWN'}
                                </p>
                            </div>
                        )}

                        {/* --- AVATAR LAWAN --- */}
                        {opponents.map((opponent, index) => {
                            const playerAvatar = avatarList[opponent.id % avatarList.length];
                            const isHisTurn = currentTurn === opponent.id;

                            return (
                                <div key={opponent.id} className={`${seatPositions[index % 3]} flex flex-col items-center transition-all duration-500 z-30`}>
                                    <div className={`w-20 h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full border-4 ${isHisTurn ? 'border-yellow-400 shadow-[0_0_30px_#ffd700] animate-pulse' : 'border-gray-400'} shadow-[0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden flex justify-center items-center relative`}>
                                        <span className="text-4xl drop-shadow-lg">{playerAvatar}</span>
                                    </div>
                                    <div className="bg-gradient-to-b from-blue-900 to-black text-white font-cartoon px-4 py-1 rounded-lg mt-[-15px] z-10 border-2 border-cyan-500 shadow-lg text-center min-w-[100px]">
                                        <div className="text-sm truncate text-cyan-300">{opponent.name}</div>
                                    </div>

                                    {/* Kartu Tertutup Lawan */}
                                    {gameStatus === 'playing' && (
                                        <div className="absolute -bottom-6 flex -space-x-4 z-0 scale-75">
                                            {[...Array(13)].map((_, i) => (
                                                <div key={i} className="w-[30px] h-[45px] bg-red-700 border border-white rounded shadow-sm bg-card-back"></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* --- AVATAR PEMAIN UTAMA (KAMU) --- */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                            <div className={`w-[180px] bg-gradient-to-r from-blue-900 to-black border-2 ${currentTurn === currentUser.id ? 'border-yellow-400 shadow-[0_0_20px_#ffd700]' : 'border-cyan-400 shadow-2xl'} rounded-lg p-2 mt-4 relative z-30 transition-all`}>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-pink-500 rounded border-2 border-white flex justify-center items-center text-xl">😎</div>
                                    <div className="font-cartoon text-cyan-400 text-sm truncate">{currentUser.name}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- AREA KARTU & KONTROL (HAND) --- */}
                <div className="w-full h-48 md:h-56 flex flex-col items-center justify-end pb-8 z-50">
                    
                    {/* Deretan 13 Kartu Pemain */}
                    {gameStatus === 'playing' && myCards.length > 0 && (
                        <div className="flex -space-x-6 md:-space-x-8 px-4 relative z-40 mb-4">
                            {sortCards(myCards).map((card, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => toggleSelectCard(card)}
                                    className={`w-[60px] h-[90px] md:w-[70px] md:h-[100px] bg-white rounded-lg shadow-2xl border-2 border-gray-300 flex flex-col p-1 cursor-pointer transition-all duration-200 group relative
                                        ${selectedCards.some(c => c.value === card.value && c.symbol === card.symbol) ? 'card-selected' : 'hover:-translate-y-6 hover:z-50'}`}
                                    style={{ zIndex: i }}
                                >
                                    <span className={`${card.color} font-bold text-lg md:text-xl leading-none`}>{card.value}</span>
                                    <span className={`${card.color} text-2xl md:text-3xl absolute bottom-2 right-2`}>{card.symbol}</span>
                                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- KONTROL TOMBOL --- */}
                    <div className="flex gap-4 min-h-[60px]">
                        
                        {/* Jika masih nunggu pemain / Host Start */}
                        {gameStatus === 'waiting' && isHost && players.length === 4 && (
                            <button onClick={handleStartGame} className="bg-gradient-to-b from-[#2e7d32] to-[#1b5e20] border-4 border-[#66bb6a] px-10 py-3 rounded-xl shadow-[0_8px_0_#1b5e20] active:translate-y-2 active:shadow-none transition-all animate-bounce">
                                <span className="font-cartoon text-white text-3xl tracking-widest drop-shadow-md">START GAME!</span>
                            </button>
                        )}

                        {gameStatus === 'waiting' && (!isHost || players.length < 4) && (
                            <div className="bg-black/60 px-8 py-3 rounded-full border-2 border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse">
                                <span className="font-cartoon text-yellow-400 text-xl tracking-widest drop-shadow-md">
                                    {players.length < 4 ? `WAITING FOR PLAYERS... (${players.length}/4)` : 'WAITING FOR HOST...'}
                                </span>
                            </div>
                        )}

                        {/* Jika Game Berjalan */}
                        {gameStatus === 'playing' && (
                            <>
                                {/* Aturan Wajib Buang Angka 3 */}
                                {hasThrees && (
                                    <button 
                                        onClick={handleClearThrees}
                                        className="bg-gradient-to-b from-[#f57c00] to-[#e65100] border-4 border-[#ffb74d] px-8 py-2 rounded-xl shadow-[0_6px_0_#e65100] active:translate-y-2 active:shadow-none transition-all"
                                    >
                                        <span className="font-cartoon text-white text-xl drop-shadow-md">KELUARKAN ANGKA 3 🗑️</span>
                                    </button>
                                )}

                                {/* Tombol Aksi (Hanya Muncul Jika Giliran Kita & Angka 3 Sudah Habis) */}
                                {!hasThrees && currentTurn === currentUser.id && (
                                    <>
                                        <button 
                                            onClick={handleSkip} 
                                            className="bg-gray-700 border-4 border-gray-500 px-10 py-2 rounded-xl shadow-[0_6px_0_#424242] active:translate-y-2 active:shadow-none transition-all"
                                        >
                                            <span className="font-cartoon text-white text-2xl drop-shadow-md">SKIP ❌</span>
                                        </button>
                                        <button 
                                            onClick={handlePlayMove}
                                            disabled={selectedCards.length === 0}
                                            className="bg-gradient-to-b from-[#d32f2f] to-[#9a0007] border-4 border-[#ff6659] px-12 py-2 rounded-xl shadow-[0_6px_0_#5c0004] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="font-cartoon text-white text-2xl drop-shadow-md">JALAN! 🃏</span>
                                        </button>
                                    </>
                                )}

                                {!hasThrees && currentTurn !== currentUser.id && (
                                    <div className="bg-blue-900/80 px-8 py-2 rounded-full border-2 border-cyan-400">
                                        <span className="font-cartoon text-white text-lg tracking-widest">
                                            MENUNGGU GILIRAN LAWAN...
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>

            </div>
        </>
    );
}