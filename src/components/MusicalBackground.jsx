import { Music, Music2, Music3, Music4 } from 'lucide-react'

const notes = ['♪', '♫', '♩', '♬', '𝄞', '♭', '♯', '𝄢']

export default function MusicalBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Staff Lines Pattern */}
            <div className="absolute inset-0 staff-pattern opacity-50" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F3] via-[#FAF3EB] to-[#F5EDE3] opacity-90" />

            {/* Floating Musical Notes */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute text-[#C9A962] animate-float-up"
                    style={{
                        left: `${(i * 5) % 100}%`,
                        animationDelay: `${i * 1.2}s`,
                        animationDuration: `${15 + (i % 5) * 3}s`,
                        fontSize: `${1.5 + (i % 3) * 0.8}rem`,
                        opacity: 0.15 + (i % 3) * 0.05
                    }}
                >
                    {notes[i % notes.length]}
                </div>
            ))}

            {/* Golden Sparkles */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={`sparkle-${i}`}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#C9A962] to-[#E8D5A3] animate-sparkle"
                    style={{
                        left: `${10 + (i * 7) % 80}%`,
                        top: `${10 + (i * 11) % 80}%`,
                        animationDelay: `${i * 0.8}s`,
                        animationDuration: `${3 + (i % 3)}s`
                    }}
                />
            ))}

            {/* Large Decorative Notes */}
            <div className="absolute top-20 right-10 text-6xl text-[#C9A962] opacity-10 animate-float" style={{ animationDelay: '0s' }}>
                𝄞
            </div>
            <div className="absolute bottom-40 left-10 text-5xl text-[#C9A962] opacity-10 animate-float" style={{ animationDelay: '1s' }}>
                ♪
            </div>
            <div className="absolute top-1/2 right-20 text-4xl text-[#C9A962] opacity-10 animate-float" style={{ animationDelay: '2s' }}>
                ♫
            </div>
        </div>
    )
}
