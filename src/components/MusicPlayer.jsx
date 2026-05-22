import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const { setIsAudioPlaying } = useData()
    const audioRef = useRef(null)
    const hasStartedRef = useRef(false)

    useEffect(() => {
        // Crear el elemento de audio con precarga optimizada
        const audio = new Audio('/audio/Azul Jazz - Blue Moon.mp3')
        audio.loop = true
        audio.volume = 0.3 // Volumen al 30%
        audio.preload = 'auto' // Indicar al navegador que descargue todo el archivo de inmediato
        audio.load() // Iniciar la carga/buffering de fondo de inmediato
        audioRef.current = audio

        const startAudio = (source) => {
            if (hasStartedRef.current) return

            audio.play()
                .then(() => {
                    setIsPlaying(true)
                    setIsAudioPlaying(true) // Sincronizar estado global
                    hasStartedRef.current = true
                    setShowPrompt(false) // Ocultar el prompt
                    console.log(`🎵 [MusicPlayer] ¡Música de fondo iniciada con éxito! (Activada por: ${source})`)
                    removeInteractionListeners()
                })
                .catch((err) => {
                    if (source === 'Carga inmediata (Autoplay)') {
                        console.warn("⚠️ [MusicPlayer] Autoplay inmediato bloqueado por el navegador. El reproductor comenzará a sonar automáticamente con tu primera interacción (clic, scroll, toque, tecla)...");
                    } else {
                        console.error(`❌ [MusicPlayer] Intento fallido de reproducir desde ${source}:`, err);
                    }
                    
                    // Mostrar prompt inteligente de interacción si es bloqueado en scroll o carga inicial
                    if (source.includes('scroll') || source.includes('Autoplay')) {
                        setShowPrompt(true)
                    }
                })
        }

        const handleUserInteraction = (e) => {
            startAudio(`Interacción de usuario (${e.type})`)
        }

        const removeInteractionListeners = () => {
            window.removeEventListener('click', handleUserInteraction)
            window.removeEventListener('scroll', handleUserInteraction)
            window.removeEventListener('touchstart', handleUserInteraction)
            window.removeEventListener('keypress', handleUserInteraction)
        }

        // 1. Intentar reproducir de forma inmediata
        startAudio('Carga inmediata (Autoplay)')

        // 2. Si el navegador lo bloquea, escuchar la primera interacción real del usuario
        window.addEventListener('click', handleUserInteraction)
        window.addEventListener('scroll', handleUserInteraction)
        window.addEventListener('touchstart', handleUserInteraction)
        window.addEventListener('keypress', handleUserInteraction)

        return () => {
            removeInteractionListeners()
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            setIsAudioPlaying(false) // Limpiar estado global
        }
    }, [setIsAudioPlaying])

    const toggleMusic = (e) => {
        if (e) e.stopPropagation() // Evitar que el clic en el botón active los listeners globales
        
        hasStartedRef.current = true
        setShowPrompt(false)

        if (isPlaying) {
            audioRef.current?.pause()
            setIsPlaying(false)
            setIsAudioPlaying(false)
        } else {
            audioRef.current?.play()
                .then(() => {
                    setIsPlaying(true)
                    setIsAudioPlaying(true)
                })
                .catch((err) => {
                    console.error("Error al reproducir el audio manualmente:", err)
                })
        }
    }

    return (
        <button
            onClick={toggleMusic}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#3D3426]/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-[#C9A962] transition-all group"
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
            {isPlaying ? (
                <Volume2 className="w-6 h-6 text-[#C9A962] group-hover:text-white transition-colors" />
            ) : (
                <VolumeX className="w-6 h-6 text-[#C9A962] group-hover:text-white transition-colors" />
            )}

            {/* Pulse animation when playing */}
            {isPlaying && (
                <span className="absolute inset-0 rounded-full bg-[#C9A962]/30 animate-ping" />
            )}

            {/* Default Tooltip on Hover */}
            <div className="absolute left-16 px-3 py-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                <p className="text-sm text-gray-700 font-medium">
                    {isPlaying ? '🎵 Pausar música' : '🎵 Reproducir música'}
                </p>
            </div>

            {/* Premium Autoplay Blocker Helper Tooltip */}
            {showPrompt && !isPlaying && (
                <div className="absolute left-16 px-4 py-2.5 bg-[#1A140C]/95 border border-[#C9A962]/30 rounded-lg shadow-2xl animate-bounce whitespace-nowrap pointer-events-none z-50">
                    <p className="text-xs text-[#FAF3EB] font-medium flex items-center gap-2">
                        <span className="text-[#C9A962] animate-pulse">✨</span> 
                        Haz un clic en la página para activar la música de fondo
                    </p>
                    {/* Small arrow pointing to the player button */}
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-[#1A140C] border-l border-b border-[#C9A962]/30 rotate-45" />
                </div>
            )}
        </button>
    )
}
