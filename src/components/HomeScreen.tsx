import { motion } from 'framer-motion';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// useBGMのインポートは削除

interface HomeScreenProps {
    onStart: () => void;
    bestScore: number;
    isPlaying: boolean;   // 追加
    toggleBGM: () => void; // 追加
}

export const HomeScreen = ({ onStart, bestScore, isPlaying, toggleBGM }: HomeScreenProps) => {
    const { theme, toggleTheme } = useTheme();
    // useBGMフックの呼び出しを削除

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] gap-12 z-10 relative">

            {/* Control Buttons */}
            <div className="absolute top-4 right-4 flex gap-4">
                <button
                    onClick={toggleBGM}
                    className="p-3 bg-[var(--gray-3)] rounded-full hover:bg-[var(--gray-4)] transition-colors text-[var(--gray-12)]"
                    aria-label="Toggle BGM"
                >
                    {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
                <button
                    onClick={() => {
                        console.log('Theme toggle clicked, current theme:', theme);
                        toggleTheme();
                    }}
                    className="p-3 bg-[var(--gray-3)] rounded-full hover:bg-[var(--gray-4)] transition-colors text-[var(--gray-12)]"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>
            </div>

            <div className="flex flex-col items-center gap-4">
                <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="text-7xl md:text-9xl font-bungee tracking-widest text-[var(--gray-12)] select-none"
                >
                    QUOD
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-mono text-sm tracking-[0.3em] uppercase"
                >
                    Spatial Puzzle
                </motion.p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05, letterSpacing: "0.1em" }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="px-16 py-4 bg-[var(--gray-12)] text-[var(--color-background)] font-bungee text-2xl tracking-wider rounded-sm hover:opacity-90 transition-all shadow-lg"
            >
                PLAY
            </motion.button>

            {bestScore > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="flex flex-col items-center gap-1 font-mono mt-8"
                >
                    <span className="text-[10px] uppercase tracking-widest">Best Score</span>
                    <span className="text-xl font-bungee">{bestScore.toString().padStart(6, '0')}</span>
                </motion.div>
            )}
        </div>
    );
};