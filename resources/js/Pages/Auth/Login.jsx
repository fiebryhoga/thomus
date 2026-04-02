import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <style>{`
                /* Menggunakan font bergaya Wild West dan font UI Kartun yang tebal */
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Rye&display=swap');

                .font-saloon {
                    font-family: 'Rye', serif;
                }
                .font-cartoon {
                    font-family: 'Lilita One', cursive;
                    letter-spacing: 1px;
                }

                /* Pola Kayu Latar Belakang */
                .bg-wood {
                    background-color: #4a2f1d;
                    background-image: repeating-linear-gradient(
                        transparent,
                        transparent 50px,
                        rgba(0,0,0,0.1) 50px,
                        rgba(0,0,0,0.1) 53px
                    ), linear-gradient(
                        90deg, 
                        #4a2f1d 0%, 
                        #5c3a21 20%, 
                        #3d2314 50%, 
                        #5c3a21 80%, 
                        #4a2f1d 100%
                    );
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
                }

                /* Animasi Chip Melayang */
                @keyframes float-chip {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(180deg); }
                    100% { transform: translateY(0) rotate(360deg); }
                }
                .animate-chip-1 { animation: float-chip 8s infinite ease-in-out; }
                .animate-chip-2 { animation: float-chip 12s infinite ease-in-out reverse; }
                .animate-chip-3 { animation: float-chip 10s infinite ease-in-out 1s; }

                /* Animasi Kilat/Cahaya Emas */
                @keyframes shine {
                    0% { left: -100%; opacity: 0; }
                    20% { opacity: 0.5; }
                    100% { left: 200%; opacity: 0; }
                }
                .golden-shine::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,215,0,0.4) 50%, rgba(255,255,255,0) 100%);
                    transform: skewX(-25deg);
                    animation: shine 4s infinite;
                }

                /* Animasi Teks Judul Mengayun */
                @keyframes swing {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                .animate-swing {
                    animation: swing 3s ease-in-out infinite;
                    transform-origin: top center;
                }
            `}</style>

            <Head title="Login - Thom Us Hold'em" />

            <div className="min-h-screen bg-wood flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
                
                {/* --- ORNAMEN BACKGROUND (Kartu & Chip Melayang) --- */}
                {/* Chip Merah Kiri */}
                <div className="absolute top-20 left-10 md:left-32 w-20 h-20 bg-red-600 rounded-full border-[6px] border-white border-dashed shadow-2xl animate-chip-1 opacity-80 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white rounded-full"></div>
                </div>
                {/* Kartu As Spades Kanan Atas */}
                <div className="absolute top-10 right-10 md:right-40 w-24 h-36 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center justify-center animate-chip-2 transform rotate-12 opacity-90">
                    <span className="text-black font-bold text-3xl">A</span>
                    <span className="text-black text-5xl">♠</span>
                </div>
                {/* Chip Biru Kanan Bawah */}
                <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-600 rounded-full border-[8px] border-white border-dashed shadow-2xl animate-chip-3 opacity-70 flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-white rounded-full"></div>
                </div>
                {/* Kartu King Hearts Kiri Bawah */}
                <div className="absolute bottom-10 left-10 md:left-40 w-20 h-28 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center justify-center animate-chip-1 transform -rotate-12 opacity-80">
                    <span className="text-red-600 font-bold text-2xl">K</span>
                    <span className="text-red-600 text-4xl">♥</span>
                </div>


                {/* --- KOTAK LOGIN UTAMA --- */}
                <div className="w-full max-w-md relative z-10">
                    
                    {/* Header Papan Nama Kayu */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[110%] z-20 animate-swing">
                        <div className="bg-gradient-to-b from-[#e6aa4c] to-[#b87333] border-4 border-[#5c3a21] rounded-2xl py-3 px-6 shadow-[0_15px_20px_rgba(0,0,0,0.6)] relative overflow-hidden golden-shine">
                            {/* Paku Emas */}
                            <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            
                            <h1 className="font-saloon text-4xl md:text-5xl text-center text-[#3d2314] drop-shadow-[2px_2px_0_rgba(255,255,255,0.4)]">
                                THOM US
                            </h1>
                            <p className="font-cartoon text-white text-center text-sm md:text-base drop-shadow-md">
                                TEXAS HOLD'EM POKER
                            </p>
                        </div>
                    </div>

                    {/* Container Form dengan gaya Papan Meja/Kayu Solid */}
                    <div className="bg-gradient-to-b from-[#2a6b3d] to-[#12381e] border-[8px] border-[#8b4513] rounded-3xl p-8 pt-20 shadow-[0_30px_50px_rgba(0,0,0,0.8)] relative">
                        
                        {/* Garis Dalam Meja Hijau */}
                        <div className="absolute inset-2 rounded-2xl border-4 border-dashed border-[#4ade80]/30 pointer-events-none"></div>

                        {status && <div className="mb-4 font-cartoon text-[#ffd700] text-center bg-black/40 rounded p-2">{status}</div>}

                        <form onSubmit={submit} className="space-y-6 relative z-10">
                            
                            {/* Input Email (Kartunis) */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-lg mb-2 drop-shadow-md">
                                    PLAYER EMAIL
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-3 text-xl font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter Email..."
                                />
                                {errors.email && <p className="font-cartoon text-[#ff4e42] mt-1">{errors.email}</p>}
                            </div>

                            {/* Input Password (Kartunis) */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-lg mb-2 drop-shadow-md">
                                    SECRET PIN
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-3 text-xl font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="font-cartoon text-[#ff4e42] mt-1">{errors.password}</p>}
                            </div>

                            {/* Tombol Merah Khas GOP 3 */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-b from-[#d32f2f] to-[#9a0007] border-4 border-[#ff8a80] rounded-2xl py-4 shadow-[0_10px_0_#5c0004,0_15px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 hover:shadow-[0_12px_0_#5c0004,0_20px_25px_rgba(0,0,0,0.6)] active:translate-y-2 active:shadow-[0_2px_0_#5c0004,0_5px_10px_rgba(0,0,0,0.5)] transition-all flex justify-center items-center overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-lg"></div>
                                    <span className="font-cartoon text-white text-3xl tracking-wider drop-shadow-[0_3px_2px_rgba(0,0,0,0.8)]">
                                        {processing ? 'DEALING...' : 'ENTER TABLE'}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer / Lupa Password & Register */}
                        <div className="mt-8 text-center flex flex-col space-y-4">
                            {canResetPassword && (
                                <Link 
                                    href={route('password.request')} 
                                    className="font-cartoon text-[#a3d8a5] hover:text-white drop-shadow-md transition-colors text-sm"
                                >
                                    FORGOT PASSWORD?
                                </Link>
                            )}
                            
                            <div className="bg-[#12381e] border-2 border-[#2a6b3d] rounded-lg p-3 shadow-inner">
                                <p className="font-cartoon text-[#ffd700] text-sm">
                                    NEW PLAYER?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-white hover:text-[#ff4e42] underline decoration-2 underline-offset-2 transition-colors ml-1"
                                    >
                                        GET FREE CHIPS!
                                    </Link>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}