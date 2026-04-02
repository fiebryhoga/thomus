import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <style>{`
                /* Font dari halaman Login */
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Rye&display=swap');

                .font-saloon { font-family: 'Rye', serif; }
                .font-cartoon { font-family: 'Lilita One', cursive; letter-spacing: 1px; }

                /* Pola Kayu Latar Belakang */
                .bg-wood {
                    background-color: #4a2f1d;
                    background-image: repeating-linear-gradient(
                        transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 53px
                    ), linear-gradient(
                        90deg, #4a2f1d 0%, #5c3a21 20%, #3d2314 50%, #5c3a21 80%, #4a2f1d 100%
                    );
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
                }

                /* Animasi Chip & Kartu Melayang (Variasi Register) */
                @keyframes float-chip {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-25px) rotate(180deg); }
                    100% { transform: translateY(0) rotate(360deg); }
                }
                .animate-float-1 { animation: float-chip 9s infinite ease-in-out; }
                .animate-float-2 { animation: float-chip 14s infinite ease-in-out reverse; }

                /* Animasi Kilat Emas & Mengayun */
                @keyframes shine {
                    0% { left: -100%; opacity: 0; }
                    20% { opacity: 0.5; }
                    100% { left: 200%; opacity: 0; }
                }
                .golden-shine::after {
                    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,215,0,0.5) 50%, rgba(255,255,255,0) 100%);
                    transform: skewX(-25deg); animation: shine 5s infinite;
                }
                @keyframes swing {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                .animate-swing { animation: swing 3.5s ease-in-out infinite; transform-origin: top center; }
            `}</style>

            <Head title="Register - Thom Us Hold'em" />

            <div className="min-h-screen bg-wood flex flex-col items-center justify-center p-4 relative overflow-hidden select-none py-12">
                
                {/* --- ORNAMEN BACKGROUND --- */}
                {/* Chip Hijau Kiri */}
                <div className="absolute top-32 left-8 md:left-24 w-20 h-20 bg-green-600 rounded-full border-[6px] border-white border-dashed shadow-2xl animate-float-1 opacity-80 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white rounded-full"></div>
                </div>
                {/* Kartu Queen Hearts Kanan Atas */}
                <div className="absolute top-16 right-8 md:right-32 w-24 h-36 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center justify-center animate-float-2 transform rotate-[15deg] opacity-90 z-0">
                    <span className="text-red-600 font-bold text-3xl">Q</span>
                    <span className="text-red-600 text-5xl">♥</span>
                </div>
                {/* Kartu Jack Clubs Kiri Bawah */}
                <div className="absolute bottom-16 left-8 md:left-28 w-20 h-28 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center justify-center animate-float-2 transform -rotate-[20deg] opacity-80">
                    <span className="text-black font-bold text-2xl">J</span>
                    <span className="text-black text-4xl">♣</span>
                </div>
                {/* Chip Emas Kanan Bawah */}
                <div className="absolute bottom-24 right-10 md:right-32 w-24 h-24 bg-yellow-500 rounded-full border-[8px] border-white border-dashed shadow-2xl animate-float-1 opacity-90 flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-white rounded-full flex items-center justify-center">
                        <span className="font-saloon text-white text-2xl">$</span>
                    </div>
                </div>


                {/* --- KOTAK REGISTER UTAMA --- */}
                <div className="w-full max-w-md relative z-10 mt-8 md:mt-0">
                    
                    {/* Header Papan Nama Kayu */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[115%] z-20 animate-swing">
                        <div className="bg-gradient-to-b from-[#e6aa4c] to-[#b87333] border-4 border-[#5c3a21] rounded-2xl py-3 px-4 shadow-[0_15px_20px_rgba(0,0,0,0.6)] relative overflow-hidden golden-shine">
                            <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-700 shadow-inner"></div>
                            
                            <h1 className="font-saloon text-3xl md:text-4xl text-center text-[#3d2314] drop-shadow-[2px_2px_0_rgba(255,255,255,0.4)]">
                                JOIN THE CLUB
                            </h1>
                            <p className="font-cartoon text-white text-center text-xs md:text-sm drop-shadow-md">
                                CLAIM YOUR FREE WELCOME CHIPS!
                            </p>
                        </div>
                    </div>

                    {/* Container Form Hijau Kasino */}
                    <div className="bg-gradient-to-b from-[#2a6b3d] to-[#12381e] border-[8px] border-[#8b4513] rounded-3xl p-6 md:p-8 pt-16 shadow-[0_30px_50px_rgba(0,0,0,0.8)] relative">
                        
                        <div className="absolute inset-2 rounded-2xl border-4 border-dashed border-[#4ade80]/30 pointer-events-none"></div>

                        <form onSubmit={submit} className="space-y-4 relative z-10">
                            
                            {/* Input Nama */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-base mb-1 drop-shadow-md">
                                    PLAYER NAME
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-2 text-lg font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="name"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Cowboy Thom"
                                    required
                                />
                                {errors.name && <p className="font-cartoon text-[#ff4e42] text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Input Email */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-base mb-1 drop-shadow-md">
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-2 text-lg font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter Email..."
                                    required
                                />
                                {errors.email && <p className="font-cartoon text-[#ff4e42] text-sm mt-1">{errors.email}</p>}
                            </div>

                            {/* Input Password */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-base mb-1 drop-shadow-md">
                                    SECRET PIN (PASSWORD)
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-2 text-lg font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                {errors.password && <p className="font-cartoon text-[#ff4e42] text-sm mt-1">{errors.password}</p>}
                            </div>

                            {/* Input Konfirmasi Password */}
                            <div>
                                <label className="block font-cartoon text-[#ffd700] text-base mb-1 drop-shadow-md">
                                    VERIFY PIN
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full bg-[#fff4e6] border-4 border-[#8b4513] focus:border-[#d32f2f] focus:ring-0 rounded-xl px-4 py-2 text-lg font-cartoon text-[#3d2314] shadow-inner placeholder-[#a37c58] transition-all"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                {errors.password_confirmation && <p className="font-cartoon text-[#ff4e42] text-sm mt-1">{errors.password_confirmation}</p>}
                            </div>

                            {/* Tombol Register Merah Besar */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-b from-[#d32f2f] to-[#9a0007] border-4 border-[#ff8a80] rounded-2xl py-3 shadow-[0_8px_0_#5c0004,0_15px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 hover:shadow-[0_10px_0_#5c0004,0_20px_25px_rgba(0,0,0,0.6)] active:translate-y-2 active:shadow-[0_2px_0_#5c0004,0_5px_10px_rgba(0,0,0,0.5)] transition-all flex justify-center items-center overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-lg"></div>
                                    <span className="font-cartoon text-white text-2xl md:text-3xl tracking-wider drop-shadow-[0_3px_2px_rgba(0,0,0,0.8)]">
                                        {processing ? 'CREATING...' : 'SIGN UP NOW!'}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer / Login Link */}
                        <div className="mt-6 text-center">
                            <div className="bg-[#12381e] border-2 border-[#2a6b3d] rounded-lg p-3 shadow-inner inline-block">
                                <p className="font-cartoon text-[#ffd700] text-sm">
                                    ALREADY IN THE CLUB?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-white hover:text-[#ff4e42] underline decoration-2 underline-offset-2 transition-colors ml-1"
                                    >
                                        TAKE A SEAT
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