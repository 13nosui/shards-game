export type BlockType = 'small';

export interface SmallBlock {
    id: string;
    color: string;
}

export type GridState = (SmallBlock | null)[][];

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
    x: number;
    y: number;
}

export interface GameRecord {
    id: string;
    score: number;
    date: string; // ISO string
    grid: GridState; // Snapshot of the final board
}