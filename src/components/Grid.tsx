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
            {/* Small Blocks Layer (Grid) */}
            {smallBlocks.map((row, x) => (
                row.map((block, y) => {
                    // x is column index?, y is row? 
                    // Note: In p5.js code logic `smallBlocks[x][y]` suggests x=col, y=row.
                    // But in standard 2D array map: map((row, r) => row.map((cell, c))).
                    // Let's stick to standard map: First index is ROW (y), Second is COL (x).
                    // BUT p5 logic `smallBlocks[x][y]` is usually `col, row`.
                    // My utils implementation assumed `grid[x][y]` where x is first index.
                    // Let's assume grid[x][y] means grid[col][row] for p5 compatibility?
                    // No, `matrix[row][col]` is standard JS.
                    // Let's map consistent with visual.
                    // Visual: row 0 (top), row 1...

                    // Actually, to match p5 coordinate system (x=horizontal, y=vertical), 
                    // `grid[x][y]` in Utils implies x is horizontal index.
                    // But to map in React JSX:
                    // We need to iterate cols then rows OR rows then cols.
                    // CSS Grid fills Row by Row.
                    // So we should flatten logical `grid[x][y]` correctly.

                    // Let's assume my Utils `grid[x][y]` meant `grid[col][row]`.
                    // To render in CSS Grid (row-major), we need to access grid[col][row].

                    return (
                        <div key={`cell-${x}-${y}`} className="relative w-full h-full">
                            {/* We need to transpose loops if x is col */}
                            {/* Actually, let's treat the loop vars: outer=y(row), inner=x(col) */}
                            {/* But map syntax: array.map((item, index) -> item is col array? */}
                            {/* Let's simplify: `grid` is `[x][y]` (Col-Major) in Utils. */}
                            {/* So we iterate Y (rows 0..4) then X (cols 0..4). */}
                        </div>
                    )
                })
            ))}

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
                // Calculation for position
                // Grid Gap is 4px. Padding 8px.
                // Each cell is roughly (100% - 16px - 16px gap) / 5
                // Using percentage based absolute positioning is easier.

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