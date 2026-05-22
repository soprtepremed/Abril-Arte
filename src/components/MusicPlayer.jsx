import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
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
                    hasStartedRef.current = true
                    console.log(`🎵 [MusicPlayer] ¡Música de fondo iniciada con éxito! (Activada por: ${source})`)
                    removeInteractionListeners()
                })
                .catch((err) => {
                    if (source === 'Carga inmediata (Autoplay)') {
                        console.warn("⚠️ [MusicPlayer] Autoplay inmediato bloqueado por el navegador. El reproductor comenzará a sonar automáticamente con tu primera interacción (clic, scroll, toque, tecla)...");
                    } else {
                        console.error(`❌ [MusicPlayer] Intento fallido de reproducir desde ${source}:`, err);
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
        }
    }, [])

    const toggleMusic = (e) => {
        if (e) e.stopPropagation() // Evitar que el clic en el botón active los listeners globales
        
        hasStartedRef.current = true

        if (isPlaying) {
            audioRef.current?.pause()
            setIsPlaying(false)
        } else {
            audioRef.current?.play()
                .then(() => {
                    setIsPlaying(true)
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

            {/* Tooltip */}
            <div className="absolute left-16 px-3 py-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                <p className="text-sm text-gray-700 font-medium">
                    {isPlaying ? '🎵 Pausar música' : '🎵 Reproducir música'}
                </p>
            </div>
        </button>
    )
}
