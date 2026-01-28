import { useState, useCallback, useEffect } from 'react';
import type { GridState, Direction, Point } from '../types/game';
import {
    GRID_SIZE,
    COLORS,
    createSmallBlock,
    getAllMatches,
    slideGrid,
    findRandom2x2EmptyArea
} from '../utils/gameUtils';
import { playSound } from '../utils/sounds';

const generateSpawnColors = (): string[] => {
    let selectedColors: string[] = [];
    let isValidColorSet = false;

    while (!isValidColorSet) {
        selectedColors = Array(4).fill(null).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        const counts: Record<string, number> = {};
        selectedColors.forEach(c => counts[c] = (counts[c] || 0) + 1);
        isValidColorSet = Object.values(counts).every(count => count < 3);
    }
    return selectedColors;
};

export const useGameLogic = () => {
    const [smallBlocks, setSmallBlocks] = useState<GridState>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [score, setScore] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [nextSpawnColors, setNextSpawnColors] = useState<string[]>([]);

    const spawn2x2At = (grid: GridState, pos: Point, colors: string[]): GridState => {
        const newGrid = grid.map(row => [...row]);
        newGrid[pos.x][pos.y] = createSmallBlock(colors[0]);
        newGrid[pos.x + 1][pos.y] = createSmallBlock(colors[1]);
        newGrid[pos.x][pos.y + 1] = createSmallBlock(colors[2]);
        newGrid[pos.x + 1][pos.y + 1] = createSmallBlock(colors[3]);
        return newGrid;
    };

    const resetGame = useCallback(() => {
        const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        const pos = findRandom2x2EmptyArea(emptyGrid);

        const initialColors = generateSpawnColors();
        const nextBatch = generateSpawnColors();

        if (pos) {
            setSmallBlocks(spawn2x2At(emptyGrid, pos, initialColors));
        } else {
            setSmallBlocks(emptyGrid);
        }

        setNextSpawnColors(nextBatch);
        setScore(0);
        setGameOver(false);
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Turn end check: Spawning 2x2 and matching
    const endTurn = async (gridAfterSlide: GridState, dx: number, dy: number) => {
        setIsProcessing(true);

        // 1. Spawning 2x2 Cluster
        const pos = findRandom2x2EmptyArea(gridAfterSlide);

        if (!pos) {
            setGameOver(true);
            setIsProcessing(false);
            return;
        }

        const gridWithNewSpawn = spawn2x2At(gridAfterSlide, pos, nextSpawnColors);
        setSmallBlocks(gridWithNewSpawn);
        setNextSpawnColors(generateSpawnColors());

        // Wait for spawn animation (200ms)
        await new Promise(r => setTimeout(r, 200));

        // 2. Chain Reaction Matches
        let currentGrid = gridWithNewSpawn;
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

            const { newGrid: slidGrid } = slideGrid(tempGrid, dx, dy);

            // If sliding after matches actually moves things, update state and wait
            if (JSON.stringify(slidGrid) !== JSON.stringify(tempGrid)) {
                setSmallBlocks(slidGrid);
                currentGrid = slidGrid;
                await new Promise(r => setTimeout(r, 150));
            } else {
                currentGrid = tempGrid;
                loop = false;
            }
        }

        // Final check for 2x2 space after all matches and falls
        if (!findRandom2x2EmptyArea(currentGrid)) {
            setGameOver(true);
        }

        setIsProcessing(false);
    };

    const slide = useCallback((direction: Direction) => {
        if (isProcessing || gameOver) return;

        let dx = 0, dy = 0;
        if (direction === 'LEFT') dx = -1;
        if (direction === 'RIGHT') dx = 1;
        if (direction === 'UP') dy = -1;
        if (direction === 'DOWN') dy = 1;

        const { newGrid, moved } = slideGrid(smallBlocks, dx, dy);

        if (moved) {
            playSound('slide');
            setSmallBlocks(newGrid);
            // We moved, so we trigger the end-turn sequence (2x2 Spawn + Match)
            endTurn(newGrid, dx, dy);
        }
    }, [smallBlocks, isProcessing, gameOver]);

    return { smallBlocks, slide, score, gameOver, isProcessing, resetGame, nextSpawnColors };
};