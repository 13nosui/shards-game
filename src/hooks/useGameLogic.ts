import { useState, useCallback, useEffect } from 'react';
import type { GridState, Direction, Point } from '../types/game';
import {
    GRID_SIZE,
    COLORS,
    createSmallBlock,
    getAllMatches,
    slideGrid,
    findRandom2x2EmptyArea,
    is2x2AreaEmpty,
    canClearSpaceForSpawn
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

const STORAGE_KEY = 'shards-game-state';
const HIGHSCORE_KEY = 'shards-highscore';
const HIGHSCORE_DATE_KEY = 'shards-highscore-date';

export const useGameLogic = () => {
    const [smallBlocks, setSmallBlocks] = useState<GridState>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [highScoreDate, setHighScoreDate] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [nextSpawnColors, setNextSpawnColors] = useState<string[]>([]);
    const [nextSpawnPos, setNextSpawnPos] = useState<Point | null>(null);
    const [bumpEvent, setBumpEvent] = useState<{ x: number, y: number, id: number } | null>(null);
    const [comboCount, setComboCount] = useState(0);

    const spawn2x2At = (grid: GridState, pos: Point, colors: string[]): GridState => {
        const newGrid = grid.map(row => [...row]);
        newGrid[pos.x][pos.y] = createSmallBlock(colors[0]);
        newGrid[pos.x + 1][pos.y] = createSmallBlock(colors[1]);
        newGrid[pos.x][pos.y + 1] = createSmallBlock(colors[2]);
        newGrid[pos.x + 1][pos.y + 1] = createSmallBlock(colors[3]);
        return newGrid;
    };

    const resetGame = useCallback(async () => {
        const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        const pos = findRandom2x2EmptyArea(emptyGrid);

        const initialColors = generateSpawnColors();
        const nextBatch = generateSpawnColors();

        let initialGrid = emptyGrid;
        if (pos) {
            initialGrid = spawn2x2At(emptyGrid, pos, initialColors);
        }

        setSmallBlocks(initialGrid);
        setNextSpawnColors(nextBatch);

        // Initial match check
        const { finalGrid } = await processMatches(initialGrid);

        setNextSpawnPos(findRandom2x2EmptyArea(finalGrid));
        setScore(0);
        setComboCount(0);
        setGameOver(false);
        setIsProcessing(false);

        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Load High Score and Game State on mount
    useEffect(() => {
        // Load High Score
        const savedHighScore = localStorage.getItem(HIGHSCORE_KEY);
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }

        const savedHighScoreDate = localStorage.getItem(HIGHSCORE_DATE_KEY);
        if (savedHighScoreDate) {
            setHighScoreDate(savedHighScoreDate);
        }

        // Load Game State
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                setSmallBlocks(state.smallBlocks);
                setScore(state.score);
                setNextSpawnColors(state.nextSpawnColors);
                setNextSpawnPos(state.nextSpawnPos);
                setComboCount(state.comboCount);
                setGameOver(false);
                setIsProcessing(false);
                return;
            } catch (e) {
                console.error("Failed to load saved state", e);
            }
        }

        // If no saved state or error, start fresh
        resetGame();
    }, [resetGame]);

    // Save Game State on changes
    useEffect(() => {
        if (!gameOver && smallBlocks.some(row => row.some(cell => cell !== null))) {
            const state = {
                smallBlocks,
                score,
                nextSpawnColors,
                nextSpawnPos,
                comboCount
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } else if (gameOver) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [smallBlocks, score, nextSpawnColors, nextSpawnPos, comboCount, gameOver]);

    // Update High Score
    useEffect(() => {
        if (score > highScore) {
            const now = new Date().toISOString();
            setHighScore(score);
            setHighScoreDate(now);
            localStorage.setItem(HIGHSCORE_KEY, score.toString());
            localStorage.setItem(HIGHSCORE_DATE_KEY, now);
        }
    }, [score, highScore]);

    // Helper to process matches and gravity (returns the final grid state)
    const processMatches = async (startGrid: GridState, dx: number = 0, dy: number = 0): Promise<{ finalGrid: GridState, totalMatches: boolean }> => {
        let currentGrid = startGrid;
        let loop = true;
        let currentTurnMatches = false;
        let activeCombo = comboCount;

        while (loop) {
            const matches = getAllMatches(currentGrid);
            if (matches.length === 0) break;

            currentTurnMatches = true;
            activeCombo++;

            playSound('match');
            const baseScore = matches.length * 100;
            const bonus = activeCombo * 50;
            setScore(s => s + baseScore + bonus);

            const tempGrid = currentGrid.map(row => [...row]);
            matches.forEach(p => { tempGrid[p.x][p.y] = null; });
            setSmallBlocks(tempGrid);
            await new Promise(r => setTimeout(r, 250));

            // Gravity in the direction of the last slide
            const { newGrid: slidGrid } = slideGrid(tempGrid, dx, dy);

            if (JSON.stringify(slidGrid) !== JSON.stringify(tempGrid)) {
                setSmallBlocks(slidGrid);
                currentGrid = slidGrid;
                await new Promise(r => setTimeout(r, 150));
            } else {
                currentGrid = tempGrid;
                loop = false;
            }
        }

        if (currentTurnMatches) {
            setComboCount(activeCombo);
        } else {
            setComboCount(0);
        }

        return { finalGrid: currentGrid, totalMatches: currentTurnMatches };
    };

    const slide = useCallback(async (direction: Direction) => {
        if (isProcessing || gameOver) return;
        setIsProcessing(true);

        let dx = 0, dy = 0;
        if (direction === 'LEFT') dx = -1;
        if (direction === 'RIGHT') dx = 1;
        if (direction === 'UP') dy = -1;
        if (direction === 'DOWN') dy = 1;

        // --- PHASE 1: SLIDE ---
        const { newGrid, moved } = slideGrid(smallBlocks, dx, dy);
        if (!moved) {
            setBumpEvent({ x: dx, y: dy, id: Date.now() });
            setIsProcessing(false);
            return;
        }

        playSound('slide');
        setSmallBlocks(newGrid);
        await new Promise(r => setTimeout(r, 150));

        // --- PHASE 2: MATCH (After Slide) ---
        let { finalGrid: gridAfterSlideMatches } = await processMatches(newGrid, dx, dy);

        // --- PHASE 3: SPAWN ---
        let pos = nextSpawnPos;
        // If no pre-calculated spawn (e.g., during "one chance" state), try to find one now
        if (!pos || !is2x2AreaEmpty(gridAfterSlideMatches, pos.x, pos.y)) {
            pos = findRandom2x2EmptyArea(gridAfterSlideMatches);
        }

        let gridAfterSpawn = gridAfterSlideMatches;
        if (pos) {
            gridAfterSpawn = spawn2x2At(gridAfterSlideMatches, pos, nextSpawnColors);
            setSmallBlocks(gridAfterSpawn);
            setNextSpawnColors(generateSpawnColors());
            await new Promise(r => setTimeout(r, 200));

            // --- PHASE 4: MATCH (After Spawn) ---
            const result = await processMatches(gridAfterSpawn, 0, 0);
            gridAfterSpawn = result.finalGrid;
        } else {
            // Spawn Failed -> GAME OVER
            // The player used their slide but failed to create space.
            setGameOver(true);
            setIsProcessing(false);
            return;
        }

        // --- PHASE 5: GAME OVER CHECK ---
        const futurePos = findRandom2x2EmptyArea(gridAfterSpawn);

        if (!futurePos) {
            // Board full. Can we survive by moving?
            if (!canClearSpaceForSpawn(gridAfterSpawn)) {
                setGameOver(true);
            }
        }

        setNextSpawnPos(futurePos);
        setIsProcessing(false);
    }, [smallBlocks, isProcessing, gameOver, nextSpawnPos, nextSpawnColors, comboCount]);

    return { smallBlocks, slide, score, highScore, highScoreDate, gameOver, isProcessing, resetGame, nextSpawnColors, nextSpawnPos, bumpEvent, comboCount };
};