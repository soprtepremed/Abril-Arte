import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Music, Heart, Play, Pause, Search, Filter, Save, Home, SkipBack, SkipForward, X, Check } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Cliente() {
    const [searchParams] = useSearchParams()
    const { songs, fetchClientByCode, getClientRepertory, setSelectedSongs } = useData()

    const [accessCode, setAccessCode] = useState(searchParams.get('code') || '')
    const [client, setClient] = useState(null)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [showSelected, setShowSelected] = useState(false)
    const [saved, setSaved] = useState(false)
    const [loadingLogin, setLoadingLogin] = useState(false)

    // Audio player
    const [currentSong, setCurrentSong] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio] = useState(new Audio())

    useEffect(() => {
        // Auto-login if code in URL
        if (searchParams.get('code')) {
            // Give context a moment to init or handle directly inside handleLogin
            handleLogin()
        }
    }, [])

    useEffect(() => {
        audio.onended = () => setIsPlaying(false)
        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)

        return () => {
            audio.pause()
        }
    }, [audio])

    const handleLogin = async (e) => {
        if (e) e.preventDefault()
        setError('')
        setLoadingLogin(true)

        try {
            const code = accessCode.trim().toUpperCase()
            const found = await fetchClientByCode(code)

            if (!found) {
                setError('Código no válido. Verifica e intenta de nuevo.')
                setLoadingLogin(false)
                return
            }

            // El cliente verá TODO el repertorio
            const repertory = await getClientRepertory(found.id)
            setClient(found)
            setSelected(repertory.selectedSongs || [])
        } catch (error) {
            console.error(error)
            setError('Error al iniciar sesión')
        } finally {
            setLoadingLogin(false)
        }
    }

    const [hasInitialSave, setHasInitialSave] = useState(false)
    const [showLimitWarning, setShowLimitWarning] = useState(false)

    const toggleSelect = (songId) => {
        if (selected.includes(songId)) {
            // Deseleccionar siempre permitido
            setSelected(selected.filter(id => id !== songId))
        } else {
            // Si ya tiene 12, mostrar advertencia antes de permitir más
            if (selected.length >= 12) {
                setShowLimitWarning(true)
                return
            }
            setSelected([...selected, songId])
        }
    }

    const saveSelection = () => {
        if (client) {
            setSelectedSongs(client.id, selected)
            setSaved(true)
            setHasInitialSave(true)
            // No auto-cerrar el modal, el usuario lo cierra manualmente
        }
    }

    const playPause = (song) => {
        if (currentSong?.id === song.id) {
            if (isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        } else {
            if (song.audioUrl) {
                audio.src = song.audioUrl
                audio.play()
                setCurrentSong(song)
            }
        }
    }

    // NUEVO: Mostrar TODAS las canciones del repertorio, no solo las asignadas
    const allSongs = songs || []
    const categories = [...new Set(allSongs.map(s => s.category))]

    let filteredSongs = allSongs
    if (search) {
        filteredSongs = filteredSongs.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.artist.toLowerCase().includes(search.toLowerCase())
        )
    }
    if (category) {
        filteredSongs = filteredSongs.filter(s => s.category === category)
    }
    if (showSelected) {
        filteredSongs = filteredSongs.filter(s => selected.includes(s.id))
    }

    // Login Screen
    if (!client) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="glass rounded-3xl p-10 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C9A962] to-[#A68B3D] flex items-center justify-center shadow-xl animate-pulse-glow">
                                <Music className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="font-display text-3xl font-bold text-[#3D3426] mb-2">Accede a tu Repertorio</h1>
                            <p className="text-[#6B5E4F]">Ingresa el código que te proporcionó tu músico</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#3D3426] mb-2">Código de Acceso</label>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    placeholder="AA-ABC123"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[#E8DDD4] bg-white/50 text-center text-xl tracking-widest font-bold uppercase focus:border-[#C9A962] focus:outline-none transition-colors"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                    <X className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loadingLogin} className="btn-shine w-full py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg shadow-[#C9A962]/30 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                {loadingLogin ? 'Verificando...' : 'Acceder'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#E8DDD4] text-center">
                            <p className="text-sm text-[#8B7D6B]">
                                ¿No tienes un código? <Link to="/#contacto" className="text-[#C9A962] font-medium hover:underline">Contáctanos</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Repertoire Screen
    return (
        <div className="min-h-screen pb-32 relative">
            {/* Imagen de fondo */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/images/IMG_3751.JPG)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Overlay para mejorar legibilidad */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
            </div>

            {/* Contenido sobre el fondo */}
            <div className="relative z-10">
                {/* Header */}
                <header className="glass border-b border-[#C9A962]/20 px-6 py-4 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl text-[#C9A962]">♪</span>
                            <span className="font-display text-xl font-bold text-[#C9A962]">Abril Arte</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white rounded-full text-sm font-medium">
                                <span>{client.name.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Welcome */}
                    <div className="text-center mb-8">
                        <h1 className="font-display text-4xl font-bold text-[#3D3426] mb-2">
                            ¡Hola, <span className="text-[#C9A962]">{client.name.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-[#6B5E4F]">Selecciona las canciones que te gustaría escuchar en tu evento</p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-6 mb-8">
                        <div className="glass rounded-2xl px-8 py-4 text-center">
                            <span className="block font-display text-3xl font-bold text-[#C9A962]">{allSongs.length}</span>
                            <span className="text-sm text-[#8B7D6B]">Disponibles</span>
                        </div>
                        <div className="bg-gradient-to-r from-[#C9A962] to-[#A68B3D] rounded-2xl px-8 py-4 text-center text-white">
                            <span className="block font-display text-3xl font-bold">{selected.length}</span>
                            <span className="text-sm opacity-90">Seleccionadas</span>
                        </div>
                    </div>

                    {/* Advertencia de límite */}
                    {selected.length > 12 && (
                        <div className="mb-8 max-w-3xl mx-auto">
                            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-4 border-amber-400 rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-3xl">⚠️</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900 mb-2 text-lg">⚡ Información Importante</h4>
                                        <p className="text-amber-900 text-base leading-relaxed font-medium">
                                            Has seleccionado <span className="font-bold bg-amber-300 px-2 py-1 rounded text-amber-900">{selected.length} canciones</span>.
                                            Ten en cuenta que <span className="font-bold underline">se tocan aproximadamente 12 canciones por hora</span>.
                                            El contrato es por horas, así que considera cuántas horas necesitarás para tu evento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info general */}
                    <div className="mb-8 max-w-2xl mx-auto">
                        <div className="glass rounded-2xl p-5 text-center">
                            <p className="text-sm text-[#6B5E4F]">
                                💡 <span className="font-semibold">Recuerda:</span> Se interpretan aproximadamente <span className="font-bold text-[#C9A962]">12 canciones por hora</span>
                            </p>
                        </div>
                    </div>

                    {/* Cómo Funciona - 4 Pasos */}
                    <div className="mb-12 glass rounded-3xl p-8">
                        <div className="text-center mb-10">
                            <p className="text-[#C9A962] uppercase text-xs tracking-widest font-semibold mb-2">Cómo Funciona</p>
                            <h2 className="font-display text-3xl font-bold text-[#3D3426]">Tu Evento en 4 Pasos</h2>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {/* Paso 1 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[#C9A962] shadow-lg">1</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-[#3D3426] mb-2">Contáctanos</h3>
                                <p className="text-sm text-[#6B5E4F] leading-relaxed">Cuéntanos sobre tu evento y tus preferencias musicales</p>
                            </div>

                            {/* Flecha */}
                            <div className="hidden md:flex items-center justify-center -mx-8">
                                <svg className="w-8 h-8 text-[#C9A962]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Paso 2 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[#C9A962] shadow-lg">2</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-[#3D3426] mb-2">Recibe tu Código</h3>
                                <p className="text-sm text-[#6B5E4F] leading-relaxed">Te enviamos un código único para acceder a tu repertorio</p>
                            </div>

                            {/* Flecha */}
                            <div className="hidden md:flex items-center justify-center -mx-8">
                                <svg className="w-8 h-8 text-[#C9A962]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Paso 3 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[#C9A962] shadow-lg">3</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-[#3D3426] mb-2">Elige tus Canciones</h3>
                                <p className="text-sm text-[#6B5E4F] leading-relaxed">Escucha previews y selecciona tus favoritas</p>
                            </div>

                            {/* Flecha */}
                            <div className="hidden md:flex items-center justify-center -mx-8">
                                <svg className="w-8 h-8 text-[#C9A962]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Paso 4 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[#C9A962] shadow-lg">4</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-[#3D3426] mb-2">¡Disfruta!</h3>
                                <p className="text-sm text-[#6B5E4F] leading-relaxed">Nosotros nos encargamos de hacer brillar tu evento</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7D6B]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar canción o artista..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white/50 focus:border-[#C9A962] focus:outline-none transition-colors"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white/50 focus:border-[#C9A962] focus:outline-none transition-colors min-w-[150px]"
                        >
                            <option value="">Todas</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button
                            onClick={() => setShowSelected(!showSelected)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${showSelected ? 'bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white' : 'border-2 border-[#E8DDD4] text-[#6B5E4F] hover:border-[#C9A962]'}`}
                        >
                            <Heart className={`w-5 h-5 ${showSelected ? 'fill-current' : ''}`} />
                            Favoritas
                        </button>
                    </div>

                    {/* Songs Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSongs.map(song => {
                            const isSelected = selected.includes(song.id)
                            const isCurrentPlaying = currentSong?.id === song.id && isPlaying

                            return (
                                <div
                                    key={song.id}
                                    className={`glass rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${isSelected ? 'ring-2 ring-[#C9A962] bg-gradient-to-br from-[#C9A962]/5 to-[#C9A962]/10' : 'hover:ring-1 hover:ring-[#C9A962]/30'}`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C9A962] to-[#A68B3D] rounded-l-2xl" />
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => playPause(song)}
                                            disabled={!song.audioUrl}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${song.audioUrl
                                                ? isCurrentPlaying
                                                    ? 'bg-gradient-to-br from-[#C9A962] to-[#A68B3D] text-white shadow-lg animate-pulse'
                                                    : 'bg-gradient-to-br from-[#FAF3EB] to-[#E8DDD4] text-[#C9A962] hover:from-[#C9A962] hover:to-[#A68B3D] hover:text-white hover:shadow-lg'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isCurrentPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-[#3D3426] truncate">{song.title}</h3>
                                            <p className="text-sm text-[#8B7D6B] truncate">{song.artist}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#E8DDD4] text-[#6B5E4F] rounded-full">{song.category}</span>
                                        </div>

                                        <button
                                            onClick={() => toggleSelect(song.id)}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-gradient-to-br from-[#C9A962] to-[#A68B3D] text-white shadow-lg'
                                                : 'border-2 border-[#D4C4B5] text-[#D4C4B5] hover:border-[#C9A962] hover:text-[#C9A962]'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${isSelected ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filteredSongs.length === 0 && (
                        <div className="text-center py-16">
                            <Music className="w-16 h-16 text-[#C9A962] mx-auto mb-4 opacity-50" />
                            <p className="text-[#8B7D6B]">{showSelected ? 'No has seleccionado canciones todavía' : 'No se encontraron canciones'}</p>
                        </div>
                    )}
                </div>

                {/* Audio Player Bar */}
                {currentSong && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg glass-dark rounded-2xl p-4 shadow-2xl z-30">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{currentSong.title}</p>
                                <p className="text-sm text-[#A69A8A] truncate">{currentSong.artist}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-[#D4C4B5] hover:text-white transition-colors">
                                    <SkipBack className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => playPause(currentSong)}
                                    className="w-12 h-12 rounded-full bg-[#C9A962] text-[#3D3426] flex items-center justify-center hover:bg-[#E8D5A3] transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                </button>
                                <button className="p-2 text-[#D4C4B5] hover:text-white transition-colors">
                                    <SkipForward className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => { audio.pause(); setCurrentSong(null) }}
                                className="p-2 text-[#A69A8A] hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Save Bar */}
                <div className="fixed bottom-0 left-0 right-0 glass border-t border-[#C9A962]/20 p-4 z-40">
                    <div className="max-w-6xl mx-auto flex items-center justify-center">
                        <button
                            onClick={saveSelection}
                            disabled={selected.length === 0}
                            className="btn-shine flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg shadow-[#C9A962]/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saved ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    ¡Guardado!
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    {hasInitialSave ? 'Modificar Selección' : 'Guardar Selección'} ({selected.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modal de confirmación */}
                {saved && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-[#3D3426] mb-3">¡Excelente!</h3>
                                <p className="text-lg text-[#6B5E4F] mb-6">
                                    Tus canciones han sido solicitadas correctamente
                                </p>
                                <div className="bg-gradient-to-br from-[#FAF3EB] to-[#F5F0E8] rounded-2xl p-4 mb-6">
                                    <p className="text-sm text-[#8B7D6B]">
                                        <span className="font-bold text-[#C9A962] text-2xl">{selected.length}</span> canciones seleccionadas
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSaved(false)}
                                    className="w-full py-3 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de advertencia de límite */}
                {showLimitWarning && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-amber-400 animate-scale-in">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <span className="text-5xl">⚠️</span>
                                </div>
                                <h3 className="font-display text-3xl font-bold text-amber-900 mb-4">¡Atención!</h3>
                                <div className="bg-white rounded-2xl p-6 mb-6">
                                    <p className="text-lg text-amber-900 leading-relaxed font-medium mb-4">
                                        Ya has seleccionado <span className="font-bold text-2xl text-amber-600">12 canciones</span>
                                    </p>
                                    <div className="bg-amber-100 rounded-xl p-4 border-2 border-amber-300">
                                        <p className="text-base text-amber-900 font-semibold mb-2">
                                            💡 Información importante:
                                        </p>
                                        <p className="text-sm text-amber-800 leading-relaxed">
                                            Se interpretan aproximadamente <span className="font-bold">12 canciones por hora</span>.
                                            El contrato es por horas. Si deseas más canciones, considera contratar más horas para tu evento.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLimitWarning(false)}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-lg text-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
