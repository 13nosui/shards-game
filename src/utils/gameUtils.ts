import type { GridState, Point, SmallBlock, BigBlock } from '../types/game';

export const GRID_SIZE = 5;

// p5.js: COLORS definition
export const COLORS = [
    '#FF595E', // Red
    '#1982C4', // Blue
    '#FFCA3A', // Yellow
    '#8AC926'  // Green
];
export const BIG_BLOCK_COLOR = '#555555';

export const createSmallBlock = (color?: string): SmallBlock => ({
    id: Math.random().toString(36).substr(2, 9),
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
});

export const createBigBlock = (x: number, y: number): BigBlock => ({
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    color: BIG_BLOCK_COLOR,
});

// --- マッチングロジック (p5.js logic port) ---

const isValid = (x: number, y: number) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

// 縦横（4方向）探索
export const findOrtho = (grid: GridState, startX: number, startY: number, visited: boolean[][]): Point[] => {
    const block = grid[startX][startY];
    if (!block) return [];

    const group: Point[] = [];
    const queue: Point[] = [{ x: startX, y: startY }];

    visited[startX][startY] = true;
    group.push({ x: startX, y: startY });

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    let head = 0;
    while (head < group.length) {
        const curr = group[head++];
        for (const [dx, dy] of directions) {
            const nx = curr.x + dx;
            const ny = curr.y + dy;
            if (isValid(nx, ny) && !visited[nx][ny] && grid[nx][ny]?.color === block.color) {
                visited[nx][ny] = true;
                group.push({ x: nx, y: ny });
            }
        }
    }
    return group;
};

// 斜め（4方向）探索
export const findDiag = (grid: GridState, startX: number, startY: number, visited: boolean[][]): Point[] => {
    const block = grid[startX][startY];
    if (!block) return [];

    const group: Point[] = [];
    const queue: Point[] = [{ x: startX, y: startY }];

    visited[startX][startY] = true;
    group.push({ x: startX, y: startY });

    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    let head = 0;
    while (head < group.length) {
        const curr = group[head++];
        for (const [dx, dy] of directions) {
            const nx = curr.x + dx;
            const ny = curr.y + dy;
            if (isValid(nx, ny) && !visited[nx][ny] && grid[nx][ny]?.color === block.color) {
                visited[nx][ny] = true;
                group.push({ x: nx, y: ny });
            }
        }
    }
    return group;
};

// 全マッチ取得
export const getAllMatches = (grid: GridState): Point[] => {
    const toRemove: Point[] = [];

    // 1. 縦横チェック
    let visitedOrtho = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (grid[x][y] && !visitedOrtho[x][y]) {
                const group = findOrtho(grid, x, y, visitedOrtho);
                if (group.length >= 3) {
                    toRemove.push(...group);
                }
            }
        }
    }

    // 2. 斜めチェック
    let visitedDiag = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (grid[x][y] && !visitedDiag[x][y]) {
                const group = findDiag(grid, x, y, visitedDiag);
                if (group.length >= 3) {
                    toRemove.push(...group);
                }
            }
        }
    }

    // 重複除去
    const uniquePoints = new Map<string, Point>();
    toRemove.forEach(p => uniquePoints.set(`${p.x},${p.y}`, p));
    return Array.from(uniquePoints.values());
};

// 特定セルがマッチに含まれているか（p5.js: isInstantMatch用）
export const isPartOfAnyMatch = (grid: GridState, x: number, y: number): boolean => {
    if (!grid[x][y]) return false;

    // Ortho
    const visitedOrtho = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    const orthoGroup = findOrtho(grid, x, y, visitedOrtho);
    if (orthoGroup.length >= 3) return true;

    // Diag
    const visitedDiag = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    const diagGroup = findDiag(grid, x, y, visitedDiag);
    if (diagGroup.length >= 3) return true;

    return false;
};

// --- スライドロジック ---

export const isOccupiedByBigBlock = (x: number, y: number, bigBlocks: BigBlock[]): boolean => {
    return bigBlocks.some(b => x >= b.x && x < b.x + 2 && y >= b.y && y < b.y + 2);
};

export const slideGrid = (
    grid: GridState,
    bigBlocks: BigBlock[],
    dx: number,
    dy: number
): { newGrid: GridState, moved: boolean } => {
    const newGrid = grid.map(row => [...row]);
    let moved = false;

    const xStart = dx === 1 ? GRID_SIZE - 1 : 0;
    const yStart = dy === 1 ? GRID_SIZE - 1 : 0;
    const xStep = dx === 1 ? -1 : 1;
    const yStep = dy === 1 ? -1 : 1;

    for (let x = xStart; x >= 0 && x < GRID_SIZE; x += xStep) {
        for (let y = yStart; y >= 0 && y < GRID_SIZE; y += yStep) {
            if (newGrid[x][y]) {
                let nextX = x + dx;
                let nextY = y + dy;
                let destX = x;
                let destY = y;

                while (true) {
                    if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) break;
                    if (newGrid[nextX][nextY] !== null) break;
                    if (isOccupiedByBigBlock(nextX, nextY, bigBlocks)) break;

                    destX = nextX;
                    destY = nextY;
                    nextX += dx;
                    nextY += dy;
                }

                if (destX !== x || destY !== y) {
                    newGrid[destX][destY] = newGrid[x][y];
                    newGrid[x][y] = null;
                    moved = true;
                }
            }
        }
    }

    return { newGrid, moved };
};

export const isEmptyArea = (grid: GridState, bigBlocks: BigBlock[], x: number, y: number) => {
    if (x + 1 >= GRID_SIZE || y + 1 >= GRID_SIZE) return false;
    if (grid[x][y] || grid[x + 1][y] || grid[x][y + 1] || grid[x + 1][y + 1]) return false;
    for (let bx = x; bx <= x + 1; bx++) {
        for (let by = y; by <= y + 1; by++) {
            if (isOccupiedByBigBlock(bx, by, bigBlocks)) return false;
        }
    }
    return true;
};