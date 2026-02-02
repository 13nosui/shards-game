import { motion } from 'framer-motion';
import { RecordsModal } from './RecordsModal';
import type { GameRecord } from '../types/game';

interface HomeScreenProps {
    onStart: () => void;
    bestScore: number;
    records: GameRecord[];
}

export const HomeScreen = ({ onStart, bestScore, records }: HomeScreenProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 z-10">
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

            <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                <motion.button
                    whileHover={{ scale: 1.05, letterSpacing: "0.1em" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="w-full py-4 bg-[var(--gray-12)] text-[var(--color-background)] font-bungee text-2xl tracking-wider rounded-sm hover:opacity-90 transition-all shadow-lg"
                >
                    PLAY
                </motion.button>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Records</span>
                    <RecordsModal records={records} />
                </div>
            </div>

            {bestScore > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="flex flex-col items-center gap-1 font-mono mt-4"
                >
                    <span className="text-[10px] uppercase tracking-widest">Best Score</span>
                    <span className="text-xl font-bungee">{bestScore.toString().padStart(6, '0')}</span>
                </motion.div>
            )}
        </div>
    );
};