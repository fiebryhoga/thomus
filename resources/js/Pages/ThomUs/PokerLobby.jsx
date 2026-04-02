import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function PokerLobby() {
    const [joinId, setJoinId] = useState('');

    // Fungsi untuk membuat Meja Baru
    const handleCreateRoom = () => {
        const randomId = Math.floor(1000 + Math.random() * 9000); 
        // Gunakan URL langsung agar lebih aman
        router.visit(`/poker-room/${randomId}`);
    };

    // Fungsi untuk Bergabung ke Meja
    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (joinId.length === 4) {
            // Gunakan URL langsung
            router.visit(`/poker-room/${joinId}`);
        } else {
            alert('Room ID harus 4 digit angka!');
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Rye&display=swap');
                .font-saloon { font-family: 'Rye', serif; }
                .font-cartoon { font-family: 'Lilita One', cursive; letter-spacing: 1px; }

                .bg-wood {
                    background-color: #4a2f1d;
                    background-image: repeating-linear-gradient(transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 53px), linear-gradient(90deg, #4a2f1d 0%, #5c3a21 20%, #3d2314 50%, #5c3a21 80%, #4a2f1d 100%);
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
                }
            `}</style>

            <Head title="Poker Lobby - Thom Us" />

            <div className="min-h-screen bg-wood flex flex-col items-center justify-center p-4 relative select-none">
                
                {/* Header Lobby */}
                <div className="mb-10 text-center">
                    <h1 className="font-saloon text-5xl md:text-6xl text-[#ffd700] drop-shadow-[4px_4px_0_#5c0004]">
                        POKER SALOON
                    </h1>
                    <p className="font-cartoon text-white text-xl mt-2 drop-shadow-md">
                        CREATE A TABLE OR JOIN YOUR FRIENDS
                    </p>
                </div>

                <div className="w-full max-w-2xl bg-gradient-to-b from-[#2a6b3d] to-[#12381e] border-[8px] border-[#8b4513] rounded-3xl p-8 shadow-[0_30px_50px_rgba(0,0,0,0.8)] relative">
                    {/* Garis Dalam Meja Hijau */}
                    <div className="absolute inset-2 rounded-2xl border-4 border-dashed border-[#4ade80]/30 pointer-events-none"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        
                        {/* Kiri: Buat Ruangan */}
                        <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border-2 border-green-800">
                            <div className="text-6xl mb-4 drop-shadow-lg">🃏</div>
                            <h2 className="font-cartoon text-[#ffd700] text-2xl mb-4 text-center">CREATE PRIVATE TABLE</h2>
                            <p className="text-gray-300 font-cartoon text-sm text-center mb-6">
                                Host your own game and invite friends with a 4-digit ID.
                            </p>
                            <button 
                                onClick={handleCreateRoom}
                                className="w-full bg-gradient-to-b from-[#ffd700] to-[#b8860b] border-4 border-[#fff176] rounded-xl py-3 shadow-[0_8px_0_#7a5900,0_10px_15px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 active:translate-y-2 active:shadow-[0_2px_0_#7a5900] transition-all flex justify-center items-center"
                            >
                                <span className="font-cartoon text-[#5c0004] text-2xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                                    CREATE ROOM
                                </span>
                            </button>
                        </div>

                        {/* Kanan: Join Ruangan */}
                        <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border-2 border-green-800">
                            <div className="text-6xl mb-4 drop-shadow-lg">🤝</div>
                            <h2 className="font-cartoon text-[#ffd700] text-2xl mb-4 text-center">JOIN A TABLE</h2>
                            
                            <form onSubmit={handleJoinRoom} className="w-full flex flex-col items-center">
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value.replace(/[^0-9]/g, ''))} // Hanya menerima angka
                                    className="w-3/4 bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-3 text-4xl text-center font-cartoon tracking-widest text-[#3d2314] shadow-inner placeholder-[#a37c58] mb-6"
                                    placeholder="####"
                                />
                                <button 
                                    type="submit"
                                    className="w-full bg-gradient-to-b from-[#d32f2f] to-[#9a0007] border-4 border-[#ff8a80] rounded-xl py-3 shadow-[0_8px_0_#5c0004,0_10px_15px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 active:translate-y-2 active:shadow-[0_2px_0_#5c0004] transition-all flex justify-center items-center"
                                >
                                    <span className="font-cartoon text-white text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        JOIN GAME
                                    </span>
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

                {/* Tombol Kembali ke Main Lobby */}
                <div className="mt-8">
                    <Link href={route('dashboard')} className="font-cartoon text-[#ffd700] hover:text-white bg-[#5c3a21] px-6 py-2 rounded-full border-2 border-[#8b4513] shadow-lg transition-colors">
                        ⬅ BACK TO MAIN LOBBY
                    </Link>
                </div>

            </div>
        </>
    );
}