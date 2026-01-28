import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Home } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const isHome = location.pathname === '/'

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2A2419]/30 backdrop-blur-lg border-b border-[#C9A962]/20">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <span className="text-3xl text-[#E8D5A3] group-hover:scale-110 transition-transform">♪</span>
                        <div className="flex flex-col">
                            <span className="font-display text-3xl font-bold text-[#E8D5A3] tracking-wide">Abril Arte</span>
                            <span className="text-[10px] text-white/60 uppercase tracking-[0.25em] -mt-1">Música para Eventos</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {isHome ? (
                            <>
                                <a href="#repertorio" className="text-white/90 hover:text-[#C9A962] transition-colors font-medium relative group">
                                    Repertorio
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C9A962] to-[#E8D5A3] group-hover:w-full transition-all duration-300" />
                                </a>
                                <a href="#servicios" className="text-white/90 hover:text-[#C9A962] transition-colors font-medium relative group">
                                    Servicios
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C9A962] to-[#E8D5A3] group-hover:w-full transition-all duration-300" />
                                </a>
                                <a href="#nosotros" className="text-white/90 hover:text-[#C9A962] transition-colors font-medium relative group">
                                    Nosotros
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C9A962] to-[#E8D5A3] group-hover:w-full transition-all duration-300" />
                                </a>
                            </>
                        ) : (
                            <Link to="/" className="text-white/90 hover:text-[#C9A962] transition-colors font-medium flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                Inicio
                            </Link>
                        )}
                        <a href={isHome ? '#contacto' : '/#contacto'} className="btn-shine px-6 py-2.5 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg shadow-[#C9A962]/30 hover:shadow-xl transition-all duration-300">
                            Contacto
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#2A2419]/95 backdrop-blur-md border-t border-[#C9A962]/30 px-6 py-4 space-y-4">
                    {isHome ? (
                        <>
                            <a href="#repertorio" onClick={() => setIsOpen(false)} className="block text-white/90 hover:text-[#C9A962] font-medium py-2">Repertorio</a>
                            <a href="#servicios" onClick={() => setIsOpen(false)} className="block text-white/90 hover:text-[#C9A962] font-medium py-2">Servicios</a>
                            <a href="#nosotros" onClick={() => setIsOpen(false)} className="block text-white/90 hover:text-[#C9A962] font-medium py-2">Nosotros</a>
                            <a href="#contacto" onClick={() => setIsOpen(false)} className="block text-white/90 hover:text-[#C9A962] font-medium py-2">Contacto</a>
                        </>
                    ) : (
                        <Link to="/" onClick={() => setIsOpen(false)} className="block text-white/90 hover:text-[#C9A962] font-medium py-2">Inicio</Link>
                    )}
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-[#A69A8A] hover:text-[#C9A962] font-medium py-2 text-sm">Panel Admin</Link>
                </div>
            )}
        </nav>
    )
}

