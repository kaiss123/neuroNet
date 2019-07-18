
export const ROWS = 50;
export const COLS = 10;
export const SNAKE_LENGTH = 5;

export const APPLE_COUNT = 2;
export const POINTS_PER_APPLE = 1;

export const SPEED = 200;
export const FPS = 60;

export enum CellValues {
  EMPTY = 0,
  SNAKE = 1,
  EAT = 2
}
export enum Key {
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40
};
export const DIRECTIONS: Directions = {
  38: { x: -1, y: 0 },
  40: { x: 1, y: 0 },
  37: { x: 0, y: -1 },
  39: { x: 0, y: 1 }
};

export interface Directions {
  [key: number]: Cell;
}
export interface Scene {
  snake: Array<Cell>;
  apples: Array<Cell>;
  score: number;
}
export class Cell {
  x: number;
  y: number;
  value?: CellValues;

  constructor(x: number, y: number, value:CellValues = CellValues.EMPTY) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
};
