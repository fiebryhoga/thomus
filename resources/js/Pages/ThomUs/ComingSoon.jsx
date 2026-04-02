import { Head, Link } from '@inertiajs/react';

export default function ComingSoon() {
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

                @keyframes swing-slow {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                .animate-swing-slow { animation: swing-slow 4s ease-in-out infinite; transform-origin: top center; }
            `}</style>

            <Head title="Under Construction - Thom Us" />

            <div className="min-h-screen bg-wood flex flex-col items-center justify-center p-4 select-none relative overflow-hidden">
                
                {/* Rantai Penggantung */}
                <div className="absolute top-0 left-1/2 -translate-x-32 w-2 h-24 bg-gray-400 opacity-50 z-0"></div>
                <div className="absolute top-0 left-1/2 translate-x-32 w-2 h-24 bg-gray-400 opacity-50 z-0"></div>

                <div className="w-full max-w-lg relative z-10 animate-swing-slow">
                    {/* Papan Kayu Pengumuman */}
                    <div className="bg-gradient-to-b from-[#e6aa4c] to-[#b87333] border-[8px] border-[#5c3a21] rounded-lg p-8 shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative flex flex-col items-center">
                        
                        {/* Paku */}
                        <div className="absolute top-3 left-3 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-900 shadow-inner"></div>
                        <div className="absolute top-3 right-3 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-900 shadow-inner"></div>
                        <div className="absolute bottom-3 left-3 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-900 shadow-inner"></div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-900 shadow-inner"></div>

                        <div className="text-7xl mb-4 drop-shadow-xl">🚧</div>
                        
                        <h1 className="font-saloon text-5xl text-center text-[#3d2314] drop-shadow-[2px_2px_0_rgba(255,255,255,0.4)] mb-2">
                            UNDER CONSTRUCTION
                        </h1>
                        
                        <div className="w-full h-1 bg-[#5c3a21] my-4 opacity-50 rounded"></div>
                        
                        <p className="font-cartoon text-white text-center text-xl drop-shadow-md mb-8">
                            THE SHERIFF IS STILL BUILDING THIS ROOM.<br/>COME BACK LATER, PARTNER!
                        </p>

                        <Link
                            href={route('dashboard')}
                            className="bg-gradient-to-b from-[#d32f2f] to-[#9a0007] border-4 border-[#ff8a80] rounded-xl px-8 py-3 shadow-[0_8px_0_#5c0004,0_15px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 hover:shadow-[0_10px_0_#5c0004,0_20px_25px_rgba(0,0,0,0.6)] active:translate-y-2 active:shadow-[0_2px_0_#5c0004,0_5px_10px_rgba(0,0,0,0.5)] transition-all"
                        >
                            <span className="font-cartoon text-white text-2xl tracking-wider drop-shadow-[0_3px_2px_rgba(0,0,0,0.8)]">
                                BACK TO LOBBY
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}