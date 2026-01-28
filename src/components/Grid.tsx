import { Block } from './Block';
import type { GridState } from '../types/game';
import { GRID_SIZE } from '../utils/gameUtils';
import { AnimatePresence, motion } from 'framer-motion';

interface GridProps {
    smallBlocks: GridState;
}

export const Grid = ({ smallBlocks }: GridProps) => {
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
            className="relative bg-white border border-black/5 grid-inner-shadow overflow-hidden"
            style={{
                width: 'var(--grid-width)',
                height: 'var(--grid-width)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                gap: 'var(--grid-gap)',
                padding: 'var(--grid-padding)'
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