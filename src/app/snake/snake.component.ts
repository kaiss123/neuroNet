import {Component} from '@angular/core';
import {BOARD_SIZE, COLORS, GAME_MODES} from "./constants";
import {Snake} from "./snake";
import {Population} from "./population";
import {WorkerService} from "./worker/worker.service";

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class SnakeComponent {

  private default_mode = 'classic';
  private isGameOver = false;
  public all_modes = GAME_MODES;
  public getKeys = Object.keys;
  public obstacles = [];
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public snake: Snake; // snake for replay

  public popuplation: Population;

  constructor(public workerService: WorkerService) {
    this.popuplation = new Population(workerService);
    this.start();
  }

  async start() {
    this.popuplation.start();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    // if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
    //   this.snake.tempDirection = CONTROLS.LEFT;
    // } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
    //   this.snake.tempDirection = CONTROLS.UP;
    // } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
    //   this.snake.tempDirection = CONTROLS.RIGHT;
    // } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
    //   this.snake.tempDirection = CONTROLS.DOWN;
    // }
  }

  setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.popuplation.snakeBest.fruit.x === row && this.popuplation.snakeBest.fruit.y === col) {
      return COLORS.FRUIT;
    } else if (this.popuplation.snakeBest.parts[0].x === row && this.popuplation.snakeBest.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.popuplation.snakeBest.board[col][row] === true) {
      return COLORS.BODY;
    }
    return COLORS.BOARD;
  };

  noWallsTransition(part: any): void {
    if (part.x === BOARD_SIZE) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = BOARD_SIZE - 1;
    }

    if (part.y === BOARD_SIZE) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = BOARD_SIZE - 1;
    }
  }

  // gameOver(): void {
  //   this.isGameOver = true;
  //   this.gameStarted = false;
  //   let me = this;
  //
  //   // if (this.score > this.best_score) {
  //   //   this.bestScoreService.store(this.score);
  //   //   this.best_score = this.score;
  //   //   this.newBestScore = true;
  //   // }
  //
  //   setTimeout(() => {
  //     me.isGameOver = false;
  //   }, 500);
  //
  //   this.setBoard();
  // }

  showMenu(): void {
    //this.showMenuChecker = !this.showMenuChecker;
    this.popuplation.stop = true;
  }

  newGame(mode: string): void {
    this.default_mode = mode || 'classic';
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    // this.score = 0;
    // this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    // this.interval = 150;
    // this.snake = {
    //   direction: CONTROLS.LEFT,
    //   parts: []
    // };
    //
    // for (let i = 0; i < 3; i++) {
    //   this.snake.parts.push({x: 8 + i, y: 8});
    // }
    //
    // this.resetFruit();
    // this.updatePositions();
  }
}
