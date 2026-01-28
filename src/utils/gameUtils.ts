import type { GridState, Point, SmallBlock } from '../types/game';

export const GRID_SIZE = 5;

// p5.js: COLORS definition
export const COLORS = [
    '#FF595E', // Red
    '#1982C4', // Blue
    '#FFCA3A', // Yellow
    '#8AC926'  // Green
];

export const createSmallBlock = (color?: string): SmallBlock => ({
    id: crypto.randomUUID(),
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
});

// --- マッチングロジック (p5.js logic port) ---

const isValid = (x: number, y: number) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

// 縦横（4方向）探索
export const findOrtho = (grid: GridState, startX: number, startY: number, visited: boolean[][]): Point[] => {
    const block = grid[startX][startY];
    if (!block) return [];

    const group: Point[] = [];

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

// 特定セルがマッチに含まれているか
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
                [0, 1], [0, -1], [1, 0], [-1, 0], // Ortho
                [1, 1], [1, -1], [-1, 1], [-1, -1] // Diag
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