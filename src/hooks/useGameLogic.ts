import { useState, useCallback, useEffect } from 'react';
import type { GridState, Direction, Point, GameRecord } from '../types/game';
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

const STORAGE_KEY = 'quod-state';
const RECORDS_KEY = 'quod-records';
const HIGHSCORE_KEY = 'quod-highscore';
const HIGHSCORE_DATE_KEY = 'quod-highscore-date';

export const useGameLogic = () => {
    const [smallBlocks, setSmallBlocks] = useState<GridState>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [score, setScore] = useState(0);
    const [records, setRecords] = useState<GameRecord[]>([]);
    const [highScoreDate, _setHighScoreDate] = useState<string | null>(null);
    const [isNewRecord, setIsNewRecord] = useState(false);
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

        // Initial match check (ignore score)
        const { finalGrid } = await processMatches(initialGrid);

        setNextSpawnPos(findRandom2x2EmptyArea(finalGrid));
        setScore(0);
        setComboCount(0);
        setGameOver(false);
        setIsNewRecord(false);
        setIsProcessing(false);

        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const handleGameOver = useCallback((finalScore: number) => {
        setGameOver(true);
        setIsProcessing(false);

        const newRecord: GameRecord = {
            id: Date.now().toString(),
            score: finalScore,
            date: new Date().toISOString(),
            grid: JSON.parse(JSON.stringify(smallBlocks)) // Snapshot of the final board
        };

        setRecords(prev => {
            const updated = [...prev, newRecord]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            localStorage.setItem(RECORDS_KEY, JSON.stringify(updated));

            // For backward compatibility and immediate UI update
            if (updated[0].id === newRecord.id) {
                setIsNewRecord(true);
            }

            return updated;
        });
    }, [smallBlocks]);

    useEffect(() => {
        // Load Records
        const savedRecords = localStorage.getItem(RECORDS_KEY);
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        } else {
            // Migration from old highscore
            const oldHighScore = localStorage.getItem(HIGHSCORE_KEY);
            if (oldHighScore) {
                const score = parseInt(oldHighScore, 10);
                const date = localStorage.getItem(HIGHSCORE_DATE_KEY) || new Date().toISOString();
                const initialRecord: GameRecord = {
                    id: 'migration-' + Date.now(),
                    score,
                    date,
                    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
                };
                setRecords([initialRecord]);
                localStorage.setItem(RECORDS_KEY, JSON.stringify([initialRecord]));
            }
        }

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
        resetGame();
    }, [resetGame]);

    useEffect(() => {
        if (!gameOver && smallBlocks.some(row => row.some(cell => cell !== null))) {
            const state = { smallBlocks, score, nextSpawnColors, nextSpawnPos, comboCount };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } else if (gameOver) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [smallBlocks, score, nextSpawnColors, nextSpawnPos, comboCount, gameOver]);

    // ★重要修正：獲得スコアを返すように変更
    const processMatches = async (startGrid: GridState, dx: number = 0, dy: number = 0): Promise<{ finalGrid: GridState, totalMatches: boolean, turnScore: number }> => {
        let currentGrid = startGrid;
        let loop = true;
        let currentTurnMatches = false;
        let activeCombo = comboCount;
        let turnScore = 0; // 今回の連鎖で稼いだスコア合計

        while (loop) {
            const matches = getAllMatches(currentGrid);
            if (matches.length === 0) break;

            currentTurnMatches = true;
            activeCombo++;

            playSound('match');
            const baseScore = matches.length * 100;
            const bonus = activeCombo * 50;
            const gain = baseScore + bonus;

            turnScore += gain;
            setScore(s => s + gain); // 画面表示用にはstateも更新

            const tempGrid = currentGrid.map(row => [...row]);
            matches.forEach(p => { tempGrid[p.x][p.y] = null; });
            setSmallBlocks(tempGrid);
            await new Promise(r => setTimeout(r, 250));

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

        if (currentTurnMatches) setComboCount(activeCombo);
        else setComboCount(0);

        return { finalGrid: currentGrid, totalMatches: currentTurnMatches, turnScore };
    };

    const slide = useCallback(async (direction: Direction) => {
        if (isProcessing || gameOver) return;
        setIsProcessing(true);

        let dx = 0, dy = 0;
        if (direction === 'LEFT') dx = -1;
        if (direction === 'RIGHT') dx = 1;
        if (direction === 'UP') dy = -1;
        if (direction === 'DOWN') dy = 1;

        // ★重要修正：現在のスコアをローカル変数で保持
        let currentTotalScore = score;

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
        // ★戻り値の turnScore を受け取り加算
        let { finalGrid: gridAfterSlideMatches, turnScore: score1 } = await processMatches(newGrid, dx, dy);
        currentTotalScore += score1;

        // --- PHASE 3: SPAWN ---
        let pos = nextSpawnPos;
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
            currentTotalScore += result.turnScore; // ★ここでも加算
        } else {
            // Spawn Failed -> GAME OVER
            // ★計算済みの最新スコアを渡す
            handleGameOver(currentTotalScore);
            return;
        }

        // --- PHASE 5: GAME OVER CHECK ---
        const futurePos = findRandom2x2EmptyArea(gridAfterSpawn);

        if (!futurePos) {
            if (!canClearSpaceForSpawn(gridAfterSpawn)) {
                // ★計算済みの最新スコアを渡す
                handleGameOver(currentTotalScore);
                return;
            }
        }

        setNextSpawnPos(futurePos);
        setIsProcessing(false);
    }, [smallBlocks, isProcessing, gameOver, nextSpawnPos, nextSpawnColors, comboCount, handleGameOver, score]);

    const highScore = records[0]?.score || 0;

    return { smallBlocks, slide, score, highScore, highScoreDate, records, isNewRecord, gameOver, isProcessing, resetGame, nextSpawnColors, nextSpawnPos, bumpEvent, comboCount };
};