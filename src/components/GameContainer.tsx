import { useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Grid } from './Grid';
import { motion } from 'framer-motion';

export const GameContainer = () => {
    const { smallBlocks, bigBlocks, slide, breakBlock, score, gameOver, isProcessing } = useGameLogic();

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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8 select-none">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-mono font-bold tracking-[0.2em] uppercase">SHARDS</h1>
                <div className="text-xs font-mono opacity-50">
                    {gameOver ? "GAME OVER - RELOAD TO RESTART" : isProcessing ? "PROCESSING..." : "READY"}
                </div>
            </div>

            <Grid
                smallBlocks={smallBlocks}
                bigBlocks={bigBlocks}
                onBlockClick={breakBlock}
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

            <div className="text-[10px] font-mono opacity-30 text-center">
                CLICK GREY ROCKS TO BREAK<br />
                ARROWS TO SLIDE<br />
                MATCH 3+ (ORTHO or DIAG)
            </div>
        </div>
    );
};