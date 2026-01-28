export type BlockType = 'big' | 'small';

export interface SmallBlock {
    id: string;
    color: string;
}

export interface BigBlock {
    id: string;
    x: number;
    y: number;
    color: string; // #555555
}

export type GridState = (SmallBlock | null)[][];

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
    x: number;
    y: number;
}