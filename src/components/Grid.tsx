import { useState, useCallback } from 'react';
import { Block } from './Block';
import type { GridState } from '../types/game';
import { GRID_SIZE } from '../utils/gameUtils';
import { AnimatePresence, motion } from 'framer-motion';

interface GridProps {
    smallBlocks: GridState;
}

export const Grid = ({ smallBlocks }: GridProps) => {
    const [pulse, setPulse] = useState(0);

    const handleGridReaction = useCallback(() => {
        setPulse(p => p + 1);
    }, []);

    return (
        <motion.div
            animate={{
                scale: [1, 1.015, 1],
            }}
            transition={{
                duration: 0.15,
                ease: "easeOut",
                times: [0, 0.5, 1],
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
            key={pulse} // Trigger animation on state change
            className="relative bg-white border border-black/5 grid-inner-shadow overflow-hidden"
            style={{
                width: 'min(90vw, 500px)',
                height: 'min(90vw, 500px)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '1px',
                padding: '2px'
            }}
        >
            {/* Correct Rendering Loop for Col-Major Array in CSS Grid (Row-Major) */}
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
                Array.from({ length: GRID_SIZE }).map((_, x) => {
                    const block = smallBlocks[x][y]; // Access as [col][row]
                    return (
                        <div key={`cell-${x}-${y}`} className="relative w-full h-full flex items-center justify-center bg-black/[0.02] border-[0.5px] border-black/5 rounded-none">
                            <AnimatePresence mode="popLayout">
                                {block && (
                                    <Block
                                        key={block.id}
                                        type="small"
                                        color={block.color}
                                        onReaction={handleGridReaction}
                                        onClick={() => { }} // Small blocks not clickable
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })
            ))}
        </motion.div>
    );
};