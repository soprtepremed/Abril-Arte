import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Music, Heart, Calendar, Phone, Mail, MessageCircle, Instagram, Facebook, Youtube, Play, Pause, ChevronRight, Star, Users, Award, Check, MapPin } from 'lucide-react'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import WhatsAppButton from '../components/WhatsAppButton'
import MusicPlayer from '../components/MusicPlayer'

export default function Landing() {
    const { songs } = useData()
    const featuredSongs = songs.slice(0, 6)

    // Audio player state
    const [currentSong, setCurrentSong] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio] = useState(new Audio())

    useEffect(() => {
        audio.onended = () => setIsPlaying(false)
        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        return () => audio.pause()
    }, [audio])

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

    // Estado del formulario de contacto
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        fecha_evento: '',
        tipo_evento: '',
        formato_interes: '',
        mensaje: ''
    })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre) return alert('Por favor ingresa tu nombre')

        setSending(true)
        try {
            const { error } = await supabase.from('solicitudes').insert([{
                nombre: formData.nombre,
                telefono: formData.telefono || null,
                fecha_evento: formData.fecha_evento || null,
                tipo_evento: formData.tipo_evento || null,
                formato_interes: formData.formato_interes || null,
                mensaje: formData.mensaje || null
            }])

            if (error) throw error

            setSent(true)
            setFormData({ nombre: '', telefono: '', fecha_evento: '', tipo_evento: '', formato_interes: '', mensaje: '' })
            setTimeout(() => setSent(false), 5000)
        } catch (error) {
            console.error('Error:', error)
            alert('Error al enviar. Intenta de nuevo.')
        } finally {
            setSending(false)
        }
    }

    const servicios = [
        {
            id: 'violin-solo',
            titulo: 'Abril Ruiz Violinista',
            subtitulo: 'Elegancia Atemporal en Cada Nota',
            imagen: `${import.meta.env.BASE_URL}images/IMG_3567.jpg`,
            descripcion: 'El sonido íntimo y emotivo de un violín en vivo añade un toque de sofisticación a cualquier momento especial. Ideal para ceremonias, propuestas de matrimonio o cenas románticas.',
            ideal: [
                'Ceremonias de bodas (entradas, firmas de actas)',
                'Aniversarios o cenas gourmet',
                'Eventos pequeños donde la música sutil es protagonista'
            ]
        },
        {
            id: 'triarte',
            titulo: 'TriArte | Trío',
            subtitulo: 'Violín, Saxofón y Piano',
            imagen: `${import.meta.env.BASE_URL}images/IMG_3675.jpg`,
            descripcion: 'El trío de piano, violín y viola ofrece una experiencia musical envolvente, ideal para eventos que exigen máxima elegancia. Con una riqueza armónica incomparable.',
            ideal: [
                'Bodas en salones o iglesias con acústica destacada',
                'Eventos de alta gama (benéficos, cenas de gala)',
                'Momentos que requieren música de fondo refinada'
            ]
        },
        {
            id: 'duo',
            titulo: 'Dúo de Violín y Saxofón',
            subtitulo: 'Energía y Sofisticación en Armonía',
            imagen: `${import.meta.env.BASE_URL}images/IMG_3583.jpg`,
            descripcion: 'La combinación del violín y el saxofón fusiona lo mejor de dos mundos: la profundidad clásica y la frescura contemporánea. Perfecto para eventos que buscan dinamismo sin perder elegancia.',
            ideal: [
                'Recepciones de boda (brindis, cóctel)',
                'Eventos corporativos o inauguraciones',
                'Fiestas con un toque moderno y chic'
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-[#F5F0E8]">
            <Navbar />
            <WhatsAppButton />
            <MusicPlayer />

            {/* Hero Section - Full Height with Image */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={`${import.meta.env.BASE_URL}images/IMG_3553 copia.jpg`}
                        alt="Abril Arte"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-6 pt-20">
                    <p className="text-[#E8D5A3] uppercase tracking-[0.3em] text-sm mb-4 font-medium">Catálogo</p>
                    <h1 className="font-display text-6xl lg:text-8xl font-bold text-white mb-6 tracking-wide">
                        ABRIL ARTE
                    </h1>
                    <p className="text-white/90 text-xl lg:text-2xl font-light tracking-wider mb-4">
                        LA MÚSICA QUE INSPIRA
                    </p>
                    <p className="text-[#E8D5A3] text-2xl lg:text-3xl font-display italic mb-12">
                        TUS MOMENTOS
                    </p>
                    {/* Scroll Indicator Badge */}
                    <div className="inline-flex flex-col items-center px-8 py-4 bg-[#3D3426]/60 backdrop-blur-sm rounded-full border border-[#C9A962]/40">
                        <p className="text-[#E8D5A3] text-sm tracking-widest uppercase font-medium">
                            Desliza hacia arriba
                        </p>
                        <span className="text-[#C9A962] text-lg mt-1 animate-bounce">↑ ↑ ↑</span>
                    </div>
                </div>
            </section>

            {/* Quienes Somos Section */}
            <section id="nosotros" className="py-20 px-6 bg-[#F5F0E8]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Image */}
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/IMG_3751.JPG`}
                                alt="Abril Arte - Quienes Somos"
                                className="w-full rounded-3xl shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-[#C9A962] text-white p-6 rounded-2xl shadow-xl hidden lg:block">
                                <p className="font-display text-4xl font-bold">10+</p>
                                <p className="text-sm">Años de<br />Experiencia</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <p className="text-[#8B9A7C] uppercase tracking-widest text-sm font-semibold mb-4">QUIENES</p>
                            <h2 className="font-display text-5xl lg:text-6xl font-bold text-[#3D3426] mb-2">SOMOS</h2>
                            <p className="text-[#C9A962] font-display text-xl italic mb-6">Abril | Arte Música para Eventos sociales</p>

                            <p className="text-[#5A5A5A] text-lg leading-relaxed mb-6 text-justify">
                                <strong>Músicos Chiapanecos</strong> Especialistas en música en vivo para eventos sociales.
                                Ofrecemos ambientes sonoros personalizados con arreglos elegantes y versátiles, adaptados a tu estilo.
                                Calidad profesional, repertorio moderno/clásico y un toque único que hará brillar tu ocasión.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <a href="tel:9613591824" className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group">
                                    <Phone className="w-6 h-6 text-[#C9A962] group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-xs text-[#8B7D6B] uppercase">Reserva Ahora</p>
                                        <p className="font-bold text-[#3D3426]">961 359 1824</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servicios / Formatos Musicales */}
            <section id="servicios" className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[#C9A962] uppercase tracking-widest text-sm font-semibold mb-4">Nuestros Formatos</p>
                        <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#3D3426] mb-4">SERVICIOS MUSICALES</h2>
                        <p className="text-[#6B5E4F] max-w-2xl mx-auto">Elige el formato perfecto para tu evento. Cada uno ofrece una experiencia única y memorable.</p>
                    </div>

                    <div className="space-y-24">
                        {servicios.map((servicio, index) => (
                            <div
                                key={servicio.id}
                                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
                            >
                                {/* Image */}
                                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                                        <img
                                            src={servicio.imagen}
                                            alt={servicio.titulo}
                                            className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                                    <p className="text-[#8B9A7C] uppercase tracking-widest text-sm font-medium mb-2">{servicio.subtitulo}</p>
                                    <h3 className="font-display text-4xl lg:text-5xl font-bold text-[#3D3426] mb-6">{servicio.titulo}</h3>

                                    <p className="text-[#5A5A5A] text-lg leading-relaxed mb-8 text-justify">
                                        {servicio.descripcion}
                                    </p>

                                    <div className="bg-[#F5F0E8] rounded-2xl p-6 mb-8">
                                        <p className="font-semibold text-[#3D3426] mb-4">Ideal para:</p>
                                        <ul className="space-y-3">
                                            {servicio.ideal.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-[#5A5A5A]">
                                                    <span className="text-[#C9A962] mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <a href="#contacto" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                        <Calendar className="w-5 h-5" />
                                        Reservar Este Formato
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Repertorio Destacado */}
            <section id="repertorio" className="py-20 px-6 bg-[#F5F0E8]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#C9A962] uppercase tracking-widest text-sm font-semibold mb-4">♪ Repertorio</p>
                        <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#3D3426] mb-4">Canciones Destacadas</h2>
                        <p className="text-[#6B5E4F] max-w-2xl mx-auto">Una muestra de nuestro amplio repertorio. ¡Solicita tu código de cliente para ver la lista completa!</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {featuredSongs.map((song, index) => {
                            const isCurrentPlaying = currentSong?.id === song.id && isPlaying
                            return (
                                <div
                                    key={song.id}
                                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-transparent hover:border-[#C9A962]/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => playPause(song)}
                                            disabled={!song.audioUrl}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${song.audioUrl
                                                    ? isCurrentPlaying
                                                        ? 'bg-gradient-to-br from-[#C9A962] to-[#A68B3D] animate-pulse'
                                                        : 'bg-gradient-to-br from-[#C9A962] to-[#A68B3D] group-hover:scale-110'
                                                    : 'bg-gray-300 cursor-not-allowed'
                                                }`}
                                        >
                                            {isCurrentPlaying ? (
                                                <Pause className="w-5 h-5" fill="currentColor" />
                                            ) : (
                                                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-[#3D3426] truncate">{song.title}</h4>
                                            <p className="text-sm text-[#8B7D6B] truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className="inline-block px-3 py-1 text-xs font-medium bg-[#E8DDD4] text-[#6B5E4F] rounded-full">
                                            {song.category}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-center">
                        <p className="text-[#6B5E4F] mb-6">¿Ya tienes tu código de cliente? Accede a tu repertorio personalizado</p>
                        <Link to="/cliente" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                            <Heart className="w-5 h-5" />
                            Seleccionar Mi Repertorio
                        </Link>
                    </div>
                </div>
            </section>

            {/* Proceso */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[#C9A962] uppercase tracking-widest text-sm font-semibold mb-4">Cómo Funciona</p>
                        <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#3D3426]">Tu Evento en 4 Pasos</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-10">
                        {/* Paso 1 - Contáctanos */}
                        <div className="relative group">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-28 h-28 mb-6">
                                    {/* Círculo de fondo con efecto glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                                    {/* Círculo principal */}
                                    <div className="absolute inset-3 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    {/* Badge de número */}
                                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-display text-xl font-bold text-[#C9A962] shadow-xl border-2 border-[#FAF3EB]">01</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-[#3D3426] mb-3">Contáctanos</h3>
                                <p className="text-[#6B5E4F] leading-relaxed">Cuéntanos sobre tu evento y tus preferencias musicales</p>
                            </div>
                            {/* Flecha decorativa */}
                            <div className="hidden md:block absolute top-12 -right-5 z-10">
                                <svg className="w-10 h-10 text-[#C9A962]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>

                        {/* Paso 2 - Recibe tu Código */}
                        <div className="relative group">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-28 h-28 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                                    <div className="absolute inset-3 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-display text-xl font-bold text-[#C9A962] shadow-xl border-2 border-[#FAF3EB]">02</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-[#3D3426] mb-3">Recibe tu Código</h3>
                                <p className="text-[#6B5E4F] leading-relaxed">Te enviamos un código único para acceder a tu repertorio</p>
                            </div>
                            <div className="hidden md:block absolute top-12 -right-5 z-10">
                                <svg className="w-10 h-10 text-[#C9A962]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>

                        {/* Paso 3 - Elige tus Canciones */}
                        <div className="relative group">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-28 h-28 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                                    <div className="absolute inset-3 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-display text-xl font-bold text-[#C9A962] shadow-xl border-2 border-[#FAF3EB]">03</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-[#3D3426] mb-3">Elige tus Canciones</h3>
                                <p className="text-[#6B5E4F] leading-relaxed">Escucha previews y selecciona tus favoritas</p>
                            </div>
                            <div className="hidden md:block absolute top-12 -right-5 z-10">
                                <svg className="w-10 h-10 text-[#C9A962]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>

                        {/* Paso 4 - Disfruta */}
                        <div className="relative group">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-28 h-28 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                                    <div className="absolute inset-3 bg-gradient-to-br from-[#C9A962] to-[#A68B3D] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-display text-xl font-bold text-[#C9A962] shadow-xl border-2 border-[#FAF3EB]">04</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-[#3D3426] mb-3">¡Disfruta!</h3>
                                <p className="text-[#6B5E4F] leading-relaxed">Nosotros nos encargamos de hacer brillar tu evento</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="py-20 px-6 bg-[#3D3426] text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <p className="text-[#C9A962] uppercase tracking-widest text-sm font-semibold mb-4">Reserva Ahora</p>
                            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">Haz de tu Evento Algo Inolvidable</h2>
                            <p className="text-[#D4C4B5] mb-8 text-lg">
                                Contáctanos y cuéntanos sobre tu evento. Juntos crearemos el ambiente musical perfecto para tu celebración especial.
                            </p>

                            <div className="space-y-4 mb-8">
                                <a href="tel:9613591824" className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <Phone className="w-6 h-6 text-[#C9A962]" />
                                    <div>
                                        <p className="text-xs text-[#A69A8A]">Teléfono</p>
                                        <p className="font-semibold">961 359 1824</p>
                                    </div>
                                </a>
                                <a href="mailto:abrilruizlopez5@gmail.com" className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <Mail className="w-6 h-6 text-[#C9A962]" />
                                    <span>abrilruizlopez5@gmail.com</span>
                                </a>
                            </div>

                            <div className="flex items-center gap-2 text-[#A69A8A]">
                                <MapPin className="w-5 h-5" />
                                <span>Chiapas, México</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 text-[#3D3426]">
                            <h3 className="font-display text-2xl font-bold mb-6">Solicita Información</h3>

                            {sent ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h4 className="text-xl font-bold text-[#C9A962] mb-2">¡Solicitud Enviada!</h4>
                                    <p className="text-[#6B5E4F]">Nos pondremos en contacto contigo pronto.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nombre *</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors"
                                            placeholder="Tu nombre completo"
                                            required
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors"
                                                placeholder="Tu teléfono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha del Evento</label>
                                            <input
                                                type="date"
                                                name="fecha_evento"
                                                value={formData.fecha_evento}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tipo de Evento</label>
                                        <select
                                            name="tipo_evento"
                                            value={formData.tipo_evento}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors"
                                        >
                                            <option value="">Selecciona una opción</option>
                                            <option value="Boda">Boda</option>
                                            <option value="XV Años">XV Años</option>
                                            <option value="Evento Corporativo">Evento Corporativo</option>
                                            <option value="Serenata / Propuesta">Serenata / Propuesta</option>
                                            <option value="Ceremonia Religiosa">Ceremonia Religiosa</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Formato de Interés</label>
                                        <select
                                            name="formato_interes"
                                            value={formData.formato_interes}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors"
                                        >
                                            <option value="">Selecciona una opción</option>
                                            <option value="Violín Solo">Violín Solo</option>
                                            <option value="Dúo Violín + Saxofón">Dúo Violín + Saxofón</option>
                                            <option value="TriArte (Trío)">TriArte (Trío)</option>
                                            <option value="No estoy seguro(a)">No estoy seguro(a)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mensaje</label>
                                        <textarea
                                            name="mensaje"
                                            value={formData.mensaje}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors resize-none"
                                            placeholder="Cuéntanos sobre tu evento..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {sending ? 'Enviando...' : 'Enviar Solicitud'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2A2419] text-white py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎻</span>
                        <div>
                            <p className="font-display text-xl font-bold text-[#C9A962]">ABRIL ARTE</p>
                            <p className="text-xs text-[#8B7D6B] uppercase tracking-wider">Música para Eventos Sociales</p>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/abrilviolin2" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#C9A962]/20 hover:bg-[#C9A962] rounded-full flex items-center justify-center transition-colors group">
                            <Facebook className="w-5 h-5 text-[#C9A962] group-hover:text-white transition-colors" />
                        </a>
                        <a href="https://www.tiktok.com/@abril.violin" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#C9A962]/20 hover:bg-[#C9A962] rounded-full flex items-center justify-center transition-colors group">
                            <svg className="w-5 h-5 text-[#C9A962] group-hover:text-white transition-colors fill-current" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/abril.violin" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#C9A962]/20 hover:bg-[#C9A962] rounded-full flex items-center justify-center transition-colors group">
                            <Instagram className="w-5 h-5 text-[#C9A962] group-hover:text-white transition-colors" />
                        </a>
                    </div>

                    <div className="flex gap-6 text-sm text-[#A69A8A]">
                        <Link to="/admin" className="hover:text-[#C9A962] transition-colors">Admin</Link>
                        <Link to="/cliente" className="hover:text-[#C9A962] transition-colors">Clientes</Link>
                        <a href="#contacto" className="hover:text-[#C9A962] transition-colors">Contacto</a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[#3D3426] text-center">
                    <p className="text-xs text-[#6B5E4F]">© 2024 Abril Arte. Chiapas, México</p>
                </div>
            </footer>
        </div>
    )
}
