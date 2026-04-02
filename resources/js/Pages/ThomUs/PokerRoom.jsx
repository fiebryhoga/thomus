import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function PokerRoom({ roomId }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    // State Game
    const [players, setPlayers] = useState([]);
    const [gameStatus, setGameStatus] = useState('waiting'); // waiting, dealing, playing
    const [myCards, setMyCards] = useState([]);
    const [tableCards, setTableCards] = useState([]); // Kartu di tengah meja
    const [turnIndex, setTurnIndex] = useState(null); // Giliran index ke berapa
    const [selectedCards, setSelectedCards] = useState([]); // Kartu yang mau dilempar
    const [errorMsg, setErrorMsg] = useState('');

    const channelRef = useRef(null);
    const isHost = players.length > 0 && players[0].id === currentUser.id;

    // Cek apakah sekarang giliranku?
    const isMyTurn = players.length > 0 && turnIndex !== null && players[turnIndex]?.id === currentUser.id;

    // Setup WebSockets
    // Setup WebSockets
    useEffect(() => {
        if (!roomId) return;
        
        const channelName = `poker-room.${roomId}`;
        
        // Bergabung ke Presence Channel
        const channel = window.Echo.join(channelName);
        channelRef.current = channel;

        channel.here((users) => setPlayers(users))
            .joining((user) => setPlayers((prev) => [...prev, user]))
            .leaving((user) => setPlayers((prev) => prev.filter((p) => p.id !== user.id)))
            
            // MENDENGARKAN EVENT DARI LARAVEL (BACKEND)
            .listen('GameStateUpdated', (event) => {
                const state = event.state;
                
                // Jika game baru mulai, kasih efek animasi sebentar
                if (gameStatus === 'waiting' && state.hands) {
                    setGameStatus('dealing');
                    setTimeout(() => {
                        setGameStatus('playing');
                        updateStateFromBackend(state);
                    }, 2500);
                } else {
                    // Update normal saat sedang main
                    updateStateFromBackend(state);
                }
            });

        // PERBAIKANNYA DI SINI:
        // Gunakan window.Echo.leave(namaChannel) saat komponen di-unmount
        return () => {
            window.Echo.leave(channelName);
        };
    }, [roomId, currentUser.id, gameStatus]);

    const updateStateFromBackend = (state) => {
        setMyCards(state.hands[currentUser.id] || []);
        
        // Cek jika ada kartu di meja saat ini, kalau kosong berarti baru jalan/habis diskip semua
        // Jika ada tableCards (kartu 3 yang dibuang otomatis), kita gabung saja sementara agar terlihat
        if (state.currentTrick && state.currentTrick.length > 0) {
            setTableCards(state.currentTrick);
        } else if (state.tableCards && state.tableCards.length > 0) {
             // Tampilkan angka 3 yang dibuang di awal
            setTableCards(state.tableCards);
        } else {
            setTableCards([]);
        }

        setTurnIndex(state.turnIndex);
        setSelectedCards([]); // Reset pilihan kartu
        setErrorMsg('');

        if (state.winner) {
            alert(state.loser ? `BOM! Permainan Selesai.` : `Permainan Selesai!`);
            // Bisa tambahkan state.winner === currentUser.id ? 'Kamu Menang!' : 'Kamu Kalah!'
            setGameStatus('waiting');
        }
    };

    // FUNGSI KOMUNIKASI KE BACKEND //
    
    const handleStartGame = async () => {
        if (!isHost) return;
        try {
            // Panggil API Laravel
            await axios.post(`/poker-room/${roomId}/start`, { players });
        } catch (error) {
            console.error("Gagal memulai game", error);
        }
    };

    const handlePlayCard = async () => {
        if (selectedCards.length === 0) return;
        try {
            await axios.post(`/poker-room/${roomId}/play`, { playedCards: selectedCards });
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Gagal mengeluarkan kartu!");
        }
    };

    const handleSkip = async () => {
        try {
            await axios.post(`/poker-room/${roomId}/skip`);
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Gagal skip!");
        }
    };

    // FUNGSI PILIH KARTU DI UI //
    const toggleSelectCard = (card) => {
        if (selectedCards.find(c => c.id === card.id)) {
            // Unselect
            setSelectedCards(selectedCards.filter(c => c.id !== card.id));
        } else {
            // Select (Maksimal 5 kartu sesuai aturan Fullhouse/Bom)
            if (selectedCards.length < 5) {
                setSelectedCards([...selectedCards, card]);
            }
        }
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
                /* CSS SAMA SEPERTI SEBELUMNYA */
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Rye&display=swap');
                .font-saloon { font-family: 'Rye', serif; }
                .font-cartoon { font-family: 'Lilita One', cursive; letter-spacing: 1px; }
                .bg-card-back { background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2)), repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2)); background-position: 0 0, 4px 4px; background-size: 8px 8px; }
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

            <Head title={`Room ${roomId} - Thom Us Game`} />

            <div className="min-h-screen bg-[#3d2314] flex flex-col relative overflow-hidden font-sans select-none"
                 style={{ backgroundImage: 'radial-gradient(circle, #5c3a21 0%, #2a160b 100%)' }}>
                
                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start px-4 pt-4 z-50">
                    <div className="font-cartoon text-white text-xl drop-shadow-md">
                        THOM US <span className="text-[#ffd700]">CARD HUB</span>
                    </div>
                    <Link href={route('dashboard')} className="bg-red-600 border-2 border-red-800 rounded-lg px-4 py-1 shadow-lg text-white font-cartoon hover:bg-red-500 transition-colors">
                        LEAVE TABLE
                    </Link>
                </div>

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
                        {gameStatus !== 'playing' && (
                            <div className="relative w-[60px] h-[90px] z-10 shadow-2xl">
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back transform -rotate-6"></div>
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back transform -rotate-3"></div>
                                <div className="absolute inset-0 bg-red-700 border-2 border-white rounded-lg bg-card-back"></div>
                            </div>
                        )}
                        {gameStatus === 'dealing' && (
                            <>
                                <div className="deal-card bg-card-back animate-deal-bottom"></div>
                                <div className="deal-card bg-card-back animate-deal-top"></div>
                                <div className="deal-card bg-card-back animate-deal-left"></div>
                                <div className="deal-card bg-card-back animate-deal-right"></div>
                            </>
                        )}

                        {/* KARTU DI TENGAH MEJA */}
                        {gameStatus === 'playing' && tableCards.length > 0 && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex -space-x-4 z-20">
                                {tableCards.map((card, i) => (
                                    <div key={i} className="w-[50px] h-[75px] bg-white rounded shadow-lg border border-gray-300 flex flex-col p-1 transform rotate-[-5deg]">
                                        <span className={`${card.color} font-bold text-sm leading-none`}>{card.value}</span>
                                        <span className={`${card.color} text-xl absolute bottom-1 right-1`}>{card.symbol}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Lawan */}
                        {opponents.map((opponent, index) => {
                            const isOpponentTurn = players.length > 0 && turnIndex !== null && players[turnIndex]?.id === opponent.id;
                            const playerAvatar = avatarList[opponent.id % avatarList.length];

                            return (
                                <div key={opponent.id} className={`${seatPositions[index % 3]} flex flex-col items-center transition-all duration-500 z-30`}>
                                    <div className={`w-20 h-20 rounded-full border-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden flex justify-center items-center relative transition-all ${isOpponentTurn ? 'border-yellow-400 bg-yellow-600 animate-pulse' : 'border-gray-400 bg-gradient-to-b from-gray-700 to-gray-900'}`}>
                                        <span className="text-4xl drop-shadow-lg">{playerAvatar}</span>
                                    </div>
                                    <div className="bg-gradient-to-b from-blue-900 to-black text-white font-cartoon px-4 py-1 rounded-lg mt-[-15px] z-10 border-2 border-cyan-500 shadow-lg text-center min-w-[100px]">
                                        <div className="text-sm truncate text-cyan-300">{opponent.name}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Posisi Player Kita */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                            
                            {/* Kartu di Tangan */}
                            {gameStatus === 'playing' && (
                                <div className="absolute -top-[140px] left-1/2 -translate-x-1/2 flex -space-x-8 md:-space-x-10 z-20 w-max px-8">
                                    {myCards.map((card, i) => {
                                        const isSelected = selectedCards.find(c => c.id === card.id);
                                        return (
                                            <div 
                                                key={card.id} 
                                                onClick={() => toggleSelectCard(card)}
                                                className={`w-[60px] h-[90px] md:w-[70px] md:h-[100px] bg-white rounded-lg shadow-2xl border-2 flex flex-col p-1 transition-all cursor-pointer relative group ${isSelected ? '-translate-y-8 border-yellow-500 ring-4 ring-yellow-400/50' : 'border-gray-300 hover:-translate-y-4'}`} 
                                                style={{ zIndex: isSelected ? 100 : i }}
                                            >
                                                <span className={`${card.color} font-bold text-lg md:text-xl leading-none`}>{card.value}</span>
                                                <span className={`${card.color} text-2xl md:text-3xl absolute bottom-2 right-2`}>{card.symbol}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Avatar Player Kita */}
                            <div className={`w-[180px] border-4 rounded-lg p-2 shadow-2xl mt-4 relative z-30 transition-all ${isMyTurn ? 'bg-gradient-to-r from-yellow-700 to-yellow-900 border-yellow-400 animate-pulse' : 'bg-gradient-to-r from-blue-900 to-black border-cyan-400'}`}>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-pink-500 rounded border-2 border-white flex justify-center items-center text-xl">😎</div>
                                    <div className={`font-cartoon text-sm truncate ${isMyTurn ? 'text-white' : 'text-cyan-400'}`}>{currentUser.name}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Kontrol Bawah */}
                <div className="w-full flex flex-col items-center justify-center p-6 pb-10 z-50 min-h-[120px]">
                    
                    {errorMsg && <div className="text-red-400 font-bold mb-2 bg-black/50 px-4 py-1 rounded">{errorMsg}</div>}

                    {gameStatus === 'waiting' && (
                        isHost ? (
                            players.length > 1 ? ( // Bisa diubah ke 4 sesuai kebutuhan
                                <button onClick={handleStartGame} className="w-[280px] bg-gradient-to-b from-[#2e7d32] to-[#1b5e20] border-4 border-[#66bb6a] rounded-xl py-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 active:translate-y-2 transition-all animate-bounce">
                                    <span className="font-cartoon text-white text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest">START GAME!</span>
                                </button>
                            ) : (
                                <div className="bg-black/60 px-8 py-3 rounded-full border-2 border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse">
                                    <span className="font-cartoon text-yellow-400 text-xl tracking-widest drop-shadow-md">WAITING FOR OTHERS... ({players.length}/4)</span>
                                </div>
                            )
                        ) : (
                            <div className="bg-black/60 px-8 py-3 rounded-full border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] animate-pulse">
                                <span className="font-cartoon text-cyan-400 text-xl tracking-widest drop-shadow-md">WAITING FOR HOST... ({players.length}/4)</span>
                            </div>
                        )
                    )}

                    {/* ACTION BUTTON JIKA GILIRAN KITA */}
                    {gameStatus === 'playing' && isMyTurn && (
                        <div className="flex gap-4">
                            <button 
                                onClick={handlePlayCard}
                                disabled={selectedCards.length === 0}
                                className={`px-8 py-3 rounded-full border-4 shadow-lg font-cartoon text-2xl tracking-widest transition-all ${selectedCards.length > 0 ? 'bg-gradient-to-b from-green-500 to-green-700 border-green-300 text-white hover:-translate-y-1' : 'bg-gray-600 border-gray-500 text-gray-400 opacity-50 cursor-not-allowed'}`}
                            >
                                PLAY CARDS
                            </button>
                            <button 
                                onClick={handleSkip}
                                className="bg-gradient-to-b from-red-600 to-red-800 border-4 border-red-400 px-8 py-3 rounded-full shadow-lg font-cartoon text-white text-2xl tracking-widest hover:-translate-y-1 transition-all"
                            >
                                SKIP (PASS)
                            </button>
                        </div>
                    )}

                    {/* TEXT JIKA BUKAN GILIRAN KITA */}
                    {gameStatus === 'playing' && !isMyTurn && (
                        <div className="bg-blue-900/80 px-8 py-2 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                            <span className="font-cartoon text-white text-lg tracking-widest">
                                WAITING FOR OTHER PLAYERS...
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}