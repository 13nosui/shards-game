import { useEffect, useCallback } from 'react';
import type { Direction, GridState } from '../types/game';
import { GameScene } from './3d/GameScene';
import { motion } from 'framer-motion';

interface GameContainerProps {
    smallBlocks: GridState;
    slide: (direction: Direction) => void;
    score: number;
    gameOver: boolean;
    isProcessing: boolean;
}

export const GameContainer = ({
    smallBlocks,
    slide,
    score,
    gameOver,
    isProcessing
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8 select-none w-full max-w-[600px] mx-auto">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-mono font-bold tracking-[0.2em] uppercase">SHARDS</h1>
                <div className="text-xs font-mono opacity-50 uppercase tracking-widest">
                    {gameOver ? "GAME OVER" : isProcessing ? "SWEEPING..." : "READY"}
                </div>
            </div>

            <GameScene
                smallBlocks={smallBlocks}
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