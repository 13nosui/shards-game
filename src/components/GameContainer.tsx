import { useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Grid } from './Grid';
import { motion } from 'framer-motion';

export const GameContainer = () => {
    const { grid, slide, breakBlock, score } = useGameLogic();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': slide('UP'); break;
                case 'ArrowDown': slide('DOWN'); break;
                case 'ArrowLeft': slide('LEFT'); break;
                case 'ArrowRight': slide('RIGHT'); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slide]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-mono font-bold tracking-[0.2em] uppercase">Shards</h1>
                <div className="text-sm font-mono opacity-50">Yugo Nakamura Style MVP</div>
            </div>

            <div className="relative group">
                <Grid grid={grid} onBlockClick={breakBlock} />

                {/* Visual feedback for controls */}
                <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4 text-[10px] font-mono opacity-0 group-hover:opacity-30 transition-opacity">
                    <span>[ARROWS] SLIDE</span>
                    <span>[CLICK] BREAK BIG</span>
                </div>
            </div>

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

            {/* Tactile border decoration */}
            <div className="fixed inset-8 border border-black/5 pointer-events-none" />
        </div>
    );
};
