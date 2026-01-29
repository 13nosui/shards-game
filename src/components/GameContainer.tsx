import { useEffect, useCallback } from 'react';
import type { Direction, GridState, Point } from '../types/game';
import { GameScene } from './3d/GameScene';
import { motion, AnimatePresence } from 'framer-motion';

interface GameContainerProps {
    smallBlocks: GridState;
    slide: (direction: Direction) => void;
    score: number;
    gameOver: boolean;
    isProcessing: boolean;
    nextSpawnColors: string[];
    nextSpawnPos: Point | null;
    bumpEvent: { x: number; y: number; id: number } | null;
    comboCount: number;
}

export const GameContainer = ({
    smallBlocks,
    slide,
    score,
    gameOver,
    isProcessing,
    nextSpawnColors,
    nextSpawnPos,
    bumpEvent,
    comboCount
}: GameContainerProps) => {

    const handleSlide = useCallback((dir: Direction) => {
        slide(dir);
    }, [slide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': handleSlide('UP'); break;
                case 'ArrowDown': handleSlide('DOWN'); break;
                case 'ArrowLeft': handleSlide('LEFT'); break;
                case 'ArrowRight': handleSlide('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSlide]);

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-8 select-none w-[95vw] max-w-[600px] mx-auto relative">
            {/* Combo Indicator */}
            <AnimatePresence>
                {comboCount > 1 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: -20 }}
                        className="absolute top-20 right-4 z-50 flex flex-col items-center"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-5xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] italic leading-tight">
                                {comboCount}
                            </span>
                            <span className="text-[10px] font-black text-white bg-ruby-500 px-3 py-0.5 rounded-full shadow-lg -mt-1 tracking-widest uppercase">
                                COMBO
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-mono font-bold tracking-[0.2em] uppercase">SHARDS</h1>
                <div className="text-xs font-mono opacity-50 uppercase tracking-widest">
                    {gameOver ? "GAME OVER" : isProcessing ? "SWEEPING..." : "READY"}
                </div>

                {/* Next Spawn Preview */}
                <div className="flex flex-col items-center gap-1 mt-2">
                    <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Next</span>
                    <div className="grid grid-cols-2 gap-1 p-1.5 bg-gray-50/50 rounded-sm border border-gray-100/50 shadow-sm">
                        {nextSpawnColors.map((c, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-[2px]"
                                style={{
                                    backgroundColor: c,
                                    boxShadow: `inset 0 0 4px rgba(0,0,0,0.1)`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <GameScene
                smallBlocks={smallBlocks}
                nextSpawnPos={nextSpawnPos}
                nextSpawnColors={nextSpawnColors}
                bumpEvent={bumpEvent}
            />

            <div className="flex flex-col items-center gap-1">
                <div className="text-xs font-mono uppercase tracking-widest opacity-30">Score</div>
                <motion.div
                    key={score}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-mono font-light"
                >
                    {score.toString().padStart(6, '0')}
                </motion.div>
            </div>

            <div className="text-[10px] font-mono opacity-30 text-center uppercase tracking-widest">
                ARROWS TO SLIDE<br />
                MATCH 3+ COLORS (ORTHO or DIAG)
            </div>
        </div>
    );
};