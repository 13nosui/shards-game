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
    hasPossibleMoves
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
        setNextSpawnPos(findRandom2x2EmptyArea(pos ? spawn2x2At(emptyGrid, pos, initialColors) : emptyGrid));
        setScore(0);
        setComboCount(0);
        setGameOver(false);
        setIsProcessing(false);

        // Clear saved game state but keep high score
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

    // Turn end check: Spawning 2x2 and matching
    const endTurn = async (gridAfterSlide: GridState, dx: number, dy: number) => {
        setIsProcessing(true);

        // 1. Spawning 2x2 Cluster
        let pos = nextSpawnPos;

        // If the pre-calculated position is now blocked, find a new one
        if (!pos || !is2x2AreaEmpty(gridAfterSlide, pos.x, pos.y)) {
            pos = findRandom2x2EmptyArea(gridAfterSlide);
        }

        let currentGrid = gridAfterSlide;

        if (pos) {
            // Normal spawn
            const gridWithNewSpawn = spawn2x2At(gridAfterSlide, pos, nextSpawnColors);
            setSmallBlocks(gridWithNewSpawn);
            setNextSpawnColors(generateSpawnColors());
            currentGrid = gridWithNewSpawn;
        } else {
            // Spawn blocked: Check if we are truly stuck
            if (!hasPossibleMoves(gridAfterSlide)) {
                setGameOver(true);
                setIsProcessing(false);
                return;
            }
            // If moves are possible, skip spawn but continue game logic
            setSmallBlocks(gridAfterSlide);
            currentGrid = gridAfterSlide;
        }

        // Wait for potential spawn animation
        await new Promise(r => setTimeout(r, 200));

        // 2. Chain Reaction Matches
        let loop = true;
        let currentTurnMatches = false;
        let activeCombo = comboCount;

        while (loop) {
            const matches = getAllMatches(currentGrid);
            if (matches.length === 0) {
                loop = false;
                break;
            }

            currentTurnMatches = true;
            activeCombo++;

            playSound('match');
            const baseScore = matches.length * 100;
            const bonus = activeCombo * 50; // 50 points per combo level
            setScore(s => s + baseScore + bonus);

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

        // 3. Resolve Combo State
        if (currentTurnMatches) {
            setComboCount(activeCombo);
        } else {
            setComboCount(0);
        }

        // Final check for 2x2 space after all matches and falls
        const futurePos = findRandom2x2EmptyArea(currentGrid);
        if (!futurePos) {
            setGameOver(true);
        }
        setNextSpawnPos(futurePos);

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
        } else {
            // "Jelly" recoil feedback for blocked move
            setBumpEvent({ x: dx, y: dy, id: Date.now() });
        }
    }, [smallBlocks, isProcessing, gameOver]);

    return { smallBlocks, slide, score, highScore, highScoreDate, gameOver, isProcessing, resetGame, nextSpawnColors, nextSpawnPos, bumpEvent, comboCount };
};