import { Block } from './Block';
import type { GridState, BigBlock } from '../types/game';
import { GRID_SIZE } from '../utils/gameUtils';

interface GridProps {
    smallBlocks: GridState;
    bigBlocks: BigBlock[];
    onBlockClick: (x: number, y: number) => void;
}

export const Grid = ({ smallBlocks, bigBlocks, onBlockClick }: GridProps) => {
    return (
        <div
            className="relative bg-white/5 border-2 border-black/10 rounded-lg shadow-inner overflow-hidden"
            style={{
                width: 'min(90vw, 500px)',
                height: 'min(90vw, 500px)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '4px',
                padding: '8px'
            }}
        >
            {/* 修正: 不要な map ループを削除しました */}

            {/* Correct Rendering Loop for Col-Major Array in CSS Grid (Row-Major) */}
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
                Array.from({ length: GRID_SIZE }).map((_, x) => {
                    const block = smallBlocks[x][y]; // Access as [col][row]
                    return (
                        <div key={`cell-${x}-${y}`} className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-sm">
                            {block && (
                                <Block
                                    type="small"
                                    color={block.color}
                                    onClick={() => { }} // Small blocks not clickable
                                />
                            )}
                        </div>
                    );
                })
            ))}

            {/* Big Blocks Layer (Absolute Overlay) */}
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
                            padding: '4px', // account for grid gap visual compensation
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
        </div>
    );
};