import type { GridState, Point, SmallBlock } from '../types/game';

export const GRID_SIZE = 6;

// Radix UI Step 10 colors (Lighter/Brighter)
export const COLORS = [
    '#F3594F', // Ruby 10 (Red)
    '#5C73E7', // Indigo 10 (Blue)
    '#FFD60A', // Amber 10 (Yellow)
    '#5BB96A'  // Grass 10 (Green)
];

export const createSmallBlock = (color?: string): SmallBlock => ({
    id: crypto.randomUUID(),
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
});

// --- マッチングロジック (p5.js logic port) ---

const isValid = (x: number, y: number) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

// 縦横（4方向）探索 (Recursive DFS)
export const findOrtho = (grid: GridState, x: number, y: number, visited: boolean[][], color: string): Point[] => {
    if (!isValid(x, y) || visited[x][y] || grid[x][y]?.color !== color) return [];

    visited[x][y] = true;
    const group: Point[] = [{ x, y }];

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of directions) {
        group.push(...findOrtho(grid, x + dx, y + dy, visited, color));
    }

    return group;
};

// 全マッチ取得
export const getAllMatches = (grid: GridState): Point[] => {
    const toRemove: Point[] = [];

    // 縦横チェック
    let visitedOrtho = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (grid[x][y] && !visitedOrtho[x][y]) {
                const group = findOrtho(grid, x, y, visitedOrtho, grid[x][y]!.color);
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

// 特定セルがマッチに含まれているか
export const isPartOfAnyMatch = (grid: GridState, x: number, y: number): boolean => {
    if (!grid[x][y]) return false;
    const color = grid[x][y]!.color;

    const visitedOrtho = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    const orthoGroup = findOrtho(grid, x, y, visitedOrtho, color);
    return orthoGroup.length >= 3;
};

export const is2x2AreaEmpty = (grid: GridState, x: number, y: number): boolean => {
    if (x < 0 || x > GRID_SIZE - 2 || y < 0 || y > GRID_SIZE - 2) return false;
    return !grid[x][y] && !grid[x + 1][y] && !grid[x][y + 1] && !grid[x + 1][y + 1];
};

export const findRandom2x2EmptyArea = (grid: GridState): Point | null => {
    const validAreas: Point[] = [];

    // Scan for 2x2 empty spots
    // Range is 0 to GRID_SIZE - 2 for both axes
    for (let x = 0; x <= GRID_SIZE - 2; x++) {
        for (let y = 0; y <= GRID_SIZE - 2; y++) {
            if (!grid[x][y] && !grid[x + 1][y] && !grid[x][y + 1] && !grid[x + 1][y + 1]) {
                validAreas.push({ x, y });
            }
        }
    }

    if (validAreas.length === 0) return null;
    return validAreas[Math.floor(Math.random() * validAreas.length)];
};

// --- スライドロジック ---

export const slideGrid = (
    grid: GridState,
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

// 新しいゲームオーバー判定: 盤面がいっぱいで、かつどこを移動してもマッチができない状態 or 隣接/斜めに同じ色がない
export const hasPossibleMatches = (grid: GridState): boolean => {
    // 1. 空き場所があれば継続可能
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (!grid[x][y]) return true;
        }
    }

    // 2. 空き場所がない場合、隣接（8方向）に同じ色があるかチェック
    // 3つ繋がる可能性があるかチェックする
    // 本来は「スライドによってマッチができるか」を全方向試すべきだが、
    // シンプルに「現状でマッチがあるか」または「隣接に同色があるか」で判定する
    // ここでは厳密に「今の盤面でマッチしているものがあるか」または「スライドして1つ開けばマッチするか」だが、
    // 「盤面全埋まりかつ、隣接+斜め8方向に同色がない」を簡易判定とする
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const current = grid[x][y];
            if (!current) continue;

            const neighbors = [
                [0, 1], [0, -1], [1, 0], [-1, 0] // Ortho Only
            ];

            for (const [nx, ny] of neighbors) {
                const targetX = x + nx;
                const targetY = y + ny;
                if (isValid(targetX, targetY)) {
                    if (grid[targetX][targetY]?.color === current.color) {
                        return true; // 隣接に同色があれば、将来的にマッチする可能性がある
                    }
                }
            }
        }
    }

    return false;
};
// 移動可能か（どこにスライドしても動かない = 詰み）
export const hasPossibleMoves = (grid: GridState): boolean => {
    const directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];

    for (const { dx, dy } of directions) {
        const { moved } = slideGrid(grid, dx, dy);
        if (moved) return true;
    }

    return false;
};

// Check if any move can clear space for a 2x2 spawn
export const canClearSpaceForSpawn = (grid: GridState): boolean => {
    const directions = [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }];

    for (const { dx, dy } of directions) {
        // 1. Simulate Slide
        const { newGrid, moved } = slideGrid(grid, dx, dy);
        if (!moved) continue;

        // 2. Simulate Matches on the slid grid
        const matches = getAllMatches(newGrid);

        // If matches exist, simulate clearing them to see if space opens up
        if (matches.length > 0) {
            const tempGrid = newGrid.map(row => [...row]);
            matches.forEach(p => { tempGrid[p.x][p.y] = null; });

            // Check if a 2x2 area is now empty
            if (findRandom2x2EmptyArea(tempGrid) !== null) {
                return true; // Survival is possible!
            }
        } else {
            // Even without matches, if the slide itself opened a 2x2 space (unlikely but possible)
            if (findRandom2x2EmptyArea(newGrid) !== null) {
                return true;
            }
        }
    }
    return false; // No move can create space
};
