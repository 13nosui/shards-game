import { useState, useCallback, useEffect } from 'react';
import type { GridState, Direction, BigBlock, Point } from '../types/game';
import {
    GRID_SIZE,
    createSmallBlock,
    createBigBlock,
    getAllMatches,
    slideGrid,
    isEmptyArea,
    isPartOfAnyMatch
} from '../utils/gameUtils';
import { playSound } from '../utils/sounds';

export const useGameLogic = () => {
    const [smallBlocks, setSmallBlocks] = useState<GridState>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );
    const [bigBlocks, setBigBlocks] = useState<BigBlock[]>([]);

    const [score, setScore] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        setBigBlocks([
            createBigBlock(0, 0),
            createBigBlock(3, 3)
        ]);
    }, []);

    // ターン終了処理
    const endTurn = (finalGrid: GridState, currentBigBlocks: BigBlock[]) => {
        const candidates: Point[] = [];
        for (let x = 0; x < GRID_SIZE - 1; x++) {
            for (let y = 0; y < GRID_SIZE - 1; y++) {
                if (isEmptyArea(finalGrid, currentBigBlocks, x, y)) {
                    candidates.push({ x, y });
                }
            }
        }

        if (candidates.length > 0) {
            const pos = candidates[Math.floor(Math.random() * candidates.length)];
            setBigBlocks(prev => [...prev, createBigBlock(pos.x, pos.y)]);
        } else {
            setGameOver(true);
        }
        setIsProcessing(false);
    };

    const runChainReaction = async (startGrid: GridState, dx: number, dy: number) => {
        let currentGrid = startGrid;
        let loop = true;

        while (loop) {
            const matches = getAllMatches(currentGrid);
            if (matches.length === 0) {
                loop = false;
                break;
            }

            playSound('match');
            setScore(s => s + matches.length * 100);

            const tempGrid = currentGrid.map(row => [...row]);
            matches.forEach(p => { tempGrid[p.x][p.y] = null; });
            setSmallBlocks(tempGrid);
            await new Promise(r => setTimeout(r, 250));

            const { newGrid: slidGrid, moved } = slideGrid(tempGrid, bigBlocks, dx, dy);
            setSmallBlocks(slidGrid);
            currentGrid = slidGrid;
            await new Promise(r => setTimeout(r, 150));
        }

        // 状態更新のタイミングの問題を避けるため、関数呼び出し時の最新bigBlocksを渡すか、
        // ここではstate更新関数の中で処理を完結させるのが理想ですが、
        // 簡易的に現在のstate依存で呼び出します (実動作上はほぼ問題なし)
        endTurn(currentGrid, bigBlocks);
    };

    const slide = useCallback((direction: Direction) => {
        if (isProcessing || gameOver) return;

        let dx = 0, dy = 0;
        if (direction === 'LEFT') dx = -1;
        if (direction === 'RIGHT') dx = 1;
        if (direction === 'UP') dy = -1;
        if (direction === 'DOWN') dy = 1;

        const { newGrid, moved } = slideGrid(smallBlocks, bigBlocks, dx, dy);

        if (moved) {
            playSound('slide');
            setSmallBlocks(newGrid);
            setIsProcessing(true);
            setTimeout(() => runChainReaction(newGrid, dx, dy), 150);
        }
    }, [smallBlocks, bigBlocks, isProcessing, gameOver]);

    const breakBlock = useCallback((x: number, y: number) => {
        if (isProcessing || gameOver) return;

        const targetIndex = bigBlocks.findIndex(b =>
            x >= b.x && x < b.x + 2 && y >= b.y && y < b.y + 2
        );

        if (targetIndex !== -1) {
            const block = bigBlocks[targetIndex];
            playSound('break');

            const newBigBlocks = [...bigBlocks];
            newBigBlocks.splice(targetIndex, 1);
            setBigBlocks(newBigBlocks);

            // p5.js logic: Try to find a config that doesn't instantly match
            let validConfig = false;
            let attempts = 0;
            let finalColors: string[] = [];

            // Temporary grid to test matches
            const tempGrid = smallBlocks.map(row => [...row]);

            while (!validConfig && attempts < 50) {
                attempts++;
                // Generate 4 random blocks
                const c1 = createSmallBlock();
                const c2 = createSmallBlock();
                const c3 = createSmallBlock();
                const c4 = createSmallBlock();

                tempGrid[block.x][block.y] = c1;
                tempGrid[block.x + 1][block.y] = c2;
                tempGrid[block.x][block.y + 1] = c3;
                tempGrid[block.x + 1][block.y + 1] = c4;

                // Check if any of these 4 cause an immediate match
                if (!isPartOfAnyMatch(tempGrid, block.x, block.y) &&
                    !isPartOfAnyMatch(tempGrid, block.x + 1, block.y) &&
                    !isPartOfAnyMatch(tempGrid, block.x, block.y + 1) &&
                    !isPartOfAnyMatch(tempGrid, block.x + 1, block.y + 1)) {
                    validConfig = true;
                    // Apply to real state
                    const newSmallBlocks = smallBlocks.map(row => [...row]);
                    newSmallBlocks[block.x][block.y] = c1;
                    newSmallBlocks[block.x + 1][block.y] = c2;
                    newSmallBlocks[block.x][block.y + 1] = c3;
                    newSmallBlocks[block.x + 1][block.y + 1] = c4;
                    setSmallBlocks(newSmallBlocks);
                }
            }

            // Fallback if 50 attempts fail (just spawn anyway)
            if (!validConfig) {
                const newSmallBlocks = smallBlocks.map(row => [...row]);
                newSmallBlocks[block.x][block.y] = createSmallBlock();
                newSmallBlocks[block.x + 1][block.y] = createSmallBlock();
                newSmallBlocks[block.x][block.y + 1] = createSmallBlock();
                newSmallBlocks[block.x + 1][block.y + 1] = createSmallBlock();
                setSmallBlocks(newSmallBlocks);
            }
        }
    }, [bigBlocks, smallBlocks, isProcessing, gameOver]);

    return { smallBlocks, bigBlocks, slide, breakBlock, score, gameOver, isProcessing };
};