import {APPLE_COUNT, Cell, CellValues, COLS, ROWS, Scene, SNAKE_LENGTH} from "./constants";

export function nextDirection(previous, next) {
  let isOpposite = (previous: Cell, next: Cell) => {
    return next.x === previous.x * -1 || next.y === previous.y * -1;
  };

  if (isOpposite(previous, next)) {
    return previous;
  }

  return next;
}

export function move(snake, [direction, snakeLength]) {
  let nx = snake[0].x;
  let ny = snake[0].y;

  nx += 1 * direction.x;
  ny += 1 * direction.y;

  let tail;

  if (snakeLength > snake.length) {
    tail = { x: nx, y: ny };
  } else {
    tail = snake.pop();
    tail.x = nx;
    tail.y = ny;
  }

  snake.unshift(tail);

  return snake;
}

export function eat(apples: Array<Cell>, snake) {
  let head = snake[0];

  for (let i = 0; i < apples.length; i++) {
    if (checkCollision(apples[i], head)) {
      apples.splice(i, 1);
      return [...apples, getRandomPosition(snake)];
    }
  }

  return apples;
}

export function generateSnake() {
  let snake: Array<Cell> = [];

  for (let i = SNAKE_LENGTH - 1; i >= 0; i--) {
    snake.push({ x: i, y: 0 , value: CellValues.SNAKE});
  }

  return snake;
}

export function generateApples(): Array<Cell> {
  let apples = [];

  for (let i = 0; i < APPLE_COUNT; i++) {
    apples.push(getRandomPosition([], CellValues.EAT));
  }
  return apples;
}
export function getRandomPosition(snake: Array<Cell> = [], type: CellValues = CellValues.EMPTY): Cell {
  let position = new Cell(getRandomNumber(0, COLS - 1),getRandomNumber(0, ROWS - 1),type);
  if (isEmptyCell(position, snake)) {
    return position;
  }

  return getRandomPosition(snake);
}
export function checkCollision(a, b) {
  return a.x === b.x && a.y === b.y;
}
export function isEmptyCell(position: Cell, snake: Array<Cell>): boolean {
  return !snake.some(segment => checkCollision(segment, position));
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function isGameOver(scene: Scene) {
  let snake = scene.snake;
  let head = snake[0];
  let body = snake.slice(1, snake.length);

  return body.some(segment => checkCollision(segment, head));
}

