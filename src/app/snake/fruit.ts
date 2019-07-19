import {BOARD_SIZE} from "./constants";

export class Fruit {

  x = -1;
  y = -1;

  private board;

  constructor(board) {
    this.board = board;
    this.resetFruit();
  }

  fruitCollision(part: any): boolean {
    return part.x === this.x && part.y === this.y;
  }

  public resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true) {
      return this.resetFruit();
    }
    this.x = x;
    this.y = y;
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

}
