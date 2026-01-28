import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        // Crear el elemento de audio
        audioRef.current = new Audio('/audio/Azul Jazz - Blue Moon.mp3')
        audioRef.current.loop = true
        audioRef.current.volume = 0.3 // Volumen al 30%

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const toggleMusic = () => {
        if (!hasInteracted) {
            setHasInteracted(true)
        }

        if (isPlaying) {
            audioRef.current?.pause()
        } else {
            audioRef.current?.play()
        }
        setIsPlaying(!isPlaying)
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
