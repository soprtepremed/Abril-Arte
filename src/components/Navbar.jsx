import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Home } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const isHome = location.pathname === '/'
    const { isAudioPlaying } = useData()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A140C]/90 backdrop-blur-xl border-b border-[#C9A962]/10 shadow-lg shadow-black/15">
            {/* Subtle Inline Styles for the Gentle Matte Equalizer */}
            <style>{`
                @keyframes gentle-eq-1 {
                    0%, 100% { height: 4px; }
                    50% { height: 16px; }
                }
                @keyframes gentle-eq-2 {
                    0%, 100% { height: 6px; }
                    50% { height: 12px; }
                }
                @keyframes gentle-eq-3 {
                    0%, 100% { height: 3px; }
                    50% { height: 14px; }
                }
                .eq-bar-1 { animation: gentle-eq-1 1.4s ease-in-out infinite; }
                .eq-bar-2 { animation: gentle-eq-2 1.0s ease-in-out infinite; }
                .eq-bar-3 { animation: gentle-eq-3 1.7s ease-in-out infinite; }
            `}</style>

            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Brand Signature */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3.5 group">
                            {/* Matte Antique Gold SVG Music Emblem */}
                            <div className="p-2 bg-[#FAF3EB]/5 rounded-lg border border-[#C9A962]/10 group-hover:border-[#C9A962]/30 group-hover:bg-[#FAF3EB]/10 transition-all duration-500">
                                <svg className="w-5.5 h-5.5 text-[#C9A962] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
                                    <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-2xl font-semibold text-[#FAF3EB] tracking-wide group-hover:text-[#C9A962] transition-colors duration-300">Abril Arte</span>
                                <span className="text-[9px] text-[#FAF3EB]/50 uppercase tracking-[0.3em] -mt-0.5 font-medium">Música para Eventos</span>
                            </div>
                        </Link>

                        {/* Interactive Quiet Live Audio Visualizer */}
                        <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-[#C9A962]/15 h-7">
                            <div className="flex items-end gap-[3px] h-4 w-5">
                                <div className={`w-[2px] bg-[#C9A962]/60 rounded-full transition-all duration-500 ${isAudioPlaying ? 'eq-bar-1' : 'h-[4px]'}`} />
                                <div className={`w-[2px] bg-[#C9A962]/60 rounded-full transition-all duration-500 ${isAudioPlaying ? 'eq-bar-2' : 'h-[7px]'}`} />
                                <div className={`w-[2px] bg-[#C9A962]/60 rounded-full transition-all duration-500 ${isAudioPlaying ? 'eq-bar-3' : 'h-[3px]'}`} />
                            </div>
                            <span className="text-[9px] text-[#FAF3EB]/40 uppercase tracking-[0.2em] font-semibold select-none">
                                {isAudioPlaying ? 'En vivo' : 'Ambiente'}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {isHome ? (
                            <>
                                <a href="#repertorio" className="text-[#FAF3EB]/70 hover:text-[#C9A962] transition-colors duration-300 font-medium text-sm relative py-1.5 group">
                                    Repertorio
                                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#C9A962] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                                </a>
                                <a href="#servicios" className="text-[#FAF3EB]/70 hover:text-[#C9A962] transition-colors duration-300 font-medium text-sm relative py-1.5 group">
                                    Servicios
                                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#C9A962] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                                </a>
                                <a href="#nosotros" className="text-[#FAF3EB]/70 hover:text-[#C9A962] transition-colors duration-300 font-medium text-sm relative py-1.5 group">
                                    Nosotros
                                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#C9A962] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                                </a>
                                <a href="#testimonios" className="text-[#FAF3EB]/70 hover:text-[#C9A962] transition-colors duration-300 font-medium text-sm relative py-1.5 group">
                                    Experiencias
                                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#C9A962] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                                </a>
                            </>
                        ) : (
                            <Link to="/" className="text-[#FAF3EB]/70 hover:text-[#C9A962] transition-colors duration-300 font-medium text-sm flex items-center gap-2">
                                <Home className="w-4 h-4 text-[#C9A962]" />
                                Inicio
                            </Link>
                        )}
                        <a href={isHome ? '#contacto' : '/#contacto'} className="px-6 py-2 bg-[#C9A962] text-[#1A140C] font-semibold text-sm rounded-full shadow-md shadow-black/10 hover:bg-[#BCA05A] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300">
                            Contacto
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors p-1">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-[#1A140C]/95 backdrop-blur-2xl border-b border-[#C9A962]/10 px-8 py-6 space-y-5 shadow-2xl shadow-black/50 transition-all duration-300">
                    {isHome ? (
                        <div className="flex flex-col gap-4">
                            <a href="#repertorio" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-1.5 border-b border-white/5 text-base">Repertorio</a>
                            <a href="#servicios" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-1.5 border-b border-white/5 text-base">Servicios</a>
                            <a href="#nosotros" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-1.5 border-b border-white/5 text-base">Nosotros</a>
                            <a href="#testimonios" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-1.5 border-b border-white/5 text-base">Experiencias</a>
                            <a href="#contacto" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-1.5 border-b border-white/5 text-base">Contacto</a>
                        </div>
                    ) : (
                        <Link to="/" onClick={() => setIsOpen(false)} className="block text-[#FAF3EB]/80 hover:text-[#C9A962] transition-colors font-medium py-2 text-base">Inicio</Link>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-[#C9A962]/10">
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="text-[#FAF3EB]/40 hover:text-[#C9A962] font-medium py-2 text-sm transition-colors">
                            Panel Admin
                        </Link>
                        {/* Mobile Audio Equalizer Indicator */}
                        <div className="flex items-center gap-2 pr-1">
                            <span className="text-[9px] text-[#FAF3EB]/40 uppercase tracking-[0.15em] font-semibold">
                                {isAudioPlaying ? 'Sonando' : 'Ambiente'}
                            </span>
                            <div className="flex items-end gap-[2px] h-3.5 w-4">
                                <div className={`w-[1.5px] bg-[#C9A962]/50 rounded-full transition-all duration-300 ${isAudioPlaying ? 'eq-bar-1' : 'h-[3px]'}`} />
                                <div className={`w-[1.5px] bg-[#C9A962]/50 rounded-full transition-all duration-300 ${isAudioPlaying ? 'eq-bar-2' : 'h-[6px]'}`} />
                                <div className={`w-[1.5px] bg-[#C9A962]/50 rounded-full transition-all duration-300 ${isAudioPlaying ? 'eq-bar-3' : 'h-[2px]'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

