import { Block } from './Block';
import type { GridState, BigBlock } from '../types/game';
import { GRID_SIZE } from '../utils/gameUtils';
import { AnimatePresence } from 'framer-motion';

interface GridProps {
    smallBlocks: GridState;
    bigBlocks: BigBlock[];
    onBlockClick: (x: number, y: number) => void;
}

export const Grid = ({ smallBlocks, bigBlocks, onBlockClick }: GridProps) => {
    return (
        <div
            className="relative bg-white/5 border-2 border-black/10 rounded-lg grid-inner-shadow overflow-hidden"
            style={{
                width: 'min(90vw, 500px)',
                height: 'min(90vw, 500px)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '6px',
                padding: '10px'
            }}
        >
            {/* Correct Rendering Loop for Col-Major Array in CSS Grid (Row-Major) */}
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
                Array.from({ length: GRID_SIZE }).map((_, x) => {
                    const block = smallBlocks[x][y]; // Access as [col][row]
                    return (
                        <div key={`cell-${x}-${y}`} className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-md">
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

            {/* Big Blocks Layer (Absolute Overlay) */}
            <AnimatePresence>
                {bigBlocks.map((block) => {
                    const left = `${block.x * 20}%`;
                    const top = `${block.y * 20}%`;
                    const size = '40%'; // 2x2 = 40% width/height

                    return (
                        <div
                            key={block.id}
                            style={{
                                position: 'absolute',
                                left, top, width: size, height: size,
                                padding: '6px', // sync with grid gap
                                zIndex: 10
                            }}
                        >
                            <Block
                                type="big"
                                color={block.color}
                                onClick={() => onBlockClick(block.x, block.y)} // Pass grid coords
                            />
                        </div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};