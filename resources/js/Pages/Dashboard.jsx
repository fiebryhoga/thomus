import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    // Daftar Game di Lobi
    const games = [
        {
            id: 1,
            title: "TEXAS HOLD'EM",
            subtitle: "HIGH STAKES POKER",
            icon: "♠️",
            bgGradient: "from-[#2a6b3d] to-[#12381e]",
            borderColor: "border-[#4ade80]",
            route: route('poker.lobby'), // <--- UBAH BAGIAN INI
            isReady: true
        },
        {
            id: 2,
            title: "WILD SLOTS",
            subtitle: "JACKPOT MANIA",
            icon: "🎰",
            bgGradient: "from-[#6b2a5c] to-[#38122c]", // Ungu
            borderColor: "border-[#de4aab]",
            route: route('soon'), // Arahkan ke SOON
            isReady: false
        },
        {
            id: 3,
            title: "BLACKJACK",
            subtitle: "BEAT THE DEALER",
            icon: "🃏",
            bgGradient: "from-[#2a4e6b] to-[#122438]", // Biru
            borderColor: "border-[#4a9ede]",
            route: route('soon'), // Arahkan ke SOON
            isReady: false
        },
        {
            id: 4,
            title: "ROULETTE",
            subtitle: "SPIN TO WIN",
            icon: "🎡",
            bgGradient: "from-[#8b2b2b] to-[#4a1212]", // Merah
            borderColor: "border-[#ff6b6b]",
            route: route('soon'), // Arahkan ke SOON
            isReady: false
        }
    ];

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

            <Head title="Main Lobby - Thom Us" />

            <div className="min-h-screen bg-wood flex flex-col font-sans select-none relative pb-10">
                
                {/* --- TOP BAR LOBBY --- */}
                <div className="bg-black/80 border-b-4 border-[#8b4513] p-4 flex justify-between items-center shadow-2xl sticky top-0 z-50">
                    
                    {/* Info Pemain */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-b from-[#ffd700] to-[#b8860b] rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,215,0,0.5)] flex items-center justify-center">
                            <span className="text-2xl">🤠</span>
                        </div>
                        <div>
                            <div className="font-cartoon text-white text-xl tracking-wide leading-none">
                                {auth.user.name}
                            </div>
                            <div className="flex gap-2 mt-1">
                                <span className="bg-red-600 text-white font-cartoon text-xs px-2 py-0.5 rounded shadow-inner">VIP 1</span>
                                <span className="font-cartoon text-[#ffd700] text-sm flex items-center gap-1">
                                    <span className="bg-[#ffd700] text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px]">C</span>
                                    250,000
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Logout & Profil */}
                    <div className="flex gap-2">
                        <Link href={route('profile.edit')} className="bg-blue-600 border-2 border-blue-400 text-white p-2 rounded-lg shadow-lg hover:bg-blue-500">
                            ⚙️
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="bg-red-600 border-2 border-red-400 text-white p-2 rounded-lg shadow-lg hover:bg-red-500">
                            🚪
                        </Link>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1 max-w-6xl w-full mx-auto px-4 pt-10">
                    
                    {/* Judul Lobi */}
                    <div className="text-center mb-10">
                        <h1 className="font-saloon text-5xl md:text-6xl text-[#ffd700] drop-shadow-[4px_4px_0_#5c0004]">
                            MAIN LOBBY
                        </h1>
                        <p className="font-cartoon text-white text-xl md:text-2xl mt-2 drop-shadow-md">
                            PICK YOUR POISON, PARTNER!
                        </p>
                    </div>

                    {/* GRID MENU GAME */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {games.map((game) => (
                            <Link 
                                key={game.id} 
                                href={game.route}
                                className="block group"
                            >
                                <div className={`bg-gradient-to-b ${game.bgGradient} border-[6px] border-[#8b4513] rounded-3xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-2 group-hover:shadow-[0_25px_40px_rgba(0,0,0,0.8)] relative overflow-hidden h-full flex items-center`}
                                >
                                    {/* Efek Garis Putus Kasino */}
                                    <div className={`absolute inset-2 rounded-2xl border-4 border-dashed ${game.borderColor} opacity-30`}></div>

                                    {/* Label Soon (Jika Belum Siap) */}
                                    {!game.isReady && (
                                        <div className="absolute top-6 -right-10 bg-red-600 text-white font-cartoon text-lg px-10 py-1 transform rotate-45 shadow-lg border-y-2 border-red-400 z-20 drop-shadow-md">
                                            COMING SOON
                                        </div>
                                    )}

                                    {/* Ikon Game */}
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-full border-4 border-white/20 shadow-inner flex items-center justify-center text-5xl md:text-7xl z-10 shrink-0 mr-6 transform group-hover:rotate-12 transition-transform">
                                        {game.icon}
                                    </div>

                                    {/* Teks Game */}
                                    <div className="z-10 relative">
                                        <h2 className="font-saloon text-3xl md:text-4xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] group-hover:text-[#ffd700] transition-colors leading-none">
                                            {game.title}
                                        </h2>
                                        <p className="font-cartoon text-[#ffd700] text-sm md:text-lg mt-2 drop-shadow-md bg-black/40 inline-block px-3 py-1 rounded">
                                            {game.subtitle}
                                        </p>
                                        
                                        <div className="mt-4">
                                            <span className={`inline-block font-cartoon text-white text-sm md:text-base px-4 py-2 rounded-lg shadow-md border-2 ${game.isReady ? 'bg-green-600 border-green-400' : 'bg-gray-600 border-gray-400'}`}>
                                                {game.isReady ? 'PLAY NOW ➔' : 'LOCKED 🔒'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}